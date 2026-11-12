'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WantsPage() {
    return (
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Wants</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Heart /> Want Items</CardTitle>
                        <CardDescription>A simple list of your individual wants and desires.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                            Use this section to quickly capture and manage a flat list of things you want. It's great for straightforward tracking.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/wants/items">Go to Want Items <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star /> Want Dependency Graphs</CardTitle>
                        <CardDescription>Explore the "why" behind your wants with a hierarchical map.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         <p className="text-sm text-muted-foreground">
                            The Want Dependency Wizard helps you drill down into your core motivations by asking "What gives you that?". This creates a graph of interconnected desires.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                           <Link href="/wants/dependency-graphs">Go to Want Dependency Graphs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
