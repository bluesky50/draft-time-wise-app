'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatDuration } from "@/lib/utils";
import { Star } from "lucide-react";

const COLORS = ['#0088FE', '#FF8042'];

interface UtilizationPieChartProps {
    title: string;
    description?: string;
    totalTimeMinutes: number;
    notUtilizedMinutes: number;
    utilizedPercent: number;
    successThreshold?: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
};

export function UtilizationPieChart({ title, description, totalTimeMinutes, notUtilizedMinutes, utilizedPercent, successThreshold }: UtilizationPieChartProps) {
    const chartData = [
        { name: 'Task Time', minutes: totalTimeMinutes },
        { name: 'Not Utilized', minutes: notUtilizedMinutes },
    ];
    
    const isSuccess = successThreshold !== undefined && utilizedPercent >= successThreshold;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                            Utilized
                            {isSuccess && <Star className="h-4 w-4 text-amber-400" />}
                        </p>
                        <p className="text-xl font-bold flex items-center justify-center gap-2">{formatDuration(totalTimeMinutes)} <span className="text-xs font-bold text-primary">({utilizedPercent.toFixed(1)}%)</span></p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Not Utilized</p>
                        <p className="text-xl font-bold flex items-center justify-center gap-2">{formatDuration(notUtilizedMinutes)} <span className="text-xs font-bold text-primary">({(100 - utilizedPercent).toFixed(1)}%)</span></p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={chartData} dataKey="minutes" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} labelLine={false} label={renderCustomizedLabel}>
                                {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatDuration(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
