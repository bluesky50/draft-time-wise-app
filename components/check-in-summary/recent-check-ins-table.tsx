
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CheckIn } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Frown, Smile } from 'lucide-react';
import { format } from 'date-fns';

interface RecentCheckInsTableProps {
    filteredCheckIns: CheckIn[];
}

export function RecentCheckInsTable({ filteredCheckIns }: RecentCheckInsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtered Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredCheckIns.slice(-10).reverse().map((checkIn: CheckIn) => (
                    <TableRow key={checkIn.id}>
                    <TableCell>{format(new Date(checkIn.createdAt), 'PP p')}</TableCell>
                    <TableCell>{checkIn.rating}/10</TableCell>
                    <TableCell>
                        <Badge variant={checkIn.type === 'positive' ? 'secondary' : 'destructive'} className='capitalize'>
                        {checkIn.type === 'positive' ? <Smile className='mr-1 h-3 w-3'/> : <Frown className='mr-1 h-3 w-3'/>}
                        {checkIn.type}
                        </Badge>
                    </TableCell>
                    <TableCell>{checkIn.description}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    );
}

