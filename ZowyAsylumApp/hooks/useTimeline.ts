import { useState, useEffect, useCallback } from 'react';
import { AsylumTimeline, AsylumPhase, TimelineAlert, TimelineFilter, TimelineEditData, TimelineStep } from '../types/timeline';
import timelineService from '../services/timelineService';

export interface UseTimelineReturn {
  // Data
  timeline: AsylumTimeline | null;
  phases: AsylumPhase[];
  alerts: TimelineAlert[];
  currentPhase: AsylumPhase | null;
  
  // Bundle system data
  steps: TimelineStep[];
  activeBundles: string[];
  
  // State
  loading: boolean;
  error: string | null;
  editMode: boolean;
  
  // Filters
  filter: TimelineFilter;
  setFilter: (filter: Partial<TimelineFilter>) => void;
  
  // Actions
  initializeTimeline: (entryDate: string, hasAttorney?: boolean, questionnaireData?: any) => Promise<boolean>;
  updateTimelineFromQuestionnaire: (questionnaireData: any) => Promise<boolean>;
  updateKeyDates: (updates: TimelineEditData) => Promise<boolean>;
  markPhaseComplete: (phaseId: string) => Promise<boolean>;
  updatePhaseKeyActions: (phaseId: string, keyActions: Record<string, boolean>) => Promise<boolean>;
  getPhaseKeyActions: (phaseId: string) => Record<string, boolean>;
  refreshTimeline: () => Promise<void>;
  enterEditMode: () => void;
  exitEditMode: () => void;
  resetTimeline: () => Promise<void>;
  
  // Step management (new bundle system)
  markStepComplete: (stepId: string) => Promise<boolean>;
  updateStepDueDate: (stepId: string, newDueDate: string) => Promise<boolean>;
  getStepsByBundle: (bundleId: string) => TimelineStep[];
  getOverdueSteps: () => TimelineStep[];
  getUpcomingSteps: (daysAhead?: number) => TimelineStep[];
  
  // EOIR Integration
  updateEOIRCaseInfo: (caseNumber: string, nextHearingDate?: string, assignedCourt?: string) => Promise<boolean>;
  getEOIRAlerts: () => TimelineAlert[];
  requiresImmediateLegalAttention: () => boolean;
  getCourtCaseSummary: () => { hasCourtCase: boolean; caseNumber?: string; nextHearing?: string; assignedCourt?: string; daysUntilHearing?: number; requiresAttorney: boolean; } | null;
  
  // Status and progress  
  getCurrentStatus: () => ReturnType<typeof timelineService.getCurrentStatus>;
  getNextActionablePhase: () => AsylumPhase | null;
  getNextSteps: () => {
    urgent: Array<{ title: string; description: string; actionRequired: boolean }>;
    important: Array<{ title: string; description: string; actionRequired: boolean }>;
    general: Array<{ title: string; description: string; actionRequired: boolean }>;
  };
}

export const useTimeline = (): UseTimelineReturn => {
  const [timeline, setTimeline] = useState<AsylumTimeline | null>(null);
  const [alerts, setAlerts] = useState<TimelineAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilterState] = useState<TimelineFilter>({
    showCompleted: false,
  });

  // Load timeline on mount
  useEffect(() => {
    loadTimeline();
  }, []);

  // Update alerts when timeline changes
  useEffect(() => {
    if (timeline) {
      const currentAlerts = timelineService.getTimelineAlerts();
      setAlerts(currentAlerts);
    }
  }, [timeline]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTimeline = await timelineService.loadTimeline();
      setTimeline(loadedTimeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const initializeTimeline = useCallback(async (entryDate: string, hasAttorney: boolean = false, questionnaireData?: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newTimeline = await timelineService.initializeTimeline(entryDate, hasAttorney, questionnaireData);
      setTimeline(newTimeline);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize timeline');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTimelineFromQuestionnaire = useCallback(async (questionnaireData: any): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updateTimelineFromQuestionnaire(questionnaireData);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timeline from questionnaire');
      return false;
    }
  }, []);

  const updateKeyDates = useCallback(async (updates: TimelineEditData): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updateKeyDates(updates);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timeline');
      return false;
    }
  }, []);

  const markPhaseComplete = useCallback(async (phaseId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.markPhaseComplete(phaseId);
      if (success) {
        // Force a fresh load from storage to ensure state consistency
        const updatedTimeline = await timelineService.loadTimeline();
        setTimeline(updatedTimeline);
        
        // Also update alerts immediately
        if (updatedTimeline) {
          const currentAlerts = timelineService.getTimelineAlerts();
          setAlerts(currentAlerts);
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark phase complete');
      return false;
    }
  }, []);

  const updatePhaseKeyActions = useCallback(async (phaseId: string, keyActions: Record<string, boolean>): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updatePhaseKeyActions(phaseId, keyActions);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key actions');
      return false;
    }
  }, []);

  const getPhaseKeyActions = useCallback((phaseId: string): Record<string, boolean> => {
    return timelineService.getPhaseKeyActions(phaseId);
  }, [timeline]);

  // Step management methods (new bundle system)
  const markStepComplete = useCallback(async (stepId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.markStepComplete(stepId);
      if (success) {
        const updatedTimeline = await timelineService.loadTimeline();
        setTimeline(updatedTimeline);
        
        // Also update alerts immediately
        if (updatedTimeline) {
          const currentAlerts = timelineService.getTimelineAlerts();
          setAlerts(currentAlerts);
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark step complete');
      return false;
    }
  }, []);

  const updateStepDueDate = useCallback(async (stepId: string, newDueDate: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updateStepDueDate(stepId, newDueDate);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step due date');
      return false;
    }
  }, []);

  const getStepsByBundle = useCallback((bundleId: string): TimelineStep[] => {
    return timelineService.getStepsByBundle(bundleId);
  }, [timeline]);

  const getOverdueSteps = useCallback((): TimelineStep[] => {
    return timelineService.getOverdueSteps();
  }, [timeline]);

  const getUpcomingSteps = useCallback((daysAhead?: number): TimelineStep[] => {
    return timelineService.getUpcomingSteps(daysAhead);
  }, [timeline]);

  const refreshTimeline = useCallback(async (): Promise<void> => {
    await loadTimeline();
  }, []);

  const enterEditMode = useCallback(() => {
    setEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
  }, []);

  const resetTimeline = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await timelineService.resetTimeline();
      setTimeline(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset timeline');
    }
  }, []);

  const setFilter = useCallback((newFilter: Partial<TimelineFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Computed values
  const phases = timeline?.phases || [];
  const steps = timeline?.steps || [];
  const activeBundles = timeline?.activeBundles || [];
  
  const filteredPhases = phases.filter(phase => {
    if (!filter.showCompleted && phase.status === 'completed') return false;
    if (filter.phase && phase.id !== filter.phase) return false;
    if (filter.bundle && phase.id !== filter.bundle) return false;
    return true;
  });

  // Filter steps based on current filter settings
  const filteredSteps = steps.filter(step => {
    if (!filter.showCompleted && step.status === 'completed') return false;
    if (filter.bundle && step.bundleId !== filter.bundle) return false;
    if (filter.priority && step.priority !== filter.priority) return false;
    return true;
  });

  const currentPhase = phases.find(phase => phase.status === 'current') || null;

  const getCurrentStatus = useCallback(() => {
    return timelineService.getCurrentStatus();
  }, []);

  const getNextActionablePhase = useCallback((): AsylumPhase | null => {
    return phases.find(phase => phase.status === 'current' || phase.status === 'upcoming') || null;
  }, [phases]);

  // EOIR Integration functions
  const updateEOIRCaseInfo = useCallback(async (caseNumber: string, nextHearingDate?: string, assignedCourt?: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updateEOIRCaseInfo(caseNumber, nextHearingDate, assignedCourt);
      if (success) {
        const updatedTimeline = await timelineService.loadTimeline();
        setTimeline(updatedTimeline);
        
        // Update alerts immediately
        if (updatedTimeline) {
          const currentAlerts = timelineService.getTimelineAlerts();
          const eoirAlerts = timelineService.getEOIRAlerts();
          setAlerts([...currentAlerts, ...eoirAlerts]);
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update EOIR case info');
      return false;
    }
  }, []);

  const getEOIRAlerts = useCallback((): TimelineAlert[] => {
    return timelineService.getEOIRAlerts();
  }, []);

  const requiresImmediateLegalAttention = useCallback((): boolean => {
    return timelineService.requiresImmediateLegalAttention();
  }, []);

  const getCourtCaseSummary = useCallback(() => {
    return timelineService.getCourtCaseSummary();
  }, []);

  const getNextSteps = useCallback(() => {
    return timelineService.getNextSteps();
  }, []);

  return {
    // Data
    timeline,
    phases, // Return all phases, not filtered ones for the dashboard
    alerts,
    currentPhase,
    
    // Bundle system data
    steps,
    activeBundles,
    
    // State
    loading,
    error,
    editMode,
    
    // Filters
    filter,
    setFilter,
    
    // Actions
    initializeTimeline,
    updateTimelineFromQuestionnaire,
    updateKeyDates,
    markPhaseComplete,
    updatePhaseKeyActions,
    getPhaseKeyActions,
    refreshTimeline,
    enterEditMode,
    exitEditMode,
    resetTimeline,
    
    // Step management (new bundle system)
    markStepComplete,
    updateStepDueDate,
    getStepsByBundle,
    getOverdueSteps,
    getUpcomingSteps,
    
    // Status and progress
    getCurrentStatus,
    getNextActionablePhase,
    getNextSteps,
    
    // EOIR Integration
    updateEOIRCaseInfo,
    getEOIRAlerts,
    requiresImmediateLegalAttention,
    getCourtCaseSummary,
  };
};