
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Sparkles } from 'lucide-react';
import { MultiSelect } from '../ui/multi-select';
import type { Sentiment } from '@/lib/types';
import { useMemo } from 'react';

export type TypeFilter = 'all' | 'positive' | 'negative';
export type RatingFilter = { min: number, max: number };

interface CheckInFiltersProps {
    typeFilter: TypeFilter;
    onTypeFilterChange: (value: TypeFilter) => void;
    ratingFilter: RatingFilter;
    onRatingFilterChange: (value: RatingFilter) => void;
    sentiments: Sentiment[];
    sentimentFilter: string[];
    onSentimentFilterChange: (values: string[]) => void;
}

export function CheckInFilters({ typeFilter, onTypeFilterChange, ratingFilter, onRatingFilterChange, sentiments, sentimentFilter, onSentimentFilterChange }: CheckInFiltersProps) {

    const handleMinRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.max(1, Math.min(10, Number(e.target.value) || 1));
        onRatingFilterChange({...ratingFilter, min: Math.min(newMin, ratingFilter.max)});
    }

    const handleMaxRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(1, Math.min(10, Number(e.target.value) || 10));
        onRatingFilterChange({...ratingFilter, max: Math.max(newMax, ratingFilter.min)});
    }

    const sentimentOptions = useMemo(() => {
        return sentiments.map(s => ({
            value: s.id,
            label: s.title,
            icon: Sparkles
        }));
    }, [sentiments]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Filter className='h-5 w-5' /> Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                    <Label>Filter by Type</Label>
                    <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as TypeFilter)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2">
                    <Label>Filter by Rating</Label>
                    <div className="flex items-center gap-2">
                        <Input type="number" min="1" max="10" value={ratingFilter.min} onChange={handleMinRatingChange} className="w-1/2" />
                        <span>-</span>
                        <Input type="number" min="1" max="10" value={ratingFilter.max} onChange={handleMaxRatingChange} className="w-1/2" />
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <Label>Filter by Sentiment</Label>
                    <MultiSelect
                        options={sentimentOptions}
                        onValueChange={onSentimentFilterChange}
                        defaultValue={sentimentFilter}
                        placeholder="Select sentiments..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}
