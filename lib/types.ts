export type Task = {
  id: string;
  description: string;
  estimatedTime: number; // in minutes
  completed: boolean;
  createdAt: number; // timestamp
  topicId?: string;
  outcomeId?: string;
  typeId?: string;
};

export type TaskType = {
  id: string;
  createdAt: number;
  title: string;
};

export type TaskSession = {
  id: string;
  taskId: string;
  startTime: number; // timestamp
  endTime: number | null; // timestamp, null if currently tracking
  createdAt: number; // timestamp
};

export type WorkHours = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  workDays: number[]; // 0 for Sunday, 1 for Monday, etc.
};

export type PersonalHours = {
  wake: string; // "HH:mm"
  sleep: string; // "HH:mm"
  taskTimeWarningThreshold: number; // percentage
  birthDate?: string; // "YYYY-MM-DD"
  deathDate?: string; // "YYYY-MM-DD"
  workTimeUtilizationSuccessThreshold?: number;
  personalTimeUtilizationSuccessThreshold?: number;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export type Outcome = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  targetDate?: number;
  completedDate: number | null;
  isOngoing?: boolean;
};

export type TaskSetTask = {
  description: string;
  estimatedTime: number;
  topicId?: string;
  outcomeId?: string;
};

export type TaskSet = {
  id: string;
  title: string;
  description: string;
  tasks: TaskSetTask[];
};

export type Note = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  topicId?: string;
  category: string;
  domain: string;
  subdomain: string;
};

export type Observation = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  category: string;
};

export type Question = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  topicId?: string;
  category: string;
};

export type RuleEvent = {
  id: string;
  ruleId: string;
  createdAt: number;
  status: 'success' | 'fail';
};

export type Rule = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  topicId?: string;
  category: string;
};

export type Protocol = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  steps: string[];
};

export type Activity = {
  id: string;
  timestamp: number;
  type: 
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'TASK_COMPLETED'
    | 'TASK_TYPE_CREATED'
    | 'TASK_TYPE_UPDATED'
    | 'TASK_TYPE_DELETED'
    | 'TASK_TRACKING_START' 
    | 'TASK_TRACKING_STOP'
    | 'TASK_SESSION_CREATED'
    | 'TASK_SESSION_UPDATED'
    | 'TASK_SESSION_DELETED'
    | 'TOPIC_CREATED'
    | 'TOPIC_DELETED'
    | 'OUTCOME_CREATED'
    | 'OUTCOME_UPDATED'
    | 'OUTCOME_DELETED'
    | 'OUTCOME_COMPLETED'
    | 'TASKSET_CREATED'
    | 'TASKSET_UPDATED'
    | 'TASKSET_DELETED'
    | 'TASKSET_APPLIED'
    | 'NOTE_CREATED'
    | 'NOTE_UPDATED'
    | 'NOTE_DELETED'
    | 'QUESTION_CREATED'
    | 'QUESTION_UPDATED'
    | 'QUESTION_DELETED'
    | 'WANT_CREATED'
    | 'WANT_UPDATED'
    | 'WANT_DELETED'
    | 'RULE_CREATED'
    | 'RULE_UPDATED'
    | 'RULE_DELETED'
    | 'RULE_EVENT_LOGGED'
    | 'EVENT_CREATED'
    | 'EVENT_UPDATED'
    | 'EVENT_DELETED'
    | 'SENTIMENT_CREATED'
    | 'SENTIMENT_UPDATED'
    | 'SENTIMENT_DELETED'
    | 'CHECKIN_CREATED'
    | 'CHECKIN_UPDATED'
  | 'CHECKIN_DELETED'
    | 'THEME_CREATED'
    | 'THEME_UPDATED'
    | 'THEME_DELETED'
    | 'RISK_CREATED'
    | 'RISK_UPDATED'
    | 'RISK_DELETED'
    | 'OBSERVATION_CREATED'
    | 'OBSERVATION_UPDATED'
    | 'OBSERVATION_DELETED'
    | 'FOOD_CREATED'
    | 'FOOD_UPDATED'
    | 'FOOD_DELETED'
    | 'FOOD_SESSION_CREATED'
    | 'LOCATION_CREATED'
    | 'LOCATION_UPDATED'
    | 'LOCATION_DELETED'
    | 'LOCATION_SESSION_CREATED'
    | 'PROTOCOL_CREATED'
    | 'PROTOCOL_UPDATED'
    | 'PROTOCOL_DELETED'
    | 'PARAMETERS_UPDATED'
    | 'ACTIVITY_SUMMARY_CREATED'
    | 'CONSISTENCY_VIEWED'
    | 'PLAN_CREATED'
    | 'PLAN_DELETED'
    | 'DECISION_CREATED'
    | 'WANT_DEPENDENCY_GRAPH_CREATED'
    | 'WANT_VALUE_CHAIN_CREATED'
    | 'WANT_LOSS_GRAPH_CREATED';
  description: string;
  link?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  startTime: number; // unix timestamp
  endTime: number; // unix timestamp
  tags: string[];
  category: string;
  type: string;
  createdAt: number;
};

export type Sentiment = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
};

export type CheckIn = {
  id: string;
  createdAt: number;
  rating: number; // 1-10
  type: 'positive' | 'negative';
  description: string;
  sentimentIds: string[];
};

export type Theme = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  category: string;
};

export type Risk = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export type Want = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  category: string;
};

export type Desk = {
  selectedOutcomes: string[];
  selectedNotes: string[];
  selectedQuestions: string[];
  selectedRisks: string[];
  selectedWants: string[];
  selectedThemes: string[];
  selectedRules: string[];
  excludedOutcomeIdsForEfficiency: string[];
  showFocusTime: boolean;
  showRecentTaskSessions: boolean;
  showNoteReminders: boolean;
  showQuestionReminders: boolean;
  showThemeReminders: boolean;
  showWantReminders: boolean;
  showRiskReminders: boolean;
  showRuleReminders: boolean;
  logActivities: boolean;
  floatingNav: boolean;
};

export type DailyWarning = {
    message: string;
    details: string;
};

export type Stats = {
    minutesLeftWork: number;
    minutesBeforeSleep: number;
    timeSpentToday: string;
    remainingTaskTime: string;
    remainingTaskTimeMinutes: number;
    workProgress: number;
    personalProgress: number;
    isOverloaded: boolean;
    workDayCapacityMinutes: number;
    totalWorkDuration: string;
    totalPersonalDuration: string;
    workHoursLeftWeek: number;
    workHoursLeftWeekPercent: number;
    personalHoursLeftWeek: number;
    personalHoursLeftWeekPercent: number;
    workHoursLeftMonth: number;
    workHoursLeftMonthPercent: number;
    personalHoursLeftMonth: number;
    personalHoursLeftMonthPercent: number;
    daysLeftInWeek: number;
    daysLeftInMonth: number;
    daysLeftInYear: number;
    daysLeftMortality: number;
    hoursBeforeSleepLeftMortality: number;
    monthsLeftMortality: number;
    yearsLeftMortality: number;
    isPastWorkTime: boolean;
    isPastSleepTime: boolean;
    positiveCheckInsToday: number;
    negativeCheckInsToday: number;
};

export type SelectableItem = {
    id: string;
    title: string;
    description: string;
};

export type UtilizationChange = {
  work: { value: string; type: 'increase' | 'decrease' | 'neutral' };
  personal: { value: string; type: 'increase' | 'decrease' | 'neutral' };
}

export type SevenDayTimeSeriesData = {
  date: string;
  utilizedWorkPercent: number;
  utilizedPersonalPercent: number;
  workChange: number;
  personalChange: number;
  isWorkSuccess: boolean;
  isPersonalSuccess: boolean;
}

export type Value = {
    id: string;
    title: string;
    description: string;
    domain: string;
};

export type PlanRisk = {
    id: string;
    description: string;
    mitigation: string;
};

export type Blocker = {
    id: string;
    outcomeId: string;
    taskId?: string; // Can be linked to a specific task
    description: string;
};

export type PersonalPlan = {
    id: string;
    title: string;
    createdAt: number;
    outcomeIds: string[];
    valueIds: string[];
    highCertaintyTaskIds: string[];
    blockers: Blocker[];
    prioritizationApproaches: string[];
    timeline: {
        startDate: number;
        endDate: number;
    };
    celebration: string;
    risks: PlanRisk[];
};

export type Decision = {
    id: string;
    createdAt: number;
    title: string;
    description: string;
    status: 'pending' | 'decided';
    options: { id: string; description: string; pros: string[]; cons: string[] }[];
    criteria: { id: string; name: string; weight: number }[];
    scores: { optionId: string; criteriaId: string; score: number }[];
    finalChoiceId?: string;
    reasoning?: string;
};

export interface WantDependencyNode {
  id: string;
  value: string;
  parentId: string | null;
  rating?: number;
}

export interface WantDependencyGraph {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  rootWant: string;
  nodes: WantDependencyNode[];
}

export interface WantValueChainNode {
  id: string;
  value: string;
  parentId: string | null;
}

export interface WantValueChain {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  rootWant: string;
  nodes: WantValueChainNode[];
}

export interface WantLossNode {
  id: string;
  value: string;
  parentId: string | null;
}

export interface WantLossGraph {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  rootWant: string;
  nodes: WantLossNode[];
}

export interface LifeInput {
  id: string;
  name: string;
  criticality: number; // 1-10
  stability: number; // 1-10
  maintenanceIdeas: string[];
  increaseIdeas: string[];
  risks: string[];
  wantDependencyGraphId?: string;
  wantValueChainId?: string;
  wantLossGraphId?: string;
}

export interface LifeInputSet {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  inputs: LifeInput[];
}

export type Food = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  category: string;
  priority: number; // 1-10
};

export type FoodSession = {
  id: string;
  foodId: string;
  createdAt: number;
  eatDate: number;
};

export type Location = {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  category: string;
};

export type LocationSession = {
  id: string;
  locationId: string;
  createdAt: number;
  visitDate: number;
};
