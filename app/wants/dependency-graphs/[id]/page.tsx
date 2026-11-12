'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { WantDependencyGraphView } from '@/components/want-wizard/want-dependency-graph-view';
import { format } from 'date-fns';

export default function WantDependencyGraphDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { wantDependencyGraphs } = useTimeStore();

  const graph = wantDependencyGraphs.find(p => p.id === id);

  if (!graph) {
    return (
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Want Dependency Graph not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The graph you are looking for does not exist.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/wants/dependency-graphs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Graphs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link href="/wants/dependency-graphs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Graphs
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{graph.title}</CardTitle>
          <CardDescription>
            {graph.description}
          </CardDescription>
          <CardDescription className="pt-2">
            Created on {format(new Date(graph.createdAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WantDependencyGraphView graph={graph} />
        </CardContent>
      </Card>
    </main>
  );
}
