import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserJourney, JourneyStep, DeadlineCalculation, TimelineAlert } from '../types/timeline';

const TIMELINE_STORAGE_KEY = '@zowy_timeline';

class TimelineService {
  private userJourney: UserJourney | null = null;

  /**
   * Initialize timeline for a new user
   */
  async initializeTimeline(entryDate: string, hasAttorney: boolean = false): Promise<UserJourney> {
    const deadlines = this.calculateDeadlines(entryDate);
    
    const initialSteps: JourneyStep[] = [
      {
        id: 'arrival',
        title: 'Arrival & Initial Settlement',
        completed: false,
        progress: 0,
        dependencies: [],
        nextActions: [
          'Document your entry date',
          'Find temporary housing',
          'Consult with an attorney if possible'
        ],
        deadline: deadlines.oneYearDeadline,
        daysUntilDeadline: this.calculateDaysUntil(deadlines.oneYearDeadline),
        urgencyLevel: 'medium',
        description: 'Begin settling in the US and preparing for asylum application',
        requiredDocuments: [
          'Passport or travel documents',
          'Evidence of entry date',
          'Any supporting documents from home country'
        ],
        resources: [
          'Legal aid organizations',
          'Community support groups',
          'Translation services'
        ],
        isLocked: false,
      },
      {
        id: 'application',
        title: 'File I-589 Application',
        completed: false,
        progress: 0,
        dependencies: ['arrival'],
        nextActions: [
          'Complete Form I-589',
          'Gather supporting evidence',
          'File application with USCIS'
        ],
        deadline: deadlines.oneYearDeadline,
        daysUntilDeadline: this.calculateDaysUntil(deadlines.oneYearDeadline),
        urgencyLevel: 'critical',
        description: 'File your asylum application within one year of arrival',
        requiredDocuments: [
          'Completed Form I-589',
          'Supporting evidence',
          'Country condition evidence',
          'Medical records (if applicable)'
        ],
        resources: [
          'I-589 form guide',
          'Evidence gathering checklist',
          'Legal assistance'
        ],
        isLocked: true,
      },
      {
        id: 'interview',
        title: 'Asylum Interview',
        completed: false,
        progress: 0,
        dependencies: ['application'],
        nextActions: [
          'Prepare for interview',
          'Review application',
          'Practice testimony'
        ],
        urgencyLevel: 'high',
        description: 'Attend your asylum interview with USCIS',
        requiredDocuments: [
          'All original documents',
          'Translations',
          'Updated evidence'
        ],
        resources: [
          'Interview preparation guide',
          'Mock interview practice',
          'Interpretation services'
        ],
        isLocked: true,
      },
      {
        id: 'work-permit',
        title: 'Work Authorization',
        completed: false,
        progress: 0,
        dependencies: ['application'],
        nextActions: [
          'File Form I-765',
          'Pay filing fee or request fee waiver',
          'Attend biometrics appointment'
        ],
        deadline: deadlines.workPermitEligible,
        daysUntilDeadline: this.calculateDaysUntil(deadlines.workPermitEligible),
        urgencyLevel: 'medium',
        description: 'Apply for work authorization 150 days after filing I-589',
        requiredDocuments: [
          'Form I-765',
          'Copy of I-589 receipt',
          'Identity documents'
        ],
        resources: [
          'I-765 form guide',
          'Fee waiver information',
          'Employment preparation'
        ],
        isLocked: true,
      },
      {
        id: 'decision',
        title: 'Decision & Next Steps',
        completed: false,
        progress: 0,
        dependencies: ['interview'],
        nextActions: [
          'Wait for decision',
          'Review decision carefully',
          'Understand next steps'
        ],
        urgencyLevel: 'low',
        description: 'Receive and understand your asylum decision',
        requiredDocuments: [
          'Decision notice',
          'Any additional requests'
        ],
        resources: [
          'Decision explanation guide',
          'Appeal process information',
          'Green card application guide'
        ],
        isLocked: true,
      }
    ];

    this.userJourney = {
      entryDate,
      currentPhase: 'arrival',
      overallProgress: 0,
      steps: initialSteps,
      lastUpdated: new Date().toISOString(),
      personalInfo: {
        hasAttorney,
        workPermitEligibleDate: deadlines.workPermitEligible,
      }
    };

    await this.saveTimeline();
    return this.userJourney;
  }

  /**
   * Calculate key deadlines based on entry date
   */
  calculateDeadlines(entryDate: string): DeadlineCalculation {
    const entry = new Date(entryDate);
    const oneYear = new Date(entry);
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    const workPermitDate = new Date(entry);
    workPermitDate.setDate(workPermitDate.getDate() + 150);

    return {
      oneYearDeadline: oneYear.toISOString().split('T')[0],
      workPermitEligible: workPermitDate.toISOString().split('T')[0],
    };
  }

  /**
   * Calculate days until a deadline
   */
  calculateDaysUntil(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update step completion status
   */
  async markStepComplete(stepId: string, completed: boolean = true): Promise<boolean> {
    if (!this.userJourney) return false;

    const stepIndex = this.userJourney.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return false;

    const step = this.userJourney.steps[stepIndex];
    step.completed = completed;
    step.completedDate = completed ? new Date().toISOString() : undefined;
    step.progress = completed ? 100 : 0;

    // Unlock dependent steps
    if (completed) {
      this.userJourney.steps.forEach(s => {
        if (s.dependencies.includes(stepId)) {
          s.isLocked = false;
        }
      });
    }

    // Update overall progress
    this.updateOverallProgress();
    
    // Update phase
    this.updateCurrentPhase();

    this.userJourney.lastUpdated = new Date().toISOString();
    await this.saveTimeline();
    return true;
  }

  /**
   * Update step details
   */
  async updateStep(stepId: string, updates: Partial<JourneyStep>): Promise<boolean> {
    if (!this.userJourney) return false;

    const stepIndex = this.userJourney.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return false;

    this.userJourney.steps[stepIndex] = {
      ...this.userJourney.steps[stepIndex],
      ...updates,
    };

    // Recalculate deadlines if entry date changes
    if (updates.deadline) {
      this.userJourney.steps[stepIndex].daysUntilDeadline = 
        this.calculateDaysUntil(updates.deadline);
    }

    this.userJourney.lastUpdated = new Date().toISOString();
    await this.saveTimeline();
    return true;
  }

  /**
   * Get current timeline alerts
   */
  getTimelineAlerts(): TimelineAlert[] {
    if (!this.userJourney) return [];

    const alerts: TimelineAlert[] = [];
    
    this.userJourney.steps.forEach(step => {
      if (step.deadline && !step.completed) {
        const daysLeft = this.calculateDaysUntil(step.deadline);
        
        let alertType: TimelineAlert['type'] = 'info';
        if (daysLeft < 30) alertType = 'critical';
        else if (daysLeft < 90) alertType = 'warning';
        
        alerts.push({
          type: alertType,
          title: `${step.title} Deadline`,
          message: `${daysLeft} days left to complete ${step.title.toLowerCase()}`,
          deadline: step.deadline,
          daysLeft,
          actionRequired: daysLeft < 30,
        });
      }
    });

    return alerts.sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0));
  }

  /**
   * Update overall progress percentage
   */
  private updateOverallProgress(): void {
    if (!this.userJourney) return;

    const totalSteps = this.userJourney.steps.length;
    const completedSteps = this.userJourney.steps.filter(s => s.completed).length;
    
    this.userJourney.overallProgress = Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Update current phase based on completed steps
   */
  private updateCurrentPhase(): void {
    if (!this.userJourney) return;

    const completedSteps = this.userJourney.steps.filter(s => s.completed);
    
    if (completedSteps.some(s => s.id === 'decision')) {
      this.userJourney.currentPhase = 'post-decision';
    } else if (completedSteps.some(s => s.id === 'interview')) {
      this.userJourney.currentPhase = 'decision';
    } else if (completedSteps.some(s => s.id === 'application')) {
      this.userJourney.currentPhase = 'interview';
    } else if (completedSteps.some(s => s.id === 'arrival')) {
      this.userJourney.currentPhase = 'preparation';
    } else {
      this.userJourney.currentPhase = 'arrival';
    }
  }

  /**
   * Save timeline to storage
   */
  async saveTimeline(): Promise<void> {
    if (!this.userJourney) return;
    
    try {
      await AsyncStorage.setItem(
        TIMELINE_STORAGE_KEY, 
        JSON.stringify(this.userJourney)
      );
    } catch (error) {
      console.error('Failed to save timeline:', error);
    }
  }

  /**
   * Load timeline from storage
   */
  async loadTimeline(): Promise<UserJourney | null> {
    try {
      const saved = await AsyncStorage.getItem(TIMELINE_STORAGE_KEY);
      if (saved) {
        this.userJourney = JSON.parse(saved);
        // Recalculate days until deadlines
        this.userJourney?.steps.forEach(step => {
          if (step.deadline) {
            step.daysUntilDeadline = this.calculateDaysUntil(step.deadline);
          }
        });
        return this.userJourney;
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
    return null;
  }

  /**
   * Get current timeline
   */
  getTimeline(): UserJourney | null {
    return this.userJourney;
  }

  /**
   * Reset timeline (for testing/debugging)
   */
  async resetTimeline(): Promise<void> {
    this.userJourney = null;
    await AsyncStorage.removeItem(TIMELINE_STORAGE_KEY);
  }
}

// Export singleton instance
export const timelineService = new TimelineService();
export default timelineService;