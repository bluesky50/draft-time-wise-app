'use client';

import { useState } from 'react';
import { TaskStats } from '@/components/task-stats';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskList } from '@/components/task-list';
import type { Task } from '@/lib/types';

export function TimeWiseApp() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleDoneEditing = () => {
    setEditingTask(null);
  };

  return (
    <>
        <TaskStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <TaskList onEdit={handleEditTask} editingTaskId={editingTask?.id || null} />
            </div>
            <div className="lg:col-span-1">
                <AddTaskForm editingTask={editingTask} onDoneEditing={handleDoneEditing} />
            </div>
        </div>
    </>
  );
}
