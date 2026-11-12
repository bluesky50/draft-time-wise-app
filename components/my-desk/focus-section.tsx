'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskTimeTracker } from '@/components/task-time-tracker';
import { useTimeStore } from '@/context/time-store-context';
import type { SelectableItem } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import type { multiSelectVariants } from '@/components/ui/multi-select';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface FocusSectionProps {
    title: string;
    description: string;
    placeholder?: string;
    options: SelectableItem[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    itemIcon: LucideIcon;
    itemColorClass: string;
    itemIconColorClass: string;
    multiSelectVariant?: VariantProps<typeof multiSelectVariants>['variant'];
    hideControls?: boolean;
    children?: React.ReactNode;
}

export function FocusSection({
    title,
    description,
    placeholder,
    options,
    selectedIds,
    onSelectionChange,
    itemIcon: ItemIcon,
    itemColorClass,
    itemIconColorClass,
    multiSelectVariant,
    hideControls = false,
    children,
}: FocusSectionProps) {
    const { tasks } = useTimeStore();

    const selectOptions = options.map(item => ({
        value: item.id,
        label: item.title,
        icon: ItemIcon,
    }));

    const selectedItems = options.filter(item => selectedIds.includes(item.id));
    
    const handleRemoveItem = (itemId: string) => {
        onSelectionChange(selectedIds.filter(id => id !== itemId));
    };

    return (
        <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!hideControls && (
                <MultiSelect
                    options={selectOptions}
                    onValueChange={onSelectionChange}
                    defaultValue={selectedIds}
                    placeholder={placeholder}
                    variant={multiSelectVariant}
                />
              )}
              {children}
              {selectedItems.length > 0 && (
                 <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: hideControls ? '0' : '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className={cn(hideControls ? '' : "mt-4", "space-y-4")}
                    >
                      {selectedItems.map(item => {
                        const itemTasks = title === 'Focus Outcomes' 
                          ? tasks.filter(task => task.outcomeId === item.id) 
                          : [];
                        
                        const currentlyTrackingTask = title === 'Currently Tracking' ? tasks.find(t => t.id === item.id) : null;

                        return (
                          <div key={item.id} className={`p-4 ${itemColorClass} rounded-lg space-y-4`}>
                            <div className="flex justify-between items-start gap-4">
                               <div className='flex-1'>
                                {currentlyTrackingTask ? (
                                    <TaskTimeTracker task={currentlyTrackingTask} />
                                ) : (
                                    <>
                                    <h4 className="font-semibold flex items-center gap-2"><ItemIcon className={`h-4 w-4 ${itemIconColorClass}`} /> {item.title}</h4>
                                    {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                                    </>
                                )}
                                </div>
                                {!hideControls && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(item.id)}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                                )}
                            </div>

                            {itemTasks.length > 0 && (
                              <div className="border-t border-t-black/10 dark:border-t-white/10 pt-4">
                                <h5 className="font-semibold text-sm mb-2">Associated Tasks</h5>
                                <ul className="space-y-2">
                                  {itemTasks.map(task => (
                                    <li key={task.id} className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-300 dark:border-blue-700'>
                                        <TaskTimeTracker task={task} />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
        </Card>
    );
}