'use client';
import { WantValueChainWizard } from '@/components/want-source-wizard/want-source-wizard';

export default function WantSourceWizardPage() {
    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <WantValueChainWizard />
        </main>
    );
}
