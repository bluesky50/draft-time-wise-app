'use client';
import { PersonalPlanWizard } from '@/components/planning/personal-plan-wizard';

export default function PlanningPage() {
    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <PersonalPlanWizard />
        </main>
    );
}
