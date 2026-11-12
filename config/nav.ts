'use client';
import {
  ListChecks, Target, ListTodo, Layers, SlidersHorizontal, Notebook, Timer, Activity as ActivityIcon,
  BarChart, CalendarDays, Smile, MessageSquare, Paintbrush, ShieldAlert, ClipboardCheck, LayoutDashboard,
  BarChart2, CalendarCheck, HelpCircle, Heart, Gavel, User, Eye, Info, PieChart, Star, ClipboardList, BrainCircuit, Unplug, Zap, Utensils, MapPin, CheckSquare, Tag
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLinkInfo {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const quickLinks: NavLinkInfo[] = [
    { href: '/', label: 'My Desk', icon: LayoutDashboard },
    { href: '/consistency', label: 'Consistency', icon: CalendarCheck },
    { href: '/efficiency', label: 'Efficiency', icon: PieChart },
    { href: '/check-in-summary', label: 'Check-in Summary', icon: BarChart2 },
    { href: '/foods', label: 'Foods', icon: Utensils },
    { href: '/food-tracking', label: 'Food Tracking', icon: Timer },
    { href: '/food-summary', label: 'Food Summary', icon: PieChart },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/parameters', label: 'Parameters', icon: SlidersHorizontal },
];

export const allLinks: NavLinkInfo[] = [
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/task-types', label: 'Task Types', icon: Tag },
  { href: '/tracking', label: 'Time Tracking', icon: Timer },
  { href: '/task-sessions', label: 'Task Sessions', icon: Timer },
  { href: '/activity', label: 'Activity', icon: ActivityIcon },
  { href: '/activity-summary', label: 'Activity Summary', icon: ClipboardCheck },
  { href: '/analytics', label: 'Time Analytics', icon: BarChart },
  { href: '/rule-summary', label: 'Rule Summary', icon: Gavel },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/topics', label: 'Topics', icon: ListChecks },
  { href: '/outcomes', label: 'Outcomes', icon: Target },
  { href: '/task-sets', label: 'Task Sets', icon: Layers },
  { href: '/notes', label: 'Notes', icon: Notebook },
  { href: '/observations', label: 'Observations', icon: Eye },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/wants', label: 'Wants', icon: Heart },
  { href: '/wants/items', label: 'Want Items', icon: Heart },
  { href: '/want-dependency-wizard', label: 'Want Dependency Wizard', icon: Star },
  { href: '/wants/dependency-graphs', label: 'Want Dependency Graphs', icon: Star },
  { href: '/want-value-chain-wizard', label: 'Why Wizard', icon: BrainCircuit },
  { href: '/want-value-chains', label: 'Want Value Chains', icon: BrainCircuit },
  { href: '/want-loss-wizard', label: 'Want Loss Wizard', icon: Unplug },
  { href: '/want-loss-graphs', label: 'Want Loss Graphs', icon: Unplug },
  { href: '/life-input-sets', label: 'Life Input Sets', icon: Zap },
  { href: '/sentiments', label: 'Sentiments', icon: Smile },
  { href: '/check-ins', label: 'Check-ins', icon: MessageSquare },
  { href: '/themes', label: 'Themes', icon: Paintbrush },
  { href: '/risks', label: 'Risks', icon: ShieldAlert },
  { href: '/rules', label: 'Rules', icon: Gavel },
  { href: '/food-sessions', label: 'Food Sessions', icon: Utensils },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/location-sessions', label: 'Location Sessions', icon: MapPin },
  { href: '/location-summary', label: 'Location Summary', icon: BarChart2 },
  { href: '/protocols', label: 'Protocols', icon: CheckSquare },
  { href: '/planning', label: 'Planning', icon: Star },
  { href: '/plans', label: 'Plans', icon: ClipboardList },
  { href: '/app-info', label: 'App Info', icon: Info },
];
