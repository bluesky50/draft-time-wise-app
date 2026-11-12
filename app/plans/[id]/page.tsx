
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlanView } from '@/components/planning/plan-view';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { personalPlans, deletePersonalPlan } = useTimeStore();

  const plan = personalPlans.find(p => p.id === id);

  if (!plan) {
    return (
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Plan not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The plan you are looking for does not exist.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const handleDelete = () => {
    deletePersonalPlan(plan.id);
    router.push('/plans');
  };

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link href="/plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Plans
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your personal plan titled "{plan.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{plan.title}</CardTitle>
          <CardDescription>
            Created on {format(new Date(plan.createdAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanView plan={plan} />
        </CardContent>
      </Card>
    </main>
  );
}
