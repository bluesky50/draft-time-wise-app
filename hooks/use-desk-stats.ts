'use client';
import { useMemo, useState, useEffect } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import {
  differenceInDays, endOfWeek, endOfMonth, parse, differenceInMinutes, isToday, endOfYear, differenceInMonths, differenceInYears, parseISO, getDaysInMonth, startOfMonth, eachDayOfInterval, getDay
} from 'date-fns';
import type { DailyWarning, Stats } from '@/lib/types';
import { formatDuration, formatTime, calculateTimeSpentInInterval, getTimeInterval } from '@/lib/utils';

export function useDeskStats() {
  const {
    tasks,
    taskSessions,
    workHours,
    personalHours,
    desk,
    checkIns,
  } = useTimeStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const stats: Stats = useMemo(() => {
    const now = currentTime;
    const workStartTime = parse(workHours.start, 'HH:mm', now);
    const workEndTime = parse(workHours.end, 'HH:mm', now);
    const wakeTime = parse(personalHours.wake, 'HH:mm', now);
    let sleepTime = parse(personalHours.sleep, 'HH:mm', now);

    if (sleepTime <= wakeTime) { // Handle overnight sleep
        sleepTime.setDate(sleepTime.getDate() + 1);
    }
    
    let minutesLeftWork = 0;
    if (now < workEndTime) {
        minutesLeftWork = differenceInMinutes(workEndTime, now);
    }

    let minutesBeforeSleep = 0;
    if (now < sleepTime) {
        minutesBeforeSleep = differenceInMinutes(sleepTime, now);
    }
    
    const todayInterval = getTimeInterval('day');
    const timeSpentTodaySeconds = taskSessions
        .reduce((total, session) => {
            return total + calculateTimeSpentInInterval(session.taskId, [session], todayInterval)
        }, 0);

    const remainingTasks = tasks.filter(t => !t.completed);
    const focusedTasks = desk.selectedOutcomes.length > 0
        ? remainingTasks.filter(t => t.outcomeId && desk.selectedOutcomes.includes(t.outcomeId))
        : remainingTasks;

    const remainingTaskTime = focusedTasks.reduce((acc, task) => acc + task.estimatedTime, 0);

    const daysLeftInWeek = differenceInDays(endOfWeek(now, { weekStartsOn: 1 }), now);
    const daysLeftInMonth = differenceInDays(endOfMonth(now), now);
    const daysLeftInYear = differenceInDays(endOfYear(now), now);

    const totalWorkMinutes = differenceInMinutes(workEndTime, workStartTime);
    const elapsedWorkMinutes = differenceInMinutes(now, workStartTime);
    const workProgress = totalWorkMinutes > 0 ? Math.max(0, Math.min(100, (elapsedWorkMinutes / totalWorkMinutes) * 100)) : 0;
    const remainingWorkMinutesToday = totalWorkMinutes > 0 ? Math.max(0, totalWorkMinutes - elapsedWorkMinutes) : 0;


    const totalWakeMinutes = differenceInMinutes(sleepTime, wakeTime);
    const elapsedWakeMinutes = differenceInMinutes(now, wakeTime);
    const personalProgress = totalWakeMinutes > 0 ? Math.max(0, Math.min(100, (elapsedWakeMinutes / totalWakeMinutes) * 100)) : 0;
    const remainingPersonalMinutesToday = totalWakeMinutes > 0 ? Math.max(0, totalWakeMinutes - elapsedWakeMinutes) : 0;

    const taskTimeWarningThreshold = personalHours.taskTimeWarningThreshold || 80;
    const workDayCapacityMinutes = totalWorkMinutes * (taskTimeWarningThreshold / 100);
    const isOverloaded = remainingTaskTime > workDayCapacityMinutes;
    
    const daysInWeek = eachDayOfInterval({ start: now, end: endOfWeek(now, {weekStartsOn: 1})});
    const workDaysLeftInWeek = daysInWeek.slice(1).filter(day => workHours.workDays.includes(getDay(day))).length;
    
    const workHoursLeftWeek = (remainingWorkMinutesToday / 60) + (workDaysLeftInWeek * (totalWorkMinutes / 60));
    const totalWorkHoursInWeek = (totalWorkMinutes / 60) * workHours.workDays.length; 
    const workHoursLeftWeekPercent = totalWorkHoursInWeek > 0 ? (workHoursLeftWeek / totalWorkHoursInWeek) * 100 : 0;
    
    const personalHoursLeftWeek = (remainingPersonalMinutesToday / 60) + (daysLeftInWeek * (totalWakeMinutes / 60));
    const totalPersonalHoursInWeek = (totalWakeMinutes / 60) * 7;
    const personalHoursLeftWeekPercent = totalPersonalHoursInWeek > 0 ? (personalHoursLeftWeek / totalPersonalHoursInWeek) * 100 : 0;

    const monthDays = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
    const remainingMonthDays = eachDayOfInterval({ start: now, end: endOfMonth(now) });
    const workdaysInMonth = monthDays.filter(day => workHours.workDays.includes(getDay(day))).length;
    const remainingWorkdaysInMonth = remainingMonthDays.slice(1).filter(day => workHours.workDays.includes(getDay(day))).length;

    const workHoursLeftMonth = (remainingWorkMinutesToday / 60) + (remainingWorkdaysInMonth * (totalWorkMinutes / 60));
    const totalWorkHoursInMonth = (totalWorkMinutes / 60) * workdaysInMonth;
    const workHoursLeftMonthPercent = totalWorkHoursInMonth > 0 ? (workHoursLeftMonth / totalWorkHoursInMonth) * 100 : 0;
    
    const personalHoursLeftMonth = (remainingPersonalMinutesToday / 60) + (daysLeftInMonth * (totalWakeMinutes / 60));
    const totalPersonalHoursInMonth = (totalWakeMinutes / 60) * getDaysInMonth(now);
    const personalHoursLeftMonthPercent = totalPersonalHoursInMonth > 0 ? (personalHoursLeftMonth / totalPersonalHoursInMonth) * 100 : 0;


    let daysLeftMortality = 0, hoursBeforeSleepLeftMortality = 0, monthsLeftMortality = 0, yearsLeftMortality = 0;
    
    if (personalHours.deathDate) {
        const deathDate = parseISO(personalHours.deathDate);
        daysLeftMortality = differenceInDays(deathDate, now);
        monthsLeftMortality = differenceInMonths(deathDate, now);
        yearsLeftMortality = differenceInYears(deathDate, now);

        if (now < sleepTime) {
            const wakeMinutesPerDay = differenceInMinutes(sleepTime, wakeTime);
            const remainingWakeMinutesToday = differenceInMinutes(sleepTime, now);
            const totalRemainingWakeMinutes = (remainingWakeMinutesToday) + ((daysLeftMortality - 1) * wakeMinutesPerDay);
            hoursBeforeSleepLeftMortality = Math.floor(totalRemainingWakeMinutes / 60);
        } else {
             const wakeMinutesPerDay = differenceInMinutes(sleepTime, wakeTime);
             const totalRemainingWakeMinutes = (daysLeftMortality - 1) * wakeMinutesPerDay;
             hoursBeforeSleepLeftMortality = Math.floor(totalRemainingWakeMinutes / 60);
        }
    }

    const isPastWorkTime = now > workEndTime;
    const isPastSleepTime = now > sleepTime;
    
    const todaysCheckIns = checkIns.filter(c => isToday(new Date(c.createdAt)));
    const positiveCheckInsToday = todaysCheckIns.filter(c => c.type === 'positive').length;
    const negativeCheckInsToday = todaysCheckIns.filter(c => c.type === 'negative').length;


    return {
        minutesLeftWork,
        minutesBeforeSleep,
        timeSpentToday: formatTime(Math.round(timeSpentTodaySeconds)),
        remainingTaskTime: formatDuration(remainingTaskTime),
        remainingTaskTimeMinutes: remainingTaskTime,
        workProgress,
        personalProgress,
        isOverloaded,
        workDayCapacityMinutes,
        totalWorkDuration: formatDuration(totalWorkMinutes > 0 ? totalWorkMinutes : 0),
        totalPersonalDuration: formatDuration(totalWakeMinutes > 0 ? totalWakeMinutes : 0),
        workHoursLeftWeek: Math.floor(workHoursLeftWeek),
        workHoursLeftWeekPercent,
        personalHoursLeftWeek: Math.floor(personalHoursLeftWeek),
        personalHoursLeftWeekPercent: personalHoursLeftWeekPercent,
        workHoursLeftMonth: Math.floor(workHoursLeftMonth),
        workHoursLeftMonthPercent,
        personalHoursLeftMonth: Math.floor(personalHoursLeftMonth),
        personalHoursLeftMonthPercent: personalHoursLeftMonthPercent,
        daysLeftInWeek,
        daysLeftInMonth,
        daysLeftInYear,
        daysLeftMortality,
        hoursBeforeSleepLeftMortality,
        monthsLeftMortality,
        yearsLeftMortality,
        isPastWorkTime,
        isPastSleepTime,
        positiveCheckInsToday,
        negativeCheckInsToday,
    }
  }, [currentTime, workHours, personalHours, tasks, taskSessions, checkIns, desk.selectedOutcomes]);

  const dailyWarnings: DailyWarning[] = useMemo(() => {
    const warnings: DailyWarning[] = [];
    if (stats.remainingTaskTimeMinutes > stats.minutesLeftWork && !stats.isPastWorkTime) {
        warnings.push({
            message: 'Work Overload',
            details: `Your remaining task time (${formatDuration(stats.remainingTaskTimeMinutes)}) exceeds the time left in your workday (${formatDuration(stats.minutesLeftWork)}).`
        });
    }
    if (stats.remainingTaskTimeMinutes > stats.minutesBeforeSleep && !stats.isPastSleepTime) {
        warnings.push({
            message: 'Personal Time Overload',
            details: `Your tasks may cut into your personal time. You have ${formatDuration(stats.minutesBeforeSleep)} before sleep, but ${formatDuration(stats.remainingTaskTimeMinutes)} of tasks remaining.`
        });
    }
     if (stats.workProgress > 50 && !stats.isPastWorkTime) {
        warnings.push({
            message: 'Work Day Progress',
            details: `Only ${100 - Math.round(stats.workProgress)}% of your work day is left.`
        });
    }
    if (stats.personalProgress > 50 && !stats.isPastSleepTime) {
        warnings.push({
            message: 'Personal Time Progress',
            details: `Only ${100 - Math.round(stats.personalProgress)}% of your personal time is left before sleep.`
        });
    }
    return warnings;
  }, [stats]);

  return { stats, dailyWarnings };
}
