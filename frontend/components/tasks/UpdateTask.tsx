"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { taskApi } from '@/lib/task-api';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import UserSelect from './UserSelect';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  startDate: z.date(),
  deadline: z.date(),
  assignedUsers: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface UpdateTaskProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UpdateTask({ task, open, onOpenChange, onSuccess }: UpdateTaskProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      startDate: new Date(),
      deadline: new Date(),
      assignedUsers: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        status: task.status,
        startDate: new Date(task.startDate),
        deadline: new Date(task.deadline),
        assignedUsers: task.assignedUsers.map(user => user._id),
      });
    }
  }, [task, form]);

  const onSubmit = async (values: FormData) => {
    if (!task) return;

    try {
      setLoading(true);
      const data = {
        ...values,
        startDate: values.startDate.toISOString(),
        deadline: values.deadline.toISOString(),
      };

      await taskApi.update(task._id, data);
      toast.success("Task updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-[600px]
          bg-white dark:bg-[#101010]
          max-h-[90vh]
          h-full
          overflow-y-auto
          rounded-none
          border border-[#cfcfcf] dark:border-[#3c3c3c]
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Update Task
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      className="bg-white dark:bg-[#3c3c3c] border border-[#cfcfcf] dark:border-[#101010] rounded-none text-[#101010] dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description"
                      className="bg-white dark:bg-[#3c3c3c] border border-[#cfcfcf] dark:border-[#101010] min-h-[100px] rounded-none text-[#101010] dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white dark:bg-[#3c3c3c] border border-[#cfcfcf] dark:border-[#101010] rounded-none">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none bg-white dark:bg-[#101010]">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned Users */}
            <FormField
              control={form.control}
              name="assignedUsers"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Assign To</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select users to assign..."
                     
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start & Deadline */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="mb-2 flex flex-col">
                    <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-white dark:bg-[#3c3c3c] border border-[#cfcfcf] dark:border-[#101010] rounded-none",
                              !field.value && "text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-none bg-white dark:bg-[#101010]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="mb-2 flex flex-col">
                    <FormLabel className="text-gray-700 dark:text-gray-300 mb-2">Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-white dark:bg-[#3c3c3c] border border-[#cfcfcf] dark:border-[#101010] rounded-none",
                              !field.value && "text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-none bg-white dark:bg-[#101010]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border border-[#cfcfcf] dark:border-[#101010] rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#2b564e] hover:bg-[#244742] text-white rounded-none"
              >
                {loading ? 'Updating...' : 'Update Task'}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
