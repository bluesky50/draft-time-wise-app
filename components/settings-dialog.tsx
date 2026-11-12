'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimeStore } from "@/context/time-store-context";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import type { WorkHours } from "@/lib/types";

export function SettingsDialog({ children }: { children: ReactNode }) {
  const { workHours, updateWorkHours } = useTimeStore();
  const [localWorkHours, setLocalWorkHours] = useState<WorkHours>(workHours);

  useEffect(() => {
    setLocalWorkHours(workHours);
  }, [workHours]);

  const handleSave = () => {
    updateWorkHours(localWorkHours);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Work Hours</DialogTitle>
          <DialogDescription>
            Set your daily start and end times for accurate tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              value={localWorkHours.start}
              onChange={(e) => setLocalWorkHours(prev => ({...prev, start: e.target.value}))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              value={localWorkHours.end}
              onChange={(e) => setLocalWorkHours(prev => ({...prev, end: e.target.value}))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
