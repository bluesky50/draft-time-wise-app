'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Step1Values } from './step-1-values';
import { Step2Outcomes } from './step-2-outcomes';
import { Step3TaskCertainty } from './step-3-task-certainty';
import { Step4Blockers } from './step-4-blockers';
import { Step5Prioritization } from './step-5-prioritization';
import { Step6Timeline } from './step-6-timeline';
import { Step7Risks } from './step-7-risks';
import { Step8Review } from './step-8-review';
import { Button } from '../ui/button';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PersonalPlan } from '@/lib/types';
import { getUnixTime } from 'date-fns';

const steps = [
  { id: 1, title: 'Core Values', component: Step1Values },
  { id: 2, title: 'Outcomes', component: Step2Outcomes },
  { id: 3, title: 'Task Certainty', component: Step3TaskCertainty },
  { id: 4, title: 'Identify Blockers', component: Step4Blockers },
  { id: 5, title: 'Prioritization', component: Step5Prioritization },
  { id: 6, title: 'Timeline & Celebration', component: Step6Timeline },
  { id: 7, title: 'Risks & Uncertainties', component: Step7Risks },
  { id: 8, title: 'Review & Create', component: Step8Review },
];

export function PersonalPlanWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const { addPersonalPlan } = useTimeStore();

  const [planData, setPlanData] = useState<Omit<PersonalPlan, 'id' | 'createdAt'>>({
    title: '',
    outcomeIds: [],
    valueIds: [],
    highCertaintyTaskIds: [],
    blockers: [],
    prioritizationApproaches: [],
    timeline: {
      startDate: getUnixTime(new Date()),
      endDate: getUnixTime(new Date()),
    },
    celebration: '',
    risks: [],
  });

  const updatePlanData = (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => {
    setPlanData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setDirection(1);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreatePlan = () => {
    addPersonalPlan(planData);
    // Optionally reset state or navigate away
    setCurrentStep(1);
    setPlanData({
        title: '',
        outcomeIds: [],
        valueIds: [],
        highCertaintyTaskIds: [],
        blockers: [],
        prioritizationApproaches: [],
        timeline: { startDate: getUnixTime(new Date()), endDate: getUnixTime(new Date()) },
        celebration: '',
        risks: [],
    });
  };

  const CurrentComponent = steps.find(s => s.id === currentStep)?.component;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Plan Wizard</CardTitle>
        <CardDescription>
          Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.title}
        </CardDescription>
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted mt-4">
            <div 
                className="bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%`}}
            />
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden relative min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
          >
            {CurrentComponent && <CurrentComponent planData={planData} updatePlanData={updatePlanData} />}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardContent>
         <div className="flex justify-between mt-8">
            <Button onClick={prevStep} disabled={currentStep === 1} variant="outline">
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
