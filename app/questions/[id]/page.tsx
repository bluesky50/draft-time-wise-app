'use client';

import { useParams } from 'next/navigation';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { questions, topics } = useTimeStore();

  const question = questions.find(q => q.id === id);
  const topic = question ? topics.find(t => t.id === question.topicId) : null;

  if (!question) {
    return (
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Question not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The question you are looking for does not exist.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/questions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Questions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
       <Button asChild variant="outline" className="mb-4">
          <Link href="/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Questions
          </Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{question.title}</CardTitle>
          <CardDescription>
            Created on {format(new Date(question.createdAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-lg">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Type</h4>
                <p className="font-medium">{question.type}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                <p className="font-medium">{question.category}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Details</h3>
             {topic && (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Topic:</span>
                    <span className="text-muted-foreground">{topic.title}</span>
                </div>
            )}
             <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">Tags:</h4>
                {question.tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                        # {tag}
                    </div>
                ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  );
}

export default QuestionDetailPage;
