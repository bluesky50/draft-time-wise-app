'use client';

import type { Task, WorkHours, Topic, Outcome, TaskSet, TaskSetTask, PersonalHours, Note, Activity, Event, Sentiment, CheckIn, Theme, Risk, Question, Want, Desk, Rule, RuleEvent, Observation, TaskSession, Value, PersonalPlan, Decision, WantDependencyGraph, WantDependencyNode, WantValueChain, WantValueChainNode, WantLossGraph, WantLossNode, LifeInputSet, Food, FoodSession, Location, LocationSession, Protocol, TaskType } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { differenceInSeconds } from 'date-fns';

interface TimeStoreState {
  tasks: Task[];
  taskTypes: TaskType[];
  taskSessions: TaskSession[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  workHours: WorkHours;
  personalHours: PersonalHours;
  topics: Topic[];
  outcomes: Outcome[];
  taskSets: TaskSet[];
  notes: Note[];
  questions: Question[];
  wants: Want[];
  rules: Rule[];
  ruleEvents: RuleEvent[];
  activities: Activity[];
  events: Event[];
  sentiments: Sentiment[];
  checkIns: CheckIn[];
  themes: Theme[];
  risks: Risk[];
  observations: Observation[];
  values: Value[];
  personalPlans: PersonalPlan[];
  decisions: Decision[];
  wantDependencyGraphs: WantDependencyGraph[];
  wantValueChains: WantValueChain[];
  wantLossGraphs: WantLossGraph[];
  lifeInputSets: LifeInputSet[];
  foods: Food[];
  foodSessions: FoodSession[];
  locations: Location[];
  locationSessions: LocationSession[];
  protocols: Protocol[];
  desk: Desk;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTaskType: (taskType: Omit<TaskType, 'id' | 'createdAt'>) => void;
  updateTaskType: (taskType: TaskType) => void;
  deleteTaskType: (id: string) => void;
  addSession: (session: Omit<TaskSession, 'id' | 'createdAt'>) => void;
  updateSession: (session: TaskSession) => void;
  deleteSession: (id: string) => void;
  updateWorkHours: (hours: WorkHours) => void;
  updatePersonalHours: (hours: PersonalHours) => void;
  addTopic: (topic: Omit<Topic, 'id'>) => void;
  deleteTopic: (id: string) => void;
  addOutcome: (outcome: Omit<Outcome, 'id' | 'createdAt' | 'completedDate'>) => void;
  updateOutcome: (outcome: Outcome) => void;
  deleteOutcome: (id: string) => void;
  toggleOutcome: (id: string) => void;
  addTaskSet: (taskSet: Omit<TaskSet, 'id'>) => void;
  updateTaskSet: (taskSet: TaskSet) => void;
  deleteTaskSet: (id: string) => void;
  applyTaskSet: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (id: string) => void;
  addWant: (want: Omit<Want, 'id' | 'createdAt'>) => void;
  updateWant: (want: Want) => void;
  deleteWant: (id: string) => void;
  addRule: (rule: Omit<Rule, 'id' | 'createdAt'>) => void;
  updateRule: (rule: Rule) => void;
  deleteRule: (id: string) => void;
  addRuleEvent: (ruleEvent: Omit<RuleEvent, 'id' | 'createdAt'>) => void;
  toggleTaskTracking: (id: string) => void;
  resetTaskTime: (id: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addSentiment: (sentiment: Omit<Sentiment, 'id' | 'createdAt'>) => void;
  updateSentiment: (sentiment: Sentiment) => void;
  deleteSentiment: (id: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => void;
  updateCheckIn: (checkIn: CheckIn) => void;
  deleteCheckIn: (id: string) => void;
  addTheme: (theme: Omit<Theme, 'id' | 'createdAt'>) => void;
  updateTheme: (theme: Theme) => void;
  deleteTheme: (id: string) => void;
  addRisk: (risk: Omit<Risk, 'id' | 'createdAt'>) => void;
  updateRisk: (risk: Risk) => void;
  deleteRisk: (id: string) => void;
  createActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  updateDesk: (desk: Partial<Desk>) => void;
  addObservation: (observation: Omit<Observation, 'id' | 'createdAt'>) => void;
  updateObservation: (observation: Observation) => void;
  deleteObservation: (id: string) => void;
  addValue: (value: Omit<Value, 'id'>) => void;
  updateValue: (value: Value) => void;
  deleteValue: (id: string) => void;
  addPersonalPlan: (plan: Omit<PersonalPlan, 'id' | 'createdAt'>) => void;
  deletePersonalPlan: (id: string) => void;
  addDecision: (decision: Omit<Decision, 'id' | 'createdAt'>) => void;
  updateDecision: (decision: Decision) => void;
  deleteDecision: (id: string) => void;
  addWantDependencyGraph: (title: string, description: string, rootWant: string) => WantDependencyGraph;
  addWantDependencyGraphNode: (graphId: string, value: string, parentId: string, rating: number) => void;
  updateWantDependencyGraphNode: (graphId: string, nodeId: string, newValue: string) => void;
  addWantValueChain: (title: string, description: string, rootWant: string) => WantValueChain;
  addWantValueChainNode: (graphId: string, value: string, parentId: string) => void;
  updateWantValueChainNode: (graphId: string, nodeId: string, newValue: string) => void;
  addWantLossGraph: (title: string, description: string, rootWant: string) => WantLossGraph;
  addWantLossGraphNode: (graphId: string, value: string, parentId: string) => void;
  updateWantLossGraphNode: (graphId: string, nodeId: string, newValue: string) => void;
  addLifeInputSet: (set: Omit<LifeInputSet, 'id' | 'createdAt'>) => LifeInputSet;
  updateLifeInputSet: (set: LifeInputSet) => void;
  addFood: (food: Omit<Food, 'id' | 'createdAt'>) => void;
  updateFood: (food: Food) => void;
  deleteFood: (id: string) => void;
  addFoodSession: (session: Omit<FoodSession, 'id' | 'createdAt'>) => void;
  addLocation: (location: Omit<Location, 'id' | 'createdAt'>) => void;
  updateLocation: (location: Location) => void;
  deleteLocation: (id: string) => void;
  addLocationSession: (session: Omit<LocationSession, 'id' | 'createdAt'>) => void;
  addProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => void;
  updateProtocol: (protocol: Protocol) => void;
  deleteProtocol: (id: string) => void;
}

const TimeStoreContext = createContext<TimeStoreState | undefined>(undefined);

export const TimeStoreProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [taskSessions, setTaskSessions] = useState<TaskSession[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [taskSets, setTaskSets] = useState<TaskSet[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wants, setWants] = useState<Want[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleEvents, setRuleEvents] = useState<RuleEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sentiments, setSentiments] = useState<Sentiment[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [personalPlans, setPersonalPlans] = useState<PersonalPlan[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [wantDependencyGraphs, setWantDependencyGraphs] = useState<WantDependencyGraph[]>([]);
  const [wantValueChains, setWantValueChains] = useState<WantValueChain[]>([]);
  const [wantLossGraphs, setWantLossGraphs] = useState<WantLossGraph[]>([]);
  const [lifeInputSets, setLifeInputSets] = useState<LifeInputSet[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodSessions, setFoodSessions] = useState<FoodSession[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationSessions, setLocationSessions] = useState<LocationSession[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours>({ start: '09:00', end: '17:00', workDays: [1, 2, 3, 4, 5] });
  const [personalHours, setPersonalHours] = useState<PersonalHours>({ wake: '07:00', sleep: '23:00', taskTimeWarningThreshold: 80, workTimeUtilizationSuccessThreshold: 80, personalTimeUtilizationSuccessThreshold: 20 });
  const [desk, setDesk] = useState<Desk>({ 
    selectedOutcomes: [], 
    selectedNotes: [],
    selectedQuestions: [],
    selectedRisks: [], 
    selectedWants: [], 
    selectedThemes: [], 
    selectedRules: [],
    excludedOutcomeIdsForEfficiency: [],
    showFocusTime: true,
    showRecentTaskSessions: true,
    showNoteReminders: true,
    showQuestionReminders: true,
    showThemeReminders: true,
    showWantReminders: false,
    showRiskReminders: false,
    showRuleReminders: false,
    logActivities: true,
    floatingNav: false,
  });
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
    try {
      const storedTasks = localStorage.getItem('timeflow-tasks');
      if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          // Migration from old Task format
          if (parsedTasks.length > 0 && 'timeSpent' in parsedTasks[0]) {
              const { newTasks, newSessions } = migrateTasksToSessions(parsedTasks);
              setTasks(newTasks);
              setTaskSessions(newSessions);
          } else {
              setTasks(parsedTasks);
          }
      }

      const storedTaskTypes = localStorage.getItem('timeflow-task-types');
      if (storedTaskTypes) setTaskTypes(JSON.parse(storedTaskTypes));

      const storedSessions = localStorage.getItem('timeflow-task-sessions');
      if (storedSessions) {
          // Check if tasks were already migrated, if so, this will overwrite
          const sessions = JSON.parse(storedSessions);
          if (sessions.length > 0) {
              setTaskSessions(sessions);
          }
      }

      const storedTopics = localStorage.getItem('timeflow-topics');
      if (storedTopics) setTopics(JSON.parse(storedTopics));
      
      const storedOutcomes = localStorage.getItem('timeflow-outcomes');
      if (storedOutcomes) setOutcomes(JSON.parse(storedOutcomes));
      
      const storedTaskSets = localStorage.getItem('timeflow-task-sets');
      if (storedTaskSets) setTaskSets(JSON.parse(storedTaskSets));
      
      const storedNotes = localStorage.getItem('timeflow-notes');
      if (storedNotes) setNotes(JSON.parse(storedNotes));

      const storedQuestions = localStorage.getItem('timeflow-questions');
      if (storedQuestions) setQuestions(JSON.parse(storedQuestions));

      const storedWants = localStorage.getItem('timeflow-wants');
      if (storedWants) setWants(JSON.parse(storedWants));
      
      const storedRules = localStorage.getItem('timeflow-rules');
      if (storedRules) setRules(JSON.parse(storedRules));

      const storedRuleEvents = localStorage.getItem('timeflow-rule-events');
      if (storedRuleEvents) setRuleEvents(JSON.parse(storedRuleEvents));

      const storedActivities = localStorage.getItem('timeflow-activities');
      if (storedActivities) setActivities(JSON.parse(storedActivities));

      const storedEvents = localStorage.getItem('timeflow-events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((e: any) => {
          if (e.date) { // Migration from old format
            return {
              ...e,
              startTime: e.date,
              endTime: e.date,
              tags: e.tags || [],
              category: e.category || 'General',
              type: e.type || 'Event'
            };
          }
          return e;
        });
        setEvents(parsedEvents);
      }
      
      const storedSentiments = localStorage.getItem('timeflow-sentiments');
      if (storedSentiments) setSentiments(JSON.parse(storedSentiments));

      const storedCheckIns = localStorage.getItem('timeflow-checkins');
      if (storedCheckIns) setCheckIns(JSON.parse(storedCheckIns));
      
      const storedWorkHours = localStorage.getItem('timeflow-work-hours');
      if (storedWorkHours) {
        const parsed = JSON.parse(storedWorkHours);
        setWorkHours({
          start: '09:00',
          end: '17:00',
          workDays: [1, 2, 3, 4, 5],
          ...parsed
        });
      }
      
      const storedPersonalHours = localStorage.getItem('timeflow-personal-hours');
      if (storedPersonalHours) {
        const parsed = JSON.parse(storedPersonalHours);
        setPersonalHours({
            ...parsed,
            taskTimeWarningThreshold: parsed.taskTimeWarningThreshold || 80,
            workTimeUtilizationSuccessThreshold: parsed.workTimeUtilizationSuccessThreshold || 80,
            personalTimeUtilizationSuccessThreshold: parsed.personalTimeUtilizationSuccessThreshold || 20,
        });
      }

      const storedThemes = localStorage.getItem('timeflow-themes');
      if (storedThemes) setThemes(JSON.parse(storedThemes));

      const storedRisks = localStorage.getItem('timeflow-risks');
      if (storedRisks) setRisks(JSON.parse(storedRisks));
      
      const storedObservations = localStorage.getItem('timeflow-observations');
      if (storedObservations) setObservations(JSON.parse(storedObservations));

      const storedValues = localStorage.getItem('timeflow-values');
      if (storedValues) setValues(JSON.parse(storedValues));

      const storedPersonalPlans = localStorage.getItem('timeflow-personal-plans');
      if (storedPersonalPlans) setPersonalPlans(JSON.parse(storedPersonalPlans));
      
      const storedDecisions = localStorage.getItem('timeflow-decisions');
      if (storedDecisions) setDecisions(JSON.parse(storedDecisions));
      
      const storedWantDependencyGraphs = localStorage.getItem('timeflow-want-dependency-graphs');
      if (storedWantDependencyGraphs) setWantDependencyGraphs(JSON.parse(storedWantDependencyGraphs));

      const storedWantValueChains = localStorage.getItem('timeflow-want-value-chains');
      if (storedWantValueChains) setWantValueChains(JSON.parse(storedWantValueChains));
      
      const storedWantLossGraphs = localStorage.getItem('timeflow-want-loss-graphs');
      if (storedWantLossGraphs) setWantLossGraphs(JSON.parse(storedWantLossGraphs));
      
      const storedLifeInputSets = localStorage.getItem('timeflow-life-input-sets');
      if (storedLifeInputSets) setLifeInputSets(JSON.parse(storedLifeInputSets));
      
      const storedFoods = localStorage.getItem('timeflow-foods');
      if (storedFoods) setFoods(JSON.parse(storedFoods));
      
      const storedFoodSessions = localStorage.getItem('timeflow-food-sessions');
      if (storedFoodSessions) setFoodSessions(JSON.parse(storedFoodSessions));
      
      const storedLocations = localStorage.getItem('timeflow-locations');
      if (storedLocations) setLocations(JSON.parse(storedLocations));
      
      const storedLocationSessions = localStorage.getItem('timeflow-location-sessions');
      if (storedLocationSessions) setLocationSessions(JSON.parse(storedLocationSessions));
      
      const storedProtocols = localStorage.getItem('timeflow-protocols');
      if (storedProtocols) setProtocols(JSON.parse(storedProtocols));

      const storedDesk = localStorage.getItem('timeflow-desk');
      if (storedDesk) {
          const parsedDesk = JSON.parse(storedDesk);
          setDesk(prev => ({ ...prev, ...parsedDesk }));
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  // Helper for one-time migration of old tasks
  const migrateTasksToSessions = (oldTasks: any[]): { newTasks: Task[], newSessions: TaskSession[] } => {
    const newTasks: Task[] = [];
    const newSessions: TaskSession[] = [];
    oldTasks.forEach(oldTask => {
      const { timeSpent, isTracking, ...restOfTask } = oldTask;
      newTasks.push(restOfTask);
      if (timeSpent > 0) {
        newSessions.push({
          id: crypto.randomUUID(),
          taskId: oldTask.id,
          startTime: oldTask.createdAt,
          endTime: oldTask.createdAt + (timeSpent * 1000), // Approximate end time
          createdAt: oldTask.createdAt,
        });
      }
    });
    toast({
        title: "Data Migration",
        description: "Your time tracking data has been updated to a new format."
    });
    return { newTasks, newSessions };
  };

  const createActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    if (!desk.logActivities) return;
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
  }, [desk.logActivities]);
  
  // Effect for syncing data to local storage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('timeflow-tasks', JSON.stringify(tasks));
      localStorage.setItem('timeflow-task-types', JSON.stringify(taskTypes));
      localStorage.setItem('timeflow-task-sessions', JSON.stringify(taskSessions));
      localStorage.setItem('timeflow-topics', JSON.stringify(topics));
      localStorage.setItem('timeflow-outcomes', JSON.stringify(outcomes));
      localStorage.setItem('timeflow-task-sets', JSON.stringify(taskSets));
      localStorage.setItem('timeflow-notes', JSON.stringify(notes));
      localStorage.setItem('timeflow-questions', JSON.stringify(questions));
      localStorage.setItem('timeflow-wants', JSON.stringify(wants));
      localStorage.setItem('timeflow-rules', JSON.stringify(rules));
      localStorage.setItem('timeflow-rule-events', JSON.stringify(ruleEvents));
      localStorage.setItem('timeflow-activities', JSON.stringify(activities));
      localStorage.setItem('timeflow-events', JSON.stringify(events));
      localStorage.setItem('timeflow-sentiments', JSON.stringify(sentiments));
      localStorage.setItem('timeflow-checkins', JSON.stringify(checkIns));
      localStorage.setItem('timeflow-work-hours', JSON.stringify(workHours));
      localStorage.setItem('timeflow-personal-hours', JSON.stringify(personalHours));
      localStorage.setItem('timeflow-themes', JSON.stringify(themes));
      localStorage.setItem('timeflow-risks', JSON.stringify(risks));
      localStorage.setItem('timeflow-observations', JSON.stringify(observations));
      localStorage.setItem('timeflow-values', JSON.stringify(values));
      localStorage.setItem('timeflow-personal-plans', JSON.stringify(personalPlans));
      localStorage.setItem('timeflow-decisions', JSON.stringify(decisions));
      localStorage.setItem('timeflow-want-dependency-graphs', JSON.stringify(wantDependencyGraphs));
      localStorage.setItem('timeflow-want-value-chains', JSON.stringify(wantValueChains));
      localStorage.setItem('timeflow-want-loss-graphs', JSON.stringify(wantLossGraphs));
      localStorage.setItem('timeflow-life-input-sets', JSON.stringify(lifeInputSets));
      localStorage.setItem('timeflow-foods', JSON.stringify(foods));
      localStorage.setItem('timeflow-food-sessions', JSON.stringify(foodSessions));
      localStorage.setItem('timeflow-locations', JSON.stringify(locations));
      localStorage.setItem('timeflow-location-sessions', JSON.stringify(locationSessions));
      localStorage.setItem('timeflow-protocols', JSON.stringify(protocols));
      localStorage.setItem('timeflow-desk', JSON.stringify(desk));
    }
  }, [tasks, taskTypes, taskSessions, topics, outcomes, taskSets, notes, questions, wants, rules, ruleEvents, activities, events, sentiments, checkIns, workHours, personalHours, themes, risks, observations, values, personalPlans, decisions, wantDependencyGraphs, wantValueChains, wantLossGraphs, lifeInputSets, foods, foodSessions, locations, locationSessions, protocols, desk, isClient]);

  // Effect for logging activities based on state changes
  useEffect(() => {
    const previousTasks = JSON.parse(localStorage.getItem('timeflow-tasks-previous') || '[]');

    tasks.forEach(task => {
      const prevTask = previousTasks.find((pt: Task) => pt.id === task.id);
      if (prevTask && !prevTask.completed && task.completed) {
        createActivity({ type: 'TASK_COMPLETED', description: `Completed task: "${task.description}"` });
      }
    });

    localStorage.setItem('timeflow-tasks-previous', JSON.stringify(tasks));
  }, [tasks, createActivity]);
  
  // Centralized timer effect for active session
  useEffect(() => {
    const activeSession = taskSessions.find(s => s.endTime === null);
    if (activeSession) {
        const interval = setInterval(() => {
            // This just triggers a re-render, the actual time is calculated on the fly
            setTasks(prevTasks => [...prevTasks]); 
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [taskSessions]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
    };
    createActivity({ type: 'TASK_CREATED', description: `Created task: "${newTask.description}"`, link: '/tasks' });
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, [createActivity]);
  
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? {...t, ...updatedTask} : t));
    createActivity({ type: 'TASK_UPDATED', description: `Updated task: "${updatedTask.description}"`, link: '/tasks' });
  }, [createActivity]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
     // Stop tracking if task is completed
    setTaskSessions(prev => prev.map(s => s.taskId === id && s.endTime === null ? {...s, endTime: Date.now()} : s));
  }, []);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
        createActivity({ type: 'TASK_DELETED', description: `Deleted task: "${taskToDelete.description}"`});
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    setTaskSessions(prevSessions => prevSessions.filter(session => session.taskId !== id));
  }, [tasks, createActivity]);

  const addTaskType = useCallback((taskType: Omit<TaskType, 'id' | 'createdAt'>) => {
    const newTaskType: TaskType = {
      ...taskType,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTaskTypes(prev => [newTaskType, ...prev]);
    createActivity({ type: 'TASK_TYPE_CREATED', description: `Created task type: "${newTaskType.title}"`, link: '/task-types' });
  }, [createActivity]);

  const updateTaskType = useCallback((updatedTaskType: TaskType) => {
    setTaskTypes(prev => prev.map(t => t.id === updatedTaskType.id ? updatedTaskType : t));
    createActivity({ type: 'TASK_TYPE_UPDATED', description: `Updated task type: "${updatedTaskType.title}"`, link: '/task-types' });
  }, [createActivity]);

  const deleteTaskType = useCallback((id: string) => {
    const toDelete = taskTypes.find(t => t.id === id);
    if (toDelete) {
        createActivity({ type: 'TASK_TYPE_DELETED', description: `Deleted task type: "${toDelete.title}"`});
    }
    setTaskTypes(prev => prev.filter(t => t.id !== id));
    setTasks(prevTasks => prevTasks.map(t => t.typeId === id ? {...t, typeId: undefined} : t));
  }, [taskTypes, createActivity]);

  const addSession = useCallback((session: Omit<TaskSession, 'id' | 'createdAt'>) => {
    const newSession = { ...session, id: crypto.randomUUID(), createdAt: Date.now() };
    setTaskSessions(prev => [newSession, ...prev]);
    createActivity({ type: 'TASK_SESSION_CREATED', description: 'Manually added a task session.' });
  }, [createActivity]);

  const updateSession = useCallback((updatedSession: TaskSession) => {
    setTaskSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    createActivity({ type: 'TASK_SESSION_UPDATED', description: 'Updated a task session.' });
  }, [createActivity]);

  const deleteSession = useCallback((id: string) => {
    setTaskSessions(prev => prev.filter(s => s.id !== id));
    createActivity({ type: 'TASK_SESSION_DELETED', description: 'Deleted a task session.' });
  }, [createActivity]);
  
  const toggleTaskTracking = useCallback((taskId: string) => {
    setTaskSessions(prevSessions => {
        const now = Date.now();
        const currentlyTrackingSession = prevSessions.find(s => s.endTime === null);
        const taskToToggle = tasks.find(t => t.id === taskId);
        
        if (!taskToToggle) return prevSessions;

        // If we are stopping the current task
        if (currentlyTrackingSession && currentlyTrackingSession.taskId === taskId) {
            createActivity({ type: 'TASK_TRACKING_STOP', description: `Stopped tracking: "${taskToToggle.description}"`, link: '/tracking' });
            return prevSessions.map(s => s.id === currentlyTrackingSession.id ? { ...s, endTime: now } : s);
        }

        let newSessions = [...prevSessions];
        // If we are stopping another task to start this one
        if (currentlyTrackingSession) {
            const previouslyTrackedTask = tasks.find(t => t.id === currentlyTrackingSession.taskId);
             if (previouslyTrackedTask) {
                createActivity({ type: 'TASK_TRACKING_STOP', description: `Stopped tracking: "${previouslyTrackedTask.description}"`, link: '/tracking' });
            }
            newSessions = newSessions.map(s => s.id === currentlyTrackingSession.id ? { ...s, endTime: now } : s);
        }
        
        // Start tracking the new task
        createActivity({ type: 'TASK_TRACKING_START', description: `Started tracking: "${taskToToggle.description}"`, link: '/tracking' });
        const newSession: TaskSession = {
            id: crypto.randomUUID(),
            taskId,
            startTime: now,
            endTime: null,
            createdAt: now,
        };
        newSessions.push(newSession);

        return newSessions;
    });
  }, [tasks, createActivity]);

  const updateWorkHours = useCallback((hours: WorkHours) => {
    setWorkHours(hours);
    createActivity({ type: 'PARAMETERS_UPDATED', description: 'Updated work hours parameters.', link: '/parameters' });
  }, [createActivity]);

  const updatePersonalHours = useCallback((hours: PersonalHours) => {
    setPersonalHours(hours);
     createActivity({ type: 'PARAMETERS_UPDATED', description: 'Updated personal time parameters.', link: '/parameters' });
  }, [createActivity]);
  
  const addTopic = useCallback((topic: Omit<Topic, 'id'>) => {
    const newTopic: Topic = {
      ...topic,
      id: crypto.randomUUID(),
    };
    setTopics(prevTopics => [newTopic, ...prevTopics]);
    createActivity({ type: 'TOPIC_CREATED', description: `Created topic: "${newTopic.title}"`, link: '/topics' });
  }, [createActivity]);

  const deleteTopic = useCallback((id: string) => {
    const topicToDelete = topics.find(t => t.id === id);
    if(topicToDelete) {
        createActivity({ type: 'TOPIC_DELETED', description: `Deleted topic: "${topicToDelete.title}"`});
    }
    setTopics(prevTopics => prevTopics.filter(topic => topic.id !== id));
    setTasks(prevTasks => prevTasks.map(t => t.topicId === id ? {...t, topicId: undefined} : t));
    setNotes(prevNotes => prevNotes.map(n => n.topicId === id ? {...n, topicId: undefined} : n));
    setQuestions(prevQuestions => prevQuestions.map(q => q.topicId === id ? {...q, topicId: undefined} : q));
    setRules(prevRules => prevRules.map(r => r.topicId === id ? {...r, topicId: undefined} : r));
  }, [topics, createActivity]);

  const addOutcome = useCallback((outcome: Omit<Outcome, 'id' | 'createdAt' | 'completedDate'>) => {
    const newOutcome: Outcome = {
      ...outcome,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completedDate: null,
    };
    setOutcomes(prevOutcomes => [newOutcome, ...prevOutcomes]);
    createActivity({ type: 'OUTCOME_CREATED', description: `Created outcome: "${newOutcome.title}"`, link: '/outcomes' });
  }, [createActivity]);

  const updateOutcome = useCallback((updatedOutcome: Outcome) => {
    setOutcomes(prev => prev.map(o => o.id === updatedOutcome.id ? updatedOutcome : o));
    createActivity({ type: 'OUTCOME_UPDATED', description: `Updated outcome: "${updatedOutcome.title}"`, link: '/outcomes' });
    toast({
        title: "Outcome Updated",
        description: `"${updatedOutcome.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteOutcome = useCallback((id: string) => {
    const outcomeToDelete = outcomes.find(o => o.id === id);
    if (outcomeToDelete) {
        createActivity({ type: 'OUTCOME_DELETED', description: `Deleted outcome: "${outcomeToDelete.title}"` });
    }
    setOutcomes(prevOutcomes => prevOutcomes.filter(outcome => outcome.id !== id));
    setTasks(prevTasks => prevTasks.map(t => t.outcomeId === id ? {...t, outcomeId: undefined} : t));
  }, [outcomes, createActivity]);

  const toggleOutcome = useCallback((id: string) => {
    setOutcomes(prevOutcomes =>
      prevOutcomes.map(outcome => {
        if (outcome.id === id) {
          const wasCompleted = !!outcome.completedDate;
          const updatedOutcome = { ...outcome, completedDate: wasCompleted ? null : Date.now() };
           if (!wasCompleted && updatedOutcome.completedDate) {
            createActivity({ 
              type: 'OUTCOME_COMPLETED', 
              description: `Completed outcome: "${updatedOutcome.title}"`,
              link: '/outcomes'
            });
          }
          return updatedOutcome;
        }
        return outcome;
      })
    );
  }, [createActivity]);

  const addTaskSet = useCallback((taskSet: Omit<TaskSet, 'id'>) => {
    const newTaskSet: TaskSet = {
        ...taskSet,
        id: crypto.randomUUID(),
    };
    setTaskSets(prev => [newTaskSet, ...prev]);
    createActivity({ type: 'TASKSET_CREATED', description: `Created task set: "${newTaskSet.title}"`, link: '/task-sets' });
  }, [createActivity]);
  
  const updateTaskSet = useCallback((updatedTaskSet: TaskSet) => {
    setTaskSets(prev => prev.map(ts => ts.id === updatedTaskSet.id ? updatedTaskSet : ts));
    createActivity({ type: 'TASKSET_UPDATED', description: `Updated task set: "${updatedTaskSet.title}"`, link: '/task-sets' });
    toast({
        title: "Task Set Updated",
        description: `"${updatedTaskSet.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteTaskSet = useCallback((id: string) => {
      const taskSetToDelete = taskSets.find(ts => ts.id === id);
      if (taskSetToDelete) {
          createActivity({ type: 'TASKSET_DELETED', description: `Deleted task set: "${taskSetToDelete.title}"`});
      }
      setTaskSets(prev => prev.filter(ts => ts.id !== id));
  }, [taskSets, createActivity]);

  const applyTaskSet = useCallback((id: string) => {
    const taskSet = taskSets.find(ts => ts.id === id);
    if (taskSet) {
        const newTasks: Omit<Task, 'id' | 'completed' | 'createdAt'>[] = taskSet.tasks.map(t => ({
            ...t,
        }));
        newTasks.forEach(addTask)
        createActivity({ type: 'TASKSET_APPLIED', description: `Applied task set: "${taskSet.title}"`, link: '/task-sets' });
        toast({
            title: "Task Set Applied",
            description: `${newTasks.length} tasks from "${taskSet.title}" have been added to your list.`,
        });
    }
  }, [taskSets, toast, createActivity, addTask]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    createActivity({ type: 'NOTE_CREATED', description: `Created new note: "${newNote.title}"`, link: `/notes/${newNote.id}` });
  }, [createActivity]);

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    createActivity({ type: 'NOTE_UPDATED', description: `Updated note: "${updatedNote.title}"`, link: `/notes/${updatedNote.id}` });
    toast({
      title: "Note Updated",
      description: `"${updatedNote.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteNote = useCallback((id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if(noteToDelete) {
        createActivity({ type: 'NOTE_DELETED', description: `Deleted note: "${noteToDelete.title}"` });
    }
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [notes, createActivity]);
  
  const addQuestion = useCallback((question: Omit<Question, 'id' | 'createdAt'>) => {
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setQuestions(prev => [newQuestion, ...prev]);
    createActivity({ type: 'QUESTION_CREATED', description: `Created new question: "${newQuestion.title}"`, link: `/questions/${newQuestion.id}` });
  }, [createActivity]);

  const updateQuestion = useCallback((updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    createActivity({ type: 'QUESTION_UPDATED', description: `Updated question: "${updatedQuestion.title}"`, link: `/questions/${updatedQuestion.id}` });
    toast({
      title: "Question Updated",
      description: `"${updatedQuestion.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteQuestion = useCallback((id: string) => {
    const questionToDelete = questions.find(q => q.id === id);
    if(questionToDelete) {
        createActivity({ type: 'QUESTION_DELETED', description: `Deleted question: "${questionToDelete.title}"` });
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, [questions, createActivity]);

  const addWant = useCallback((want: Omit<Want, 'id' | 'createdAt'>) => {
    const newWant: Want = {
      ...want,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setWants(prev => [newWant, ...prev]);
    createActivity({ type: 'WANT_CREATED', description: `Created new want: "${newWant.title}"`, link: `/wants/${newWant.id}` });
  }, [createActivity]);

  const updateWant = useCallback((updatedWant: Want) => {
    setWants(prev => prev.map(w => w.id === updatedWant.id ? updatedWant : w));
    createActivity({ type: 'WANT_UPDATED', description: `Updated want: "${updatedWant.title}"`, link: `/wants/${updatedWant.id}` });
    toast({
      title: "Want Updated",
      description: `"${updatedWant.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteWant = useCallback((id: string) => {
    const wantToDelete = wants.find(w => w.id === id);
    if(wantToDelete) {
        createActivity({ type: 'WANT_DELETED', description: `Deleted want: "${wantToDelete.title}"` });
    }
    setWants(prev => prev.filter(w => w.id !== id));
  }, [wants, createActivity]);

  const addRule = useCallback((rule: Omit<Rule, 'id' | 'createdAt'>) => {
    const newRule: Rule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setRules(prev => [newRule, ...prev]);
    createActivity({ type: 'RULE_CREATED', description: `Created new rule: "${newRule.title}"`, link: `/rules` });
  }, [createActivity]);

  const updateRule = useCallback((updatedRule: Rule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    createActivity({ type: 'RULE_UPDATED', description: `Updated rule: "${updatedRule.title}"`, link: `/rules` });
    toast({
      title: "Rule Updated",
      description: `"${updatedRule.title}" has been updated.`,
    });
  }, [toast, createActivity]);

  const deleteRule = useCallback((id: string) => {
    const ruleToDelete = rules.find(r => r.id === id);
    if(ruleToDelete) {
        createActivity({ type: 'RULE_DELETED', description: `Deleted rule: "${ruleToDelete.title}"` });
    }
    setRules(prev => prev.filter(r => r.id !== id));
  }, [rules, createActivity]);

  const addRuleEvent = useCallback((ruleEvent: Omit<RuleEvent, 'id' | 'createdAt'>) => {
    const newRuleEvent: RuleEvent = {
        ...ruleEvent,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };
    setRuleEvents(prev => [newRuleEvent, ...prev]);
    const rule = rules.find(r => r.id === ruleEvent.ruleId);
    if (rule) {
        createActivity({ type: 'RULE_EVENT_LOGGED', description: `Logged '${ruleEvent.status}' for rule: "${rule.title}"`, link: '/rule-summary' });
    }
    toast({
        title: "Rule Event Logged",
        description: `Rule ${ruleEvent.status} event recorded.`,
    });
  }, [rules, toast, createActivity]);

  const resetTaskTime = useCallback((taskId: string) => {
      setTaskSessions(prevSessions => prevSessions.filter(s => s.taskId !== taskId));
  }, []);
  
  const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].sort((a, b) => b.startTime - a.startTime));
    createActivity({ type: 'EVENT_CREATED', description: `Created event: "${newEvent.title}"`, link: '/events' });
    toast({ title: 'Event Created', description: `"${newEvent.title}" has been added.` });
  }, [createActivity, toast]);
  
  const updateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a, b) => b.startTime - a.startTime));
    createActivity({ type: 'EVENT_UPDATED', description: `Updated event: "${updatedEvent.title}"`, link: '/events' });
    toast({ title: 'Event Updated', description: `"${updatedEvent.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteEvent = useCallback((id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    if(eventToDelete) {
        createActivity({ type: 'EVENT_DELETED', description: `Deleted event: "${eventToDelete.title}"` });
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  }, [events, createActivity]);
  
  const addSentiment = useCallback((sentiment: Omit<Sentiment, 'id' | 'createdAt'>) => {
    const newSentiment: Sentiment = {
      ...sentiment,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setSentiments(prev => [newSentiment, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'SENTIMENT_CREATED', description: `Created sentiment: "${newSentiment.title}"`, link: '/sentiments' });
    toast({ title: 'Sentiment Added', description: `"${newSentiment.title}" has been added.` });
  }, [toast, createActivity]);

  const updateSentiment = useCallback((updatedSentiment: Sentiment) => {
    setSentiments(prev => prev.map(s => s.id === updatedSentiment.id ? updatedSentiment : s).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'SENTIMENT_UPDATED', description: `Updated sentiment: "${updatedSentiment.title}"`, link: '/sentiments' });
    toast({ title: 'Sentiment Updated', description: `"${updatedSentiment.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteSentiment = useCallback((id: string) => {
    const sentimentToDelete = sentiments.find(s => s.id === id);
    if(sentimentToDelete) {
        createActivity({ type: 'SENTIMENT_DELETED', description: `Deleted sentiment: "${sentimentToDelete.title}"` });
    }
    setSentiments(prev => prev.filter(s => s.id !== id));
  }, [sentiments, createActivity]);

  const addCheckIn = useCallback((checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setCheckIns(prev => [newCheckIn, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'CHECKIN_CREATED', description: `New ${checkIn.type} check-in (Rating: ${checkIn.rating})`, link: '/check-ins' });
    toast({ title: 'Check-in Added', description: 'Your check-in has been recorded.' });
  }, [toast, createActivity]);

  const updateCheckIn = useCallback((updatedCheckIn: CheckIn) => {
    setCheckIns(prev => prev.map(c => c.id === updatedCheckIn.id ? updatedCheckIn : c).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'CHECKIN_UPDATED', description: `Updated check-in from ${new Date(updatedCheckIn.createdAt).toLocaleDateString()}`, link: '/check-ins' });
    toast({ title: 'Check-in Updated', description: 'Your check-in has been updated.' });
  }, [toast, createActivity]);

  const deleteCheckIn = useCallback((id: string) => {
    const checkInToDelete = checkIns.find(c => c.id === id);
    if(checkInToDelete) {
        createActivity({ type: 'CHECKIN_DELETED', description: `Deleted check-in from ${new Date(checkInToDelete.createdAt).toLocaleDateString()}` });
    }
    setCheckIns(prev => prev.filter(c => c.id !== id));
  }, [checkIns, createActivity]);

  const addTheme = useCallback((theme: Omit<Theme, 'id' | 'createdAt'>) => {
    const newTheme: Theme = {
      ...theme,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setThemes(prev => [newTheme, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'THEME_CREATED', description: `Created theme: "${newTheme.title}"`, link: '/themes' });
    toast({ title: 'Theme Added', description: `"${newTheme.title}" has been added.` });
  }, [createActivity, toast]);

  const updateTheme = useCallback((updatedTheme: Theme) => {
    setThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'THEME_UPDATED', description: `Updated theme: "${updatedTheme.title}"`, link: '/themes' });
    toast({ title: 'Theme Updated', description: `"${updatedTheme.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteTheme = useCallback((id: string) => {
    const themeToDelete = themes.find(t => t.id === id);
    if(themeToDelete) {
        createActivity({ type: 'THEME_DELETED', description: `Deleted theme: "${themeToDelete.title}"` });
    }
    setThemes(prev => prev.filter(t => t.id !== id));
  }, [themes, createActivity]);

  const addRisk = useCallback((risk: Omit<Risk, 'id' | 'createdAt'>) => {
    const newRisk: Risk = {
      ...risk,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setRisks(prev => [newRisk, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'RISK_CREATED', description: `Created risk: "${newRisk.title}"`, link: '/risks' });
    toast({ title: 'Risk Added', description: `"${newRisk.title}" has been added.` });
  }, [createActivity, toast]);

  const updateRisk = useCallback((updatedRisk: Risk) => {
    setRisks(prev => prev.map(r => r.id === updatedRisk.id ? updatedRisk : r).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'RISK_UPDATED', description: `Updated risk: "${updatedRisk.title}"`, link: '/risks' });
    toast({ title: 'Risk Updated', description: `"${updatedRisk.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteRisk = useCallback((id: string) => {
    const riskToDelete = risks.find(r => r.id === id);
    if(riskToDelete) {
        createActivity({ type: 'RISK_DELETED', description: `Deleted risk: "${riskToDelete.title}"` });
    }
    setRisks(prev => prev.filter(r => r.id !== id));
  }, [risks, createActivity]);

  const addObservation = useCallback((observation: Omit<Observation, 'id' | 'createdAt'>) => {
    const newObservation: Observation = {
      ...observation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setObservations(prev => [newObservation, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'OBSERVATION_CREATED', description: `Created observation: "${newObservation.title}"`, link: `/observations/${newObservation.id}` });
    toast({ title: 'Observation Added', description: `"${newObservation.title}" has been added.` });
  }, [createActivity, toast]);

  const updateObservation = useCallback((updatedObservation: Observation) => {
    setObservations(prev => prev.map(o => o.id === updatedObservation.id ? updatedObservation : o).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'OBSERVATION_UPDATED', description: `Updated observation: "${updatedObservation.title}"`, link: `/observations/${updatedObservation.id}` });
    toast({ title: 'Observation Updated', description: `"${updatedObservation.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteObservation = useCallback((id: string) => {
    const obsToDelete = observations.find(o => o.id === id);
    if (obsToDelete) {
        createActivity({ type: 'OBSERVATION_DELETED', description: `Deleted observation: "${obsToDelete.title}"` });
    }
    setObservations(prev => prev.filter(o => o.id !== id));
  }, [observations, createActivity]);

  const addFood = useCallback((food: Omit<Food, 'id' | 'createdAt'>) => {
    const newFood: Food = {
      ...food,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setFoods(prev => [newFood, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'FOOD_CREATED', description: `Created food: "${newFood.title}"`, link: '/foods' });
    toast({ title: 'Food Added', description: `"${newFood.title}" has been added.` });
  }, [createActivity, toast]);

  const updateFood = useCallback((updatedFood: Food) => {
    setFoods(prev => prev.map(f => f.id === updatedFood.id ? updatedFood : f).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'FOOD_UPDATED', description: `Updated food: "${updatedFood.title}"`, link: '/foods' });
    toast({ title: 'Food Updated', description: `"${updatedFood.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteFood = useCallback((id: string) => {
    const foodToDelete = foods.find(f => f.id === id);
    if(foodToDelete) {
        createActivity({ type: 'FOOD_DELETED', description: `Deleted food: "${foodToDelete.title}"` });
    }
    setFoods(prev => prev.filter(f => f.id !== id));
  }, [foods, createActivity]);

  const addFoodSession = useCallback((session: Omit<FoodSession, 'id' | 'createdAt'>) => {
    const newSession: FoodSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setFoodSessions(prev => [newSession, ...prev]);
    const food = foods.find(f => f.id === session.foodId);
    if (food) {
        createActivity({ type: 'FOOD_SESSION_CREATED', description: `Logged food session for: "${food.title}"`, link: '/food-sessions' });
        toast({ title: 'Food Eaten!', description: `You've logged that you ate "${food.title}".` });
    }
  }, [createActivity, toast, foods]);

  const addLocation = useCallback((location: Omit<Location, 'id' | 'createdAt'>) => {
    const newLocation: Location = {
      ...location,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setLocations(prev => [newLocation, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'LOCATION_CREATED', description: `Created location: "${newLocation.title}"`, link: '/locations' });
    toast({ title: 'Location Added', description: `"${newLocation.title}" has been added.` });
  }, [createActivity, toast]);

  const updateLocation = useCallback((updatedLocation: Location) => {
    setLocations(prev => prev.map(l => l.id === updatedLocation.id ? updatedLocation : l).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'LOCATION_UPDATED', description: `Updated location: "${updatedLocation.title}"`, link: '/locations' });
    toast({ title: 'Location Updated', description: `"${updatedLocation.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteLocation = useCallback((id: string) => {
    const locationToDelete = locations.find(l => l.id === id);
    if(locationToDelete) {
        createActivity({ type: 'LOCATION_DELETED', description: `Deleted location: "${locationToDelete.title}"` });
    }
    setLocations(prev => prev.filter(l => l.id !== id));
  }, [locations, createActivity]);
  
  const addLocationSession = useCallback((session: Omit<LocationSession, 'id' | 'createdAt'>) => {
    const newSession: LocationSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setLocationSessions(prev => [newSession, ...prev]);
    const location = locations.find(l => l.id === session.locationId);
    if (location) {
        createActivity({ type: 'LOCATION_SESSION_CREATED', description: `Logged visit to: "${location.title}"`, link: '/location-sessions' });
        toast({ title: 'Location Visit Logged!', description: `You've logged a visit to "${location.title}".` });
    }
  }, [createActivity, toast, locations]);

  const addProtocol = useCallback((protocol: Omit<Protocol, 'id' | 'createdAt'>) => {
    const newProtocol: Protocol = {
      ...protocol,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setProtocols(prev => [newProtocol, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'PROTOCOL_CREATED', description: `Created protocol: "${newProtocol.title}"`, link: '/protocols' });
    toast({ title: 'Protocol Added', description: `"${newProtocol.title}" has been added.` });
  }, [createActivity, toast]);

  const updateProtocol = useCallback((updatedProtocol: Protocol) => {
    setProtocols(prev => prev.map(p => p.id === updatedProtocol.id ? updatedProtocol : p).sort((a, b) => b.createdAt - a.createdAt));
    createActivity({ type: 'PROTOCOL_UPDATED', description: `Updated protocol: "${updatedProtocol.title}"`, link: '/protocols' });
    toast({ title: 'Protocol Updated', description: `"${updatedProtocol.title}" has been updated.` });
  }, [toast, createActivity]);

  const deleteProtocol = useCallback((id: string) => {
    const protocolToDelete = protocols.find(p => p.id === id);
    if (protocolToDelete) {
      createActivity({ type: 'PROTOCOL_DELETED', description: `Deleted protocol: "${protocolToDelete.title}"` });
    }
    setProtocols(prev => prev.filter(p => p.id !== id));
  }, [protocols, createActivity]);


  const updateDesk = useCallback((newDeskState: Partial<Desk>) => {
    setDesk(prev => ({...prev, ...newDeskState}));
    createActivity({ type: 'PARAMETERS_UPDATED', description: 'Customized desk view', link: '/parameters' });
  }, [createActivity]);

  const addValue = useCallback((value: Omit<Value, 'id'>) => {
    const newValue = { ...value, id: crypto.randomUUID() };
    setValues(prev => [...prev, newValue]);
  }, []);

  const updateValue = useCallback((updatedValue: Value) => {
    setValues(prev => prev.map(v => v.id === updatedValue.id ? updatedValue : v));
  }, []);

  const deleteValue = useCallback((id: string) => {
    setValues(prev => prev.filter(v => v.id !== id));
  }, []);

  const addPersonalPlan = useCallback((plan: Omit<PersonalPlan, 'id' | 'createdAt'>) => {
    const newPlan = { ...plan, id: crypto.randomUUID(), createdAt: Date.now() };
    setPersonalPlans(prev => [...prev, newPlan]);
    createActivity({ type: 'PLAN_CREATED', description: `Created new personal plan: "${newPlan.title}"`, link: '/planning' });
    toast({ title: "Plan Created", description: `Your new plan "${newPlan.title}" has been saved.` });
  }, [createActivity, toast]);

  const deletePersonalPlan = useCallback((id: string) => {
    const planToDelete = personalPlans.find(p => p.id === id);
    if(planToDelete) {
        createActivity({ type: 'PLAN_DELETED', description: `Deleted plan: "${planToDelete.title}"`});
    }
    setPersonalPlans(prev => prev.filter(p => p.id !== id));
  }, [personalPlans, createActivity]);
  
  const addDecision = useCallback((decision: Omit<Decision, 'id' | 'createdAt'>) => {
    const newDecision = { ...decision, id: crypto.randomUUID(), createdAt: Date.now() };
    setDecisions(prev => [...prev, newDecision]);
    createActivity({ type: 'DECISION_CREATED', description: `Created new decision: "${newDecision.title}"`, link: '/decisions' });
    toast({ title: "Decision Created", description: `"${newDecision.title}" has been saved.` });
  }, [createActivity, toast]);

  const updateDecision = useCallback((updatedDecision: Decision) => {
    setDecisions(prev => prev.map(d => d.id === updatedDecision.id ? updatedDecision : d));
    createActivity({ type: 'DECISION_UPDATED', description: `Updated decision: "${updatedDecision.title}"`, link: '/decisions' });
  }, [createActivity]);

  const deleteDecision = useCallback((id: string) => {
    const decisionToDelete = decisions.find(d => d.id === id);
    if (decisionToDelete) {
      createActivity({ type: 'DECISION_DELETED', description: `Deleted decision: "${decisionToDelete.title}"` });
    }
    setDecisions(prev => prev.filter(d => d.id !== id));
  }, [decisions, createActivity]);

  const addWantDependencyGraph = useCallback((title: string, description: string, rootWant: string): WantDependencyGraph => {
    const rootNode: WantDependencyNode = { id: crypto.randomUUID(), value: rootWant, parentId: null, rating: 10 };
    const newGraph: WantDependencyGraph = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title,
      description,
      rootWant,
      nodes: [rootNode],
    };
    setWantDependencyGraphs(prev => [...prev, newGraph]);
    createActivity({ type: 'WANT_DEPENDENCY_GRAPH_CREATED', description: `Started exploring want: "${rootWant}"`, link: '/want-dependency-wizard' });
    return newGraph;
  }, [createActivity]);

  const addWantDependencyGraphNode = useCallback((graphId: string, value: string, parentId: string, rating: number) => {
    setWantDependencyGraphs(prev => prev.map(graph => {
      if (graph.id === graphId) {
        const newNode: WantDependencyNode = { id: crypto.randomUUID(), value, parentId, rating };
        return { ...graph, nodes: [...graph.nodes, newNode] };
      }
      return graph;
    }));
  }, []);

  const updateWantDependencyGraphNode = useCallback((graphId: string, nodeId: string, newValue: string) => {
    setWantDependencyGraphs(prev => prev.map(graph => {
      if (graph.id === graphId) {
        return {
          ...graph,
          nodes: graph.nodes.map(node =>
            node.id === nodeId ? { ...node, value: newValue } : node
          ),
        };
      }
      return graph;
    }));
  }, []);

  const addWantValueChain = useCallback((title: string, description: string, rootWant: string): WantValueChain => {
    const rootNode: WantValueChainNode = { id: crypto.randomUUID(), value: rootWant, parentId: null };
    const newGraph: WantValueChain = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title,
      description,
      rootWant,
      nodes: [rootNode],
    };
    setWantValueChains(prev => [...prev, newGraph]);
    createActivity({ type: 'WANT_VALUE_CHAIN_CREATED', description: `Started exploring why: "${rootWant}"`, link: '/want-value-chain-wizard' });
    return newGraph;
  }, [createActivity]);

  const addWantValueChainNode = useCallback((graphId: string, value: string, parentId: string) => {
    setWantValueChains(prev => prev.map(graph => {
      if (graph.id === graphId) {
        const newNode: WantValueChainNode = { id: crypto.randomUUID(), value, parentId };
        return { ...graph, nodes: [...graph.nodes, newNode] };
      }
      return graph;
    }));
  }, []);

  const updateWantValueChainNode = useCallback((graphId: string, nodeId: string, newValue: string) => {
    setWantValueChains(prev => prev.map(graph => {
      if (graph.id === graphId) {
        return {
          ...graph,
          nodes: graph.nodes.map(node =>
            node.id === nodeId ? { ...node, value: newValue } : node
          ),
        };
      }
      return graph;
    }));
  }, []);

  const addWantLossGraph = useCallback((title: string, description: string, rootWant: string): WantLossGraph => {
    const rootNode: WantLossNode = { id: crypto.randomUUID(), value: rootWant, parentId: null };
    const newGraph: WantLossGraph = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title,
      description,
      rootWant,
      nodes: [rootNode],
    };
    setWantLossGraphs(prev => [...prev, newGraph]);
    createActivity({ type: 'WANT_LOSS_GRAPH_CREATED', description: `Started exploring want loss for: "${rootWant}"`, link: '/want-loss-wizard' });
    return newGraph;
  }, [createActivity]);

  const addWantLossGraphNode = useCallback((graphId: string, value: string, parentId: string) => {
    setWantLossGraphs(prev => prev.map(graph => {
      if (graph.id === graphId) {
        const newNode: WantLossNode = { id: crypto.randomUUID(), value, parentId };
        return { ...graph, nodes: [...graph.nodes, newNode] };
      }
      return graph;
    }));
  }, []);

  const updateWantLossGraphNode = useCallback((graphId: string, nodeId: string, newValue: string) => {
    setWantLossGraphs(prev => prev.map(graph => {
      if (graph.id === graphId) {
        return {
          ...graph,
          nodes: graph.nodes.map(node =>
            node.id === nodeId ? { ...node, value: newValue } : node
          ),
        };
      }
      return graph;
    }));
  }, []);

  const addLifeInputSet = useCallback((set: Omit<LifeInputSet, 'id' | 'createdAt'>): LifeInputSet => {
    const newSet: LifeInputSet = {
      ...set,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setLifeInputSets(prev => [newSet, ...prev]);
    return newSet;
  }, []);

  const updateLifeInputSet = useCallback((updatedSet: LifeInputSet) => {
    setLifeInputSets(prev => prev.map(s => s.id === updatedSet.id ? updatedSet : s));
  }, []);

  const value = { tasks, taskTypes, taskSessions, setTasks, workHours, personalHours, topics, outcomes, taskSets, notes, questions, wants, rules, ruleEvents, activities, events, sentiments, checkIns, themes, risks, observations, values, personalPlans, decisions, wantDependencyGraphs, wantValueChains, wantLossGraphs, lifeInputSets, foods, foodSessions, locations, locationSessions, protocols, desk, addTask, updateTask, toggleTask, deleteTask, addTaskType, updateTaskType, deleteTaskType, addSession, updateSession, deleteSession, updateWorkHours, updatePersonalHours, addTopic, deleteTopic, addOutcome, updateOutcome, deleteOutcome, toggleOutcome, addTaskSet, updateTaskSet, deleteTaskSet, applyTaskSet, addNote, updateNote, deleteNote, addQuestion, updateQuestion, deleteQuestion, addWant, updateWant, deleteWant, addRule, updateRule, deleteRule, addRuleEvent, toggleTaskTracking, resetTaskTime, addEvent, updateEvent, deleteEvent, addSentiment, updateSentiment, deleteSentiment, addCheckIn, updateCheckIn, deleteCheckIn, addTheme, updateTheme, deleteTheme, addRisk, updateRisk, deleteRisk, createActivity, updateDesk, addObservation, updateObservation, deleteObservation, addValue, updateValue, deleteValue, addPersonalPlan, deletePersonalPlan, addDecision, updateDecision, deleteDecision, addWantDependencyGraph, addWantDependencyGraphNode, updateWantDependencyGraphNode, addWantValueChain, addWantValueChainNode, updateWantValueChainNode, addWantLossGraph, addWantLossGraphNode, updateWantLossGraphNode, addLifeInputSet, updateLifeInputSet, addFood, updateFood, deleteFood, addFoodSession, addLocation, updateLocation, deleteLocation, addLocationSession, addProtocol, updateProtocol, deleteProtocol };
  
  return (
    <TimeStoreContext.Provider value={value}>
      {isClient ? children : null}
    </TimeStoreContext.Provider>
  );
};

export const useTimeStore = () => {
  const context = useContext(TimeStoreContext);
  if (context === undefined) {
    throw new Error('useTimeStore must be used within a TimeStoreProvider');
  }
  return context;
};
