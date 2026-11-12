'use client';
import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sandwich, RotateCcw, Search, Utensils, Plus, ArrowUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { isYesterday, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Food } from '@/lib/types';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortDirection = 'asc' | 'desc';
type RecentMealsPeriod = 'today' | 'yesterday';

export default function FoodTrackingPage() {
    const { foods, foodSessions, addFoodSession } = useTimeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [recentMealsPeriod, setRecentMealsPeriod] = useState<RecentMealsPeriod>('yesterday');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const handleEatNow = (foodId: string) => {
        addFoodSession({ foodId, eatDate: Date.now() });
    };

    const handleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const toggleRecentMealsPeriod = () => {
        setRecentMealsPeriod(prev => prev === 'yesterday' ? 'today' : 'yesterday');
    };

    const recentFoods = useMemo(() => {
        const relevantSessions = foodSessions.filter(session => 
            recentMealsPeriod === 'yesterday' 
                ? isYesterday(new Date(session.eatDate))
                : isToday(new Date(session.eatDate))
        );
        const foodIds = relevantSessions.map(session => session.foodId);
        const uniqueFoodIds = [...new Set(foodIds)];
        return uniqueFoodIds.map(id => foods.find(f => f.id === id)).filter((f): f is Food => !!f);
    }, [foodSessions, foods, recentMealsPeriod]);

    const { filteredFoods, uniqueTypes, uniqueCategories } = useMemo(() => {
        const types = new Set<string>();
        const categories = new Set<string>();
        foods.forEach(food => {
            types.add(food.type);
            categories.add(food.category);
        });
        
        const filtered = foods.filter(food =>
            (food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (typeFilter === 'all' || food.type === typeFilter) &&
            (categoryFilter === 'all' || food.category === categoryFilter)
        )
        
        const sorted = filtered.sort((a, b) => {
            if (sortDirection === 'asc') {
                return a.priority - b.priority;
            } else {
                return b.priority - a.priority;
            }
        });

        return { 
            filteredFoods: sorted, 
            uniqueTypes: Array.from(types), 
            uniqueCategories: Array.from(categories) 
        };

    }, [foods, searchTerm, sortDirection, typeFilter, categoryFilter]);

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Utensils /> Food Tracking
                </h1>
            </div>

            {
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2"><RotateCcw /> Recent Meals</CardTitle>
                                <CardDescription>Quickly re-log items you ate {recentMealsPeriod}.</CardDescription>
                            </div>
                            <Button variant="outline" onClick={toggleRecentMealsPeriod}>
                                Show {recentMealsPeriod === 'yesterday' ? "Today's" : "Yesterday's"} Meals
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentFoods.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {recentFoods.map(food => (
                                    <Button key={food.id} variant="secondary" onClick={() => handleEatNow(food.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {food.title}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No meals logged for {recentMealsPeriod}.</p>
                        )}
                    </CardContent>
                </Card>
            }

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Utensils /> All Foods</CardTitle>
                            <CardDescription>Log any food item.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleSort}>
                            Sort by Priority
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search foods..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="md:w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="md:w-[180px]">
                                <SelectValue placeholder="Filter by Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {uniqueCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFoods.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                            <Utensils className="h-12 w-12 text-muted-foreground/50" />
                            <p className="font-medium">{foods.length === 0 ? 'No foods logged yet.' : 'No foods found.'}</p>
                            {foods.length === 0 ? (
                                <Button asChild><Link href="/foods">Add a food</Link></Button>
                            ) : (
                                <p className="text-sm">Try a different search term or filter.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredFoods.map(food => (
                                    <motion.div
                                        key={food.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className="h-full flex flex-col">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{food.title}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">P: {food.priority}</Badge>
                                                    <Badge variant="secondary">{food.category}</Badge>
                                                    <Badge variant="secondary">{food.type}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground line-clamp-2">{food.description}</p>
                                            </CardContent>
                                            <CardContent>
                                                <Button className="w-full" onClick={() => handleEatNow(food.id)}>
                                                    <Sandwich className="mr-2 h-4 w-4" /> Eat Now
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
