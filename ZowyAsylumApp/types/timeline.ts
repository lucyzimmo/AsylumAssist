export interface JourneyStep {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  progress: number;
  dependencies: string[];
  nextActions: string[];
  deadline?: string;
  daysUntilDeadline?: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requiredDocuments: string[];
  resources: string[];
  notes?: string;
  isLocked: boolean;
}

export interface UserJourney {
  entryDate: string;
  currentPhase: string;
  overallProgress: number;
  steps: JourneyStep[];
  lastUpdated: string;
  personalInfo: {
    hasAttorney: boolean;
    courtDate?: string;
    workPermitEligibleDate?: string;
  };
}

export interface TimelineAlert {
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  deadline?: string;
  daysLeft?: number;
  actionRequired: boolean;
}

export interface DeadlineCalculation {
  oneYearDeadline: string;
  workPermitEligible: string;
  interviewPreparationStart?: string;
  appealDeadline?: string;
  greenCardApplicationEligible?: string;
}

export type TimelinePhase = 'arrival' | 'preparation' | 'application' | 'interview' | 'decision' | 'post-decision';

export interface TimelineEditMode {
  stepId: string;
  fieldName: keyof JourneyStep;
  newValue: any;
}

export interface TimelineFilter {
  showCompleted: boolean;
  phase?: TimelinePhase;
  urgencyLevel?: JourneyStep['urgencyLevel'];
}