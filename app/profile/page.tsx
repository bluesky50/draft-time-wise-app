'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { MortalityClock } from '@/components/profile/mortality-clock';

export default function ProfilePage() {
  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
             <User className="h-16 w-16 text-muted-foreground/30" />
            <p className="font-medium">More profile features coming soon!</p>
          </div>
        </CardContent>
      </Card>
      
      <MortalityClock />

    </main>
  );
}
