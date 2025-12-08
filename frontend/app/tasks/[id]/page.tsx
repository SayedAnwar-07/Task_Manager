// app/tasks/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { taskApi } from '@/lib/task-api';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import Works from '@/components/works/Works';
import SafeImage from '@/components/SafeImage';


export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getById(params.id as string);
      setTask(data);
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: CheckCircle,
        };
      case 'in_progress':
        return {
          color: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
          icon: Circle,
        };
      case 'pending':
        return {
          color: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
          icon: AlertCircle,
        };
      default:
        return {
          color: 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
          icon: Circle,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">Task not found</h1>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white pr-4">
            {task.title}
          </h1>
          <Badge 
            variant="outline" 
            className={`${statusConfig.color} border`}
          >
            <StatusIcon className="h-3 w-3 mr-1.5" />
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

       <Separator className="my-4" />

      {/* Details grid */}
      <div className="space-y-6">
        {/* Timeline */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">TIMELINE</h2>
          <div className="space-y-4">
            <div className="flex">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Start Date</div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(task.startDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex ">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(task.deadline), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

         <Separator className="my-4" />

        {/* Created By */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">CREATED BY</h2>
          <div className="flex items-center">
            <SafeImage
              src={
                task.createdBy.display_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  task.createdBy.name
                )}&background=random`
              }
              alt={task.createdBy.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>          
              <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
              <h3 className="font-medium text-gray-900 dark:text-white">{task.createdBy.name}</h3>
            </div>
          </div>
        </div>

        {/* Assigned Users */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            ASSIGNED TO ({task.assignedUsers.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {task.assignedUsers.map((user) => (
              <div key={user._id} className="flex items-center">
                <SafeImage
                  src={
                    user.display_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=random`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mr-3">{user.email}</p>
                </div>
                <Separator orientation="vertical" />
              </div>
            ))}
            
          </div>
        </div>
      </div>

       <Separator className="my-10" />

       <div>
           <Works 
              taskId={params.id}
            />
       </div>
    </div>
  );
}