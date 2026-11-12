'use client';
import { WantDependencyWizard } from '@/components/want-wizard/want-dependency-wizard';

export default function WantDependencyWizardPage() {
    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <WantDependencyWizard />
        </main>
    );
}