'use client';

import { useTimeStore } from '@/context/time-store-context';
import { useDeskStats } from '@/hooks/use-desk-stats';
import { Paintbrush, Heart, ShieldAlert, Gavel, Target, Timer, Notebook, HelpCircle } from 'lucide-react';
import { DeskStatsGrid } from '@/components/my-desk/desk-stats-grid';
import { DailyWarnings } from '@/components/my-desk/daily-warnings';
import { FocusSection } from '@/components/my-desk/focus-section';
import { TimeframeCards } from '@/components/my-desk/timeframe-cards';
import { RecentNotes } from '@/components/my-desk/recent-notes';
import { CheckinSummaryCard } from '@/components/my-desk/checkin-summary-card';
import { FocusTimeSection } from '@/components/my-desk/focus-time-section';
import { RecentTaskSessions } from '@/components/my-desk/recent-task-sessions';
import { useMemo, useState } from 'react';
import { TimeHorizonCard } from './time-horizon-card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import type { Outcome } from '@/lib/types';


type OutcomeFilter = 'all' | 'ongoing' | 'targeted';

export function MyDesk() {
    const { tasks, outcomes, themes, wants, risks, rules, desk, updateDesk, notes, questions, taskSessions } = useTimeStore();
    const { stats, dailyWarnings } = useDeskStats();
    const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');

    const currentlyTrackingTasks = useMemo(() => {
        return tasks.filter(task => taskSessions.some(s => s.taskId === task.id && s.endTime === null));
    }, [tasks, taskSessions]);

    const filteredOutcomes = useMemo(() => {
        const incompleteOutcomes = outcomes.filter(o => !o.completedDate);
        if (outcomeFilter === 'ongoing') {
            return incompleteOutcomes.filter(o => o.isOngoing);
        }
        if (outcomeFilter === 'targeted') {
            return incompleteOutcomes.filter(o => !o.isOngoing);
        }
        return incompleteOutcomes;
    }, [outcomes, outcomeFilter]);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-3xl font-bold">My Desk</h1>
                    <p className="text-muted-foreground">Your daily planning dashboard.</p>
                </div>
            </div>

            <DeskStatsGrid stats={stats} />
            
            {dailyWarnings.length > 0 && <DailyWarnings warnings={dailyWarnings} />}

            {desk.showFocusTime && <FocusTimeSection />}
            
            {desk.showRecentTaskSessions && <RecentTaskSessions />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                
                {currentlyTrackingTasks.length > 0 && (
                    <FocusSection
                    title="Currently Tracking"
                    description="Tasks you are actively tracking time for right now."
                    options={currentlyTrackingTasks.map(t => ({id: t.id, title: t.description, description: ''}))}
                    selectedIds={currentlyTrackingTasks.map(t => t.id)}
                    onSelectionChange={() => {}}
                    itemIcon={Timer}
                    itemColorClass="bg-green-500/10"
                    itemIconColorClass="text-green-500"
                    hideControls
                    />
                )}
                
                <FocusSection
                    title="Focus Outcomes"
                    description="Select primary outcomes to focus on for the day."
                    placeholder="Select outcomes to focus on..."
                    options={filteredOutcomes.map(o => ({ id: o.id, title: o.title, description: o.description }))}
                    selectedIds={desk.selectedOutcomes}
                    onSelectionChange={(ids) => updateDesk({ selectedOutcomes: ids })}
                    itemIcon={Target}
                    itemColorClass="bg-blue-500/10"
                    itemIconColorClass="text-blue-500"
                >
                    <div className="flex items-center gap-2 mt-4">
                        <Button
                            size="sm"
                            variant={outcomeFilter === 'all' ? 'secondary' : 'ghost'}
                            onClick={() => setOutcomeFilter('all')}
                            className={cn(outcomeFilter === 'all' && 'font-bold')}
                        >
                            All
                        </Button>
                        <Button
                            size="sm"
                            variant={outcomeFilter === 'ongoing' ? 'secondary' : 'ghost'}
                            onClick={() => setOutcomeFilter('ongoing')}
                            className={cn(outcomeFilter === 'ongoing' && 'font-bold')}
                        >
                            Ongoing
                        </Button>
                        <Button
                            size="sm"
                            variant={outcomeFilter === 'targeted' ? 'secondary' : 'ghost'}
                            onClick={() => setOutcomeFilter('targeted')}
                             className={cn(outcomeFilter === 'targeted' && 'font-bold')}
                        >
                            Targeted
                        </Button>
                    </div>
                </FocusSection>

                {desk.showNoteReminders && <FocusSection
                    title="Note Reminders"
                    description="Select notes to keep in mind."
                    placeholder="Select notes..."
                    options={notes}
                    selectedIds={desk.selectedNotes}
                    onSelectionChange={(ids) => updateDesk({ selectedNotes: ids })}
                    itemIcon={Notebook}
                    itemColorClass="bg-purple-500/10"
                    itemIconColorClass="text-purple-500"
                    multiSelectVariant="secondary"
                />}
                
                {desk.showQuestionReminders && <FocusSection
                    title="Question Reminders"
                    description="Select questions to keep in mind."
                    placeholder="Select questions..."
                    options={questions}
                    selectedIds={desk.selectedQuestions}
                    onSelectionChange={(ids) => updateDesk({ selectedQuestions: ids })}
                    itemIcon={HelpCircle}
                    itemColorClass="bg-cyan-500/10"
                    itemIconColorClass="text-cyan-500"
                    multiSelectVariant="secondary"
                />}

                {desk.showThemeReminders && <FocusSection
                    title="Theme Reminders"
                    description="Select themes to keep in mind throughout your day."
                    placeholder="Select themes..."
                    options={themes}
                    selectedIds={desk.selectedThemes}
                    onSelectionChange={(ids) => updateDesk({ selectedThemes: ids })}
                    itemIcon={Paintbrush}
                    itemColorClass="bg-purple-500/10"
                    itemIconColorClass="text-purple-500"
                    multiSelectVariant="secondary"
                />}

                {desk.showWantReminders && <FocusSection
                    title="Want Reminders"
                    description="Select wants to keep in mind throughout your day."
                    placeholder="Select wants..."
                    options={wants}
                    selectedIds={desk.selectedWants}
                    onSelectionChange={(ids) => updateDesk({ selectedWants: ids })}
                    itemIcon={Heart}
                    itemColorClass="bg-red-500/10"
                    itemIconColorClass="text-red-500"
                    multiSelectVariant="secondary"
                />}

                {desk.showRiskReminders && <FocusSection
                    title="Risk Reminders"
                    description="Select risks to keep in mind throughout your day."
                    placeholder="Select risks..."
                    options={risks}
                    selectedIds={desk.selectedRisks}
                    onSelectionChange={(ids) => updateDesk({ selectedRisks: ids })}
                    itemIcon={ShieldAlert}
                    itemColorClass="bg-destructive/10"
                    itemIconColorClass="text-destructive"
                    multiSelectVariant="secondary"
                />}
                {desk.showRuleReminders && <FocusSection
                    title="Rule Reminders"
                    description="Select rules to keep in mind."
                    placeholder="Select rules..."
                    options={rules}
                    selectedIds={desk.selectedRules}
                    onSelectionChange={(ids) => updateDesk({ selectedRules: ids })}
                    itemIcon={Gavel}
                    itemColorClass="bg-yellow-500/10"
                    itemIconColorClass="text-yellow-600"
                    multiSelectVariant="secondary"
                />}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <CheckinSummaryCard 
                    positiveCheckInsToday={stats.positiveCheckInsToday}
                    negativeCheckInsToday={stats.negativeCheckInsToday}
                    />
                    
                    <TimeHorizonCard stats={stats} />

                    <TimeframeCards
                    stats={stats}
                    />
                
                <RecentNotes 
                    notes={notes}
                />
                </div>
            </div>
        </>
    );
}