import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Navigator - Main app navigation container
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
  
  // Global Modal screens (can be accessed from anywhere)
  DocumentViewer: { 
    documentId: string; 
    documentType: 'passport' | 'i589' | 'i765' | 'other';
    canEdit?: boolean;
  };
  FormViewer: { 
    formId: string; 
    formType: 'i589' | 'i765' | 'i912';
    prefilled?: boolean;
  };
  ResourceDetail: { 
    resourceId: string; 
    category: 'legal-aid' | 'forms' | 'guides' | 'organizations';
  };
  Help: { 
    section?: 'getting-started' | 'forms' | 'documents' | 'timeline' | 'resources' | 'account';
    topic?: string;
  };
  Settings: undefined;
  LanguageSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};

// Authentication Flow
export type AuthStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
  Welcome: undefined; // Keep for legacy/tutorial use
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
  
  // Onboarding Journey Setup
  OnboardingStart: undefined;
  AsylumStatus: undefined;
  ImmigrationStatus: { 
    asylumStatusData?: AsylumStatusData;
  };
  SpecialStatus: { 
    onboardingData?: OnboardingData;
  };
  OnboardingComplete: {
    onboardingData?: CompleteOnboardingData;
  };
  
  // Legacy onboarding screens (may be removed)
  PersonalInformation: { 
    asylumStatus?: any;
    immigrationStatus?: any;
  };
  ContactInformation: { 
    personalInfo?: any;
    asylumStatus?: any;
    immigrationStatus?: any;
  };
  BackgroundInformation: { 
    personalInfo?: any;
    contactInfo?: any;
    asylumStatus?: any;
    immigrationStatus?: any;
  };
  ReviewInformation: { 
    personalInfo?: any;
    contactInfo?: any;
    backgroundInfo?: any;
    asylumStatus?: any;
    immigrationStatus?: any;
  };
};

// Main App Navigation
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  
  // Stack screens that overlay the tab navigator
  TimelineDetail: { 
    stepId: string; 
    stepType: 'deadline' | 'milestone' | 'hearing' | 'submission';
  };
  DocumentEdit: { 
    documentId?: string; 
    documentType: string; 
    isNew?: boolean;
  };

  FormWizard: { 
    formType: 'i589' | 'i765' | 'i912';
    step?: number;
    savedData?: any;
  };
  ResourceSearch: { 
    category?: string; 
    location?: string; 
    query?: string;
  };
  OrganizationDetail: { 
    organizationId: string; 
    location: { lat: number; lng: number };
  };
  AccountSettings: undefined;
  TimelineEditor: undefined;
  DataExport: undefined;
  LegalDisclaimer: undefined;
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Documents: NavigatorScreenParams<DocumentsStackParamList>;
  Resources: NavigatorScreenParams<ResourcesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Tab Stack (Asylum Journey Timeline)
export type HomeStackParamList = {
  Dashboard: undefined;
  Timeline: undefined;
  Calendar: undefined;
  TimelineSetup: { isFirstTime?: boolean };
  DeadlineDetail: { deadlineId: string };
  MilestoneDetail: { milestoneId: string };
  HearingDetail: { hearingId: string };
  StepAction: { 
    stepId: string; 
    actionType: 'complete' | 'reschedule' | 'add-note' | 'upload-document';
  };
  ProgressOverview: undefined;
  NextSteps: undefined;
};

// Documents Tab Stack
export type DocumentsStackParamList = {
  DocumentsList: undefined;

  DocumentCategories: undefined;
  CategoryDetail: { 
    category: 'required' | 'supporting' | 'correspondence' | 'completed';
  };
  ScanDocument: { documentType: string };
  DocumentPreview: { documentId: string };
  DocumentInfo: { documentType: string };
  FormsList: undefined;
  FormDetail: { formId: string };
  FormProgress: { formId: string };
};

// Resources Tab Stack  
export type ResourcesStackParamList = {
  ResourcesHome: undefined;
  LegalAid: { location?: string };
  LegalAidDetail: { organizationId: string };
  Forms: undefined;
  FormDownload: { formId: string };
  Guides: undefined;
  GuideDetail: { guideId: string };
  Organizations: { category?: 'legal' | 'support' | 'community' };
  OrganizationMap: { category?: string; location?: string };
  ResourceBookmarks: undefined;
  ResourceSearch: { query?: string };
  OnlineResources: undefined;
};

// Profile Tab Stack
export type ProfileStackParamList = {
  ProfileHome: undefined;
  AccountDetails: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ChangeEmail: undefined;
  DataManagement: undefined;
  ExportData: undefined;
  DeleteAccount: undefined;
  AppSettings: undefined;
  NotificationPreferences: undefined;
  LanguagePreferences: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  AboutApp: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Feedback: undefined;
};

// Data Types for Navigation Params
export interface AsylumStatusData {
  entryDate: string;
  hasFiledI589: 'yes' | 'no' | 'not-sure';
  i589SubmissionDate?: string;
  filingLocation?: 'uscis' | 'immigration-court' | 'not-sure';
}

export interface ImmigrationStatusData {
  visitedEOIR: 'yes' | 'no';
  hasCase: 'yes' | 'no' | 'not-sure';
  aNumber?: string;
  nextHearingDate?: string;
  assignedCourt?: string;
}

export interface SpecialStatusData {
  hasTPS: 'yes' | 'no' | 'not-sure';
  tpsCountry?: string;
  tpsExpirationDate?: string;
  hasParole: 'yes' | 'no' | 'not-sure';
  paroleType?: string;
  paroleExpirationDate?: string;
  hasWorkPermit: 'yes' | 'no' | 'applied';
  workPermitNumber?: string;
  workPermitExpirationDate?: string;
  hasOtherStatus: 'yes' | 'no';
  otherStatusDescription?: string;
}

export interface OnboardingData extends AsylumStatusData, ImmigrationStatusData {}

export interface CompleteOnboardingData extends OnboardingData, SpecialStatusData {
  setupComplete?: boolean;
  timelineGenerated?: boolean;
  profileCreated?: boolean;
}

// Screen Props Types for easier typing
export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type MainScreenProps<T extends keyof MainStackParamList> = CompositeScreenProps<
  StackScreenProps<MainStackParamList, T>,
  StackScreenProps<RootStackParamList>
>;

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  MainScreenProps<keyof MainStackParamList>
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, T>,
  TabScreenProps<'Home'>
>;

export type DocumentsStackScreenProps<T extends keyof DocumentsStackParamList> = CompositeScreenProps<
  StackScreenProps<DocumentsStackParamList, T>,
  TabScreenProps<'Documents'>
>;

export type ResourcesStackScreenProps<T extends keyof ResourcesStackParamList> = CompositeScreenProps<
  StackScreenProps<ResourcesStackParamList, T>,
  TabScreenProps<'Resources'>
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  StackScreenProps<ProfileStackParamList, T>,
  TabScreenProps<'Profile'>
>;

// Global navigation ref type
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}