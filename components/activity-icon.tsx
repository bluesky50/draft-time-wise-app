'use client';
import { 
    Activity, CheckCircle2, FileText, Play, SlidersHorizontal, StopCircle, Target,
    ListChecks, ListTodo, Layers, Notebook, Timer, BarChart, CalendarDays, Smile, MessageSquare,
    Paintbrush, ShieldAlert, ClipboardCheck, LayoutDashboard, BarChart2, CalendarCheck, HelpCircle, Heart, Gavel, User, Eye,
    Trash2, Edit, Plus, Copy,
} from 'lucide-react';
import type { Activity as ActivityType } from '@/lib/types';

export function ActivityIconComponent({ type }: { type: ActivityType['type'] }) {
  switch (type) {
    // Task related
    case 'TASK_CREATED':
      return <Plus className="h-5 w-5 text-green-500" />;
    case 'TASK_UPDATED':
      return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'TASK_DELETED':
       return <Trash2 className="h-5 w-5 text-red-500" />;
    case 'TASK_COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    case 'TASK_TRACKING_START':
      return <Play className="h-5 w-5 text-green-500" />;
    case 'TASK_TRACKING_STOP':
      return <StopCircle className="h-5 w-5 text-red-500" />;
    
    // Topic related
    case 'TOPIC_CREATED':
        return <Plus className="h-5 w-5 text-green-500" />;
    case 'TOPIC_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;

    // Outcome related
    case 'OUTCOME_CREATED':
        return <Plus className="h-5 w-5 text-green-500" />;
    case 'OUTCOME_UPDATED':
        return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'OUTCOME_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;
    case 'OUTCOME_COMPLETED':
      return <Target className="h-5 w-5 text-indigo-500" />;

    // Task Set related
    case 'TASKSET_CREATED':
        return <Plus className="h-5 w-5 text-green-500" />;
    case 'TASKSET_UPDATED':
        return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'TASKSET_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;
    case 'TASKSET_APPLIED':
        return <Copy className="h-5 w-5 text-blue-500" />;

    // Note related
    case 'NOTE_CREATED':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'NOTE_UPDATED':
        return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'NOTE_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;

    // Question related
    case 'QUESTION_CREATED':
        return <HelpCircle className="h-5 w-5 text-cyan-500" />;
    case 'QUESTION_UPDATED':
        return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'QUESTION_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;

    // Want related
    case 'WANT_CREATED':
        return <Heart className="h-5 w-5 text-pink-500" />;
    case 'WANT_UPDATED':
        return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'WANT_DELETED':
        return <Trash2 className="h-5 w-5 text-red-500" />;

    // Rule related
    case 'RULE_CREATED':
    case 'RULE_UPDATED':
    case 'RULE_DELETED':
    case 'RULE_EVENT_LOGGED':
        return <Gavel className="h-5 w-5 text-orange-500" />;

    // Event related
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_DELETED':
        return <CalendarDays className="h-5 w-5 text-teal-500" />;

    // Sentiment related
    case 'SENTIMENT_CREATED':
    case 'SENTIMENT_UPDATED':
    case 'SENTIMENT_DELETED':
        return <Smile className="h-5 w-5 text-lime-500" />;

    // Check-in related
    case 'CHECKIN_CREATED':
    case 'CHECKIN_UPDATED':
    case 'CHECKIN_DELETED':
        return <MessageSquare className="h-5 w-5 text-sky-500" />;

    // Theme related
    case 'THEME_CREATED':
    case 'THEME_UPDATED':
    case 'THEME_DELETED':
        return <Paintbrush className="h-5 w-5 text-fuchsia-500" />;

    // Risk related
    case 'RISK_CREATED':
    case 'RISK_UPDATED':
    case 'RISK_DELETED':
        return <ShieldAlert className="h-5 w-5 text-rose-500" />;
    
    // Observation related
    case 'OBSERVATION_CREATED':
    case 'OBSERVATION_UPDATED':
    case 'OBSERVATION_DELETED':
        return <Eye className="h-5 w-5 text-amber-500" />;
    
    // Other
    case 'PARAMETERS_UPDATED':
      return <SlidersHorizontal className="h-5 w-5 text-orange-500" />;
    
    case 'ACTIVITY_SUMMARY_CREATED':
        return <ClipboardCheck className="h-5 w-5 text-gray-500" />;

    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
}
