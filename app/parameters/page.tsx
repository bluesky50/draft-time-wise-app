

'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimeStore } from "@/context/time-store-context";
import type { ReactNode } from "react";
import { useState, useEffect, useMemo } from "react";
import type { WorkHours, PersonalHours } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { parse, differenceInMinutes, format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Download, Monitor, Activity, Navigation, Briefcase } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function ParametersPage() {
  const store = useTimeStore();
  const { workHours, updateWorkHours, personalHours, updatePersonalHours, desk, updateDesk } = store;
  const [localWorkHours, setLocalWorkHours] = useState<WorkHours>(workHours);
  const [localPersonalHours, setLocalPersonalHours] = useState<PersonalHours>(personalHours);
  const [localDeskSettings, setLocalDeskSettings] = useState(desk);
  const { toast } = useToast();

  useEffect(() => {
    setLocalWorkHours(workHours);
  }, [workHours]);

  useEffect(() => {
    setLocalPersonalHours(personalHours);
  }, [personalHours]);
  
  useEffect(() => {
    setLocalDeskSettings(desk);
  }, [desk]);

  const handleSave = () => {
    updateWorkHours(localWorkHours);
    updatePersonalHours(localPersonalHours);
    updateDesk(localDeskSettings);
    toast({
        title: "Settings Saved",
        description: "Your personal parameters have been updated.",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    if(!start || !end) return "0h 0m";
    const today = new Date();
    const startTime = parse(start, 'HH:mm', today);
    const endTime = parse(end, 'HH:mm', today);
    let diff = differenceInMinutes(endTime, startTime);
    if (diff < 0) { // Handles overnight scenario
        diff += 24 * 60 * 60;
    }
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  }

  const workDuration = useMemo(() => calculateDuration(localWorkHours.start, localWorkHours.end), [localWorkHours]);
  const personalDuration = useMemo(() => calculateDuration(localPersonalHours.wake, localPersonalHours.sleep), [localPersonalHours]);

  const handleExport = () => {
    const {
      tasks,
      taskTypes,
      taskSessions,
      topics,
      outcomes,
      taskSets,
      notes,
      questions,
      wants,
      rules,
      ruleEvents,
      activities,
      events,
      sentiments,
      checkIns,
      themes,
      risks,
      observations,
      values,
      personalPlans,
      decisions,
      wantDependencyGraphs,
      wantValueChains,
      wantLossGraphs,
      lifeInputSets,
      foods,
      foodSessions,
      locations,
      locationSessions,
      protocols,
      workHours,
      personalHours,
      desk,
    } = store;

    const dataToExport = {
      tasks,
      taskTypes,
      taskSessions,
      topics,
      outcomes,
      taskSets,
      notes,
      questions,
      wants,
      rules,
      ruleEvents,
      activities,
      events,
      sentiments,
      checkIns,
      themes,
      risks,
      observations,
      values,
      personalPlans,
      decisions,
      wantDependencyGraphs,
      wantValueChains,
      wantLossGraphs,
      lifeInputSets,
      foods,
      foodSessions,
      locations,
      locationSessions,
      protocols,
      workHours,
      personalHours,
      desk,
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    link.download = `TimeWise-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  const deskSettings = [
      { id: 'showFocusTime', label: 'Focus Time'},
      { id: 'showRecentTaskSessions', label: 'Recent Task Sessions'},
      { id: 'showNoteReminders', label: 'Note Reminders'},
      { id: 'showQuestionReminders', label: 'Question Reminders'},
      { id: 'showThemeReminders', label: 'Theme Reminders'},
      { id: 'showWantReminders', label: 'Want Reminders'},
      { id: 'showRiskReminders', label: 'Risk Reminders'},
      { id: 'showRuleReminders', label: 'Rule Reminders'},
  ] as const;

  const weekDays = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
  ];

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <CardDescription>
            Manage your personal settings that define how you want to work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5" /> Work Time</h3>
                <p className="text-sm text-muted-foreground">Set your daily start/end times and work days.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={localWorkHours.start}
                          onChange={(e) => setLocalWorkHours(prev => ({...prev, start: e.target.value}))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={localWorkHours.end}
                          onChange={(e) => setLocalWorkHours(prev => ({...prev, end: e.target.value}))}
                        />
                    </div>
                </div>
                 <div>
                    <Label>Work Days</Label>
                    <ToggleGroup 
                        type="multiple"
                        variant="outline"
                        value={localWorkHours.workDays.map(String)}
                        onValueChange={(days) => setLocalWorkHours(prev => ({...prev, workDays: days.map(Number)}))}
                        className="flex-wrap justify-start"
                    >
                        {weekDays.map(day => (
                            <ToggleGroupItem key={day.value} value={String(day.value)} aria-label={day.label}>
                                {day.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <p className="text-sm font-medium text-primary">Total Work Duration: {workDuration}</p>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold">Personal Time</h3>
                <p className="text-sm text-muted-foreground">Define your wake and sleep times to calculate max available time.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <Label htmlFor="wake-time">Wake Time</Label>
                        <Input
                          id="wake-time"
                          type="time"
                          value={localPersonalHours.wake}
                          onChange={(e) => setLocalPersonalHours(prev => ({...prev, wake: e.target.value}))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="sleep-time">Sleep Time</Label>
                        <Input
                          id="sleep-time"
                          type="time"
                          value={localPersonalHours.sleep}
                          onChange={(e) => setLocalPersonalHours(prev => ({...prev, sleep: e.target.value}))}
                        />
                    </div>
                </div>
                <p className="text-sm font-medium text-primary">Total Available Duration: {personalDuration}</p>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold">Life & Mortality</h3>
                <p className="text-sm text-muted-foreground">Set your birth date and estimated death date.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <Label htmlFor="birth-date">Birthday</Label>
                        <Input
                          id="birth-date"
                          type="date"
                          value={localPersonalHours.birthDate || ''}
                          onChange={(e) => setLocalPersonalHours(prev => ({...prev, birthDate: e.target.value}))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="death-date">Estimated Death Date</Label>
                        <Input
                          id="death-date"
                          type="date"
                          value={localPersonalHours.deathDate || ''}
                          onChange={(e) => setLocalPersonalHours(prev => ({...prev, deathDate: e.target.value}))}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold">Workload Management</h3>
                <div className="space-y-2">
                  <Label htmlFor="task-time-threshold">Task Time Warning Threshold (%)</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a warning on your desk when your estimated task time exceeds this percentage of your workday.
                  </p>
                  <Input
                    id="task-time-threshold"
                    type="number"
                    min="10"
                    max="150"
                    value={localPersonalHours.taskTimeWarningThreshold || 80}
                    onChange={(e) => setLocalPersonalHours(prev => ({...prev, taskTimeWarningThreshold: Number(e.target.value)}))}
                    className="w-32"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="work-utilization-threshold">Work Time Utilization Success Threshold (%)</Label>
                  <p className="text-sm text-muted-foreground">
                    Define what you consider a successful day of work time utilization.
                  </p>
                  <Input
                    id="work-utilization-threshold"
                    type="number"
                    min="10"
                    max="100"
                    value={localPersonalHours.workTimeUtilizationSuccessThreshold || 80}
                    onChange={(e) => setLocalPersonalHours(prev => ({...prev, workTimeUtilizationSuccessThreshold: Number(e.target.value)}))}
                    className="w-32"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="personal-utilization-threshold">Personal Time Utilization Success Threshold (%)</Label>
                  <p className="text-sm text-muted-foreground">
                    Define what you consider a successful day of personal time utilization.
                  </p>
                  <Input
                    id="personal-utilization-threshold"
                    type="number"
                    min="10"
                    max="100"
                    value={localPersonalHours.personalTimeUtilizationSuccessThreshold || 20}
                    onChange={(e) => setLocalPersonalHours(prev => ({...prev, personalTimeUtilizationSuccessThreshold: Number(e.target.value)}))}
                    className="w-32"
                  />
                </div>
            </div>
            <Separator />
             <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Navigation className="h-5 w-5" /> Navigation Style</h3>
                <p className="text-sm text-muted-foreground">Control how you navigate the application.</p>
                <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="floating-nav" className="flex-1">Floating Navigation</Label>
                        <Switch
                            id="floating-nav"
                            checked={localDeskSettings.floatingNav}
                            onCheckedChange={(checked) => {
                                setLocalDeskSettings(prev => ({...prev, floatingNav: checked}));
                            }}
                        />
                    </div>
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Monitor className="h-5 w-5" /> Desk Customization</h3>
                <p className="text-sm text-muted-foreground">Control which sections are visible on your My Desk page.</p>
                <div className="space-y-3 rounded-lg border p-4">
                    {deskSettings.map(setting => (
                        <div key={setting.id} className="flex items-center justify-between">
                            <Label htmlFor={setting.id} className="flex-1">{setting.label}</Label>
                            <Switch
                                id={setting.id}
                                checked={localDeskSettings[setting.id]}
                                onCheckedChange={(checked) => {
                                    setLocalDeskSettings(prev => ({...prev, [setting.id]: checked}));
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <Separator />
             <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Download className="h-5 w-5" /> Data & Logging</h3>
                <p className="text-sm text-muted-foreground">Manage your application data and logging preferences.</p>
                <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="log-activities">Activity Logging</Label>
                            <p className="text-xs text-muted-foreground">Record user actions in the Activity Timeline.</p>
                        </div>
                        <Switch
                            id="log-activities"
                            checked={localDeskSettings.logActivities}
                            onCheckedChange={(checked) => {
                                setLocalDeskSettings(prev => ({...prev, logActivities: checked}));
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Export Data</Label>
                            <p className="text-xs text-muted-foreground">Download all your data as a JSON file.</p>
                        </div>
                        <Button onClick={handleExport} variant="secondary" size="sm">
                            Export
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default ParametersPage;
