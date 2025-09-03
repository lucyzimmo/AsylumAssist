import { useState, useEffect, useCallback } from 'react';
import { UserJourney, JourneyStep, TimelineAlert, TimelineFilter } from '../types/timeline';
import timelineService from '../services/timelineService';

export interface UseTimelineReturn {
  // Data
  timeline: UserJourney | null;
  steps: JourneyStep[];
  alerts: TimelineAlert[];
  currentStep: JourneyStep | null;
  
  // State
  loading: boolean;
  error: string | null;
  editMode: boolean;
  
  // Filters
  filter: TimelineFilter;
  setFilter: (filter: Partial<TimelineFilter>) => void;
  
  // Actions
  initializeTimeline: (entryDate: string, hasAttorney?: boolean) => Promise<boolean>;
  markStepComplete: (stepId: string, completed?: boolean) => Promise<boolean>;
  updateStep: (stepId: string, updates: Partial<JourneyStep>) => Promise<boolean>;
  refreshTimeline: () => Promise<void>;
  enterEditMode: () => void;
  exitEditMode: () => void;
  resetTimeline: () => Promise<void>;
  
  // Progress calculations
  getOverallProgress: () => number;
  getPhaseProgress: (phase: string) => number;
  getNextActionableStep: () => JourneyStep | null;
}

export const useTimeline = (): UseTimelineReturn => {
  const [timeline, setTimeline] = useState<UserJourney | null>(null);
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

  const initializeTimeline = useCallback(async (entryDate: string, hasAttorney: boolean = false): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newTimeline = await timelineService.initializeTimeline(entryDate, hasAttorney);
      setTimeline(newTimeline);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize timeline');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const markStepComplete = useCallback(async (stepId: string, completed: boolean = true): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.markStepComplete(stepId, completed);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
      return false;
    }
  }, []);

  const updateStep = useCallback(async (stepId: string, updates: Partial<JourneyStep>): Promise<boolean> => {
    try {
      setError(null);
      const success = await timelineService.updateStep(stepId, updates);
      if (success) {
        const updatedTimeline = timelineService.getTimeline();
        setTimeline(updatedTimeline);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
      return false;
    }
  }, []);

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
  const steps = timeline?.steps || [];
  
  const filteredSteps = steps.filter(step => {
    if (!filter.showCompleted && step.completed) return false;
    if (filter.phase && !step.id.includes(filter.phase)) return false;
    if (filter.urgencyLevel && step.urgencyLevel !== filter.urgencyLevel) return false;
    return true;
  });

  const currentStep = steps.find(step => !step.completed && !step.isLocked) || steps[0] || null;

  const getOverallProgress = useCallback((): number => {
    return timeline?.overallProgress || 0;
  }, [timeline]);

  const getPhaseProgress = useCallback((phase: string): number => {
    if (!timeline) return 0;
    
    const phaseSteps = steps.filter(step => step.id.includes(phase));
    if (phaseSteps.length === 0) return 0;
    
    const completedPhaseSteps = phaseSteps.filter(step => step.completed);
    return Math.round((completedPhaseSteps.length / phaseSteps.length) * 100);
  }, [timeline, steps]);

  const getNextActionableStep = useCallback((): JourneyStep | null => {
    return steps.find(step => !step.completed && !step.isLocked) || null;
  }, [steps]);

  return {
    // Data
    timeline,
    steps: filteredSteps,
    alerts,
    currentStep,
    
    // State
    loading,
    error,
    editMode,
    
    // Filters
    filter,
    setFilter,
    
    // Actions
    initializeTimeline,
    markStepComplete,
    updateStep,
    refreshTimeline,
    enterEditMode,
    exitEditMode,
    resetTimeline,
    
    // Progress calculations
    getOverallProgress,
    getPhaseProgress,
    getNextActionableStep,
  };
};