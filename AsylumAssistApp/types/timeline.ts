// Legacy interface - kept for backward compatibility
export interface AsylumPhase {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  description: string;
  keyAction: string;
  deadline?: string;
  daysUntilDeadline?: number;
  nextSteps: string[];
  resources: string[];
  isLocked: boolean;
  completedDate?: string;
}

// New timeline step interface for bundle system
export interface TimelineStep {
  id: string;
  bundleId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  completedDate?: string;
  links?: Array<{
    title: string;
    url: string;
    type: 'form' | 'guide' | 'website' | 'status_check';
  }>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  showAfterStep?: string; // Only show after another step is completed
  isEditableDate?: boolean; // Can user edit the due date
  bundleName?: string; // For display purposes
}

export interface TimelineBundle {
  id: string;
  name: string;
  priority: number; // Bundle ordering priority
  steps: TimelineStep[];
}

export interface AsylumTimeline {
  entryDate: string;
  i589FilingDate?: string;
  interviewDate?: string;
  decisionDate?: string;
  caseOutcome?: 'pending' | 'asylum_granted' | 'denied' | 'referred_to_court';
  
  // Bundle-based timeline data
  steps: TimelineStep[];
  activeBundles: string[]; // IDs of currently active bundles
  
  // New display system
  displayCards?: Array<{
    id: string;
    type: 'deadline' | 'eligibility' | 'warning' | 'action' | 'info';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    dueDate?: string;
    links?: Array<{
      title: string;
      url: string;
      type: 'form' | 'guide' | 'website' | 'status_check';
    }>;
  }>;
  warnings?: string[];
  
  // Legacy support - phases derived from steps for backward compatibility
  currentPhase: string;
  phases: AsylumPhase[];
  
  lastUpdated: string;
  questionnaireData?: any; // Store questionnaire responses for bundle evaluation
  
  // Legal Status Information
  asylumProcess: 'affirmative' | 'defensive' | 'unknown';
  hasTPSStatus: boolean;
  tpsExpirationDate?: string;
  tpsCountry?: string;
  hasParoleStatus: boolean;
  paroleExpirationDate?: string;
  inDeportationProceedings: boolean;
  eoirCaseNumber?: string;
  aNumber?: string;
  nextCourtHearing?: string;
  assignedCourt?: string;
  
  // Missed hearing tracking
  missedHearingDate?: string;
  hasMissedHearing?: boolean;
  
  personalInfo: {
    hasAttorney: boolean;
    workPermitEligibleDate?: string;
    oneYearDeadline: string;
    hasOneYearException: boolean;
    exceptionType?: 'tps' | 'parole' | 'extraordinary_circumstances' | 'changed_circumstances';
  };
}

export interface TimelineAlert {
  type: 'info' | 'warning' | 'critical' | 'legal_warning';
  title: string;
  message: string;
  deadline?: string;
  daysLeft?: number;
  actionRequired: boolean;
  phaseId?: string;
  isCourtRelated?: boolean;
  requiresAttorney?: boolean;
}

export interface DeadlineCalculation {
  oneYearDeadline: string;
  workPermitEligible: string;
  interviewPreparationStart?: string;
  appealDeadline?: string;
  greenCardApplicationEligible?: string;
  tpsRecommendedApplyBy?: string;
  tpsLatestApplyBy?: string;
  paroleRecommendedApplyBy?: string;
  motionToReopenDeadline?: string;
}

export type AsylumPhaseType = 
  | 'preparation' 
  | 'application_pending' 
  | 'interview_scheduled' 
  | 'decision_pending' 
  | 'approved' 
  | 'denied';

export interface TimelineEditData {
  entryDate?: string;
  i589FilingDate?: string;
  interviewDate?: string;
  decisionDate?: string;
}

export interface TimelineFilter {
  showCompleted: boolean;
  phase?: AsylumPhaseType;
  bundle?: string; // Filter by bundle ID
  priority?: TimelineStep['priority']; // Filter by priority level
}

// Bundle condition evaluation function type
export type BundleConditionFunction = (questionnaireData: any, timeline?: AsylumTimeline) => boolean;

// Bundle step generator function type
export type BundleStepGenerator = (questionnaireData: any, timeline?: AsylumTimeline) => TimelineStep[];

export interface BundleDefinition {
  id: string;
  name: string;
  description: string;
  priority: number;
  triggerConditions: BundleConditionFunction;
  generateSteps: BundleStepGenerator;
}