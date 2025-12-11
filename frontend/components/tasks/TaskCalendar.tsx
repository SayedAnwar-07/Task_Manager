"use client";

import { Calendar } from "@/components/ui/calendar";
import { Task, TaskStatus } from "@/types/task";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";

interface TaskCalendarProps {
  tasks: Task[];
  filterStatus: TaskStatus | '';
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);

  // Convert startDate strings → Date objects
  const taskDates = useMemo(
    () =>
      tasks
        .filter((task) => task.startDate)
        .map((task) => new Date(task.startDate)),
    [tasks]
  );

  // Find tasks for a specific day
  const tasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const d = new Date(task.startDate);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) return;

    const todayTasks = tasksForDate(date);

    if (todayTasks.length > 0) {
      setOpen(true);
    }
  };

  // Check if a day has a task
  const isTaskDate = (date: Date) => {
    return taskDates.some(
      (taskDate) =>
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
    );
  };

  return (
    <div className="p-4 border">
      <h2 className="font-semibold text-lg mb-3 flex gap-2 justify-center items-center">
         <img src="https://i.ibb.co.com/ds9rs0YX/image-removebg-preview.png" alt="Task Manager" className="h-4 w-4" /> Task Calendar
    </h2>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-none"
        modifiers={{
          taskDay: isTaskDate,
        }}
        modifiersClassNames={{
          taskDay:
            "bg-[#2b564e] text-white hover:bg-[#2b564e]/90 border-gray-800 dark:border-gray-500 border rounded-full transition-all",
        }}
      />

      {/* Dialog for showing task details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Tasks on{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>
         <Separator className="" />
          <div className="space-y-4">
            {selectedDate &&
              tasksForDate(selectedDate).map((task) => (
                <div
                  key={task._id}
                  className="border p-2"
                >
                  <h3 className="font-semibold flex justify-between">
                    <span>
                      {task.title}
                    <span className="text-sm m-1 rounded-full border bg-gray-100 dark:bg-white dark:text-black px-3">
                      {task.workCount} works
                    </span>
                    </span>
                    <span
                        className={`
                            px-2 py-0.5 rounded text-white text-xs
                            ${
                            task.status === 'pending'
                                ? 'bg-amber-500'
                                : task.status === 'in_progress'
                                ? 'bg-blue-500'
                                : task.status === 'done'
                                ? 'bg-green-500'
                                : 'bg-gray-500'
                            }
                        `}
                        >
                        {task.status.replace('_', ' ')}
                    </span>

                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {task.description}
                  </p>

                  
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
