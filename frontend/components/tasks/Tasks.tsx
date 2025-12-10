"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { taskApi } from '@/lib/task-api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MoreHorizontal, Plus, Eye, Edit, Trash2, Calendar, Users } from 'lucide-react';
import CreateTask from './CreateTask';
import UpdateTask from './UpdateTask';
import { toast } from 'sonner';
import LiquidLoader from '../shared/LiquidLoader';
import TaskFilters from './TaskFilters';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'in_progress' | 'done' | ''>('');

  const router = useRouter();

  useEffect(() => {
    fetchTasks(); 
  },[search, filterStatus]);


  const fetchTasks = async (searchValue?: string, statusValue?: 'pending' | 'in_progress' | 'done' | '') => {
    try {
      setLoading(true);
      const data = await taskApi.getAll({
        search: searchValue !== undefined ? searchValue : search,
        status: statusValue !== undefined ? statusValue || undefined : filterStatus || undefined,
      });
      setTasks(data);
    } catch (error) {
      toast("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };


  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (status: 'pending' | 'in_progress' | 'done' | '') => {
    setFilterStatus(status);
  };

  const handleApplyFilters = () => {
    fetchTasks();
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterStatus('');
    fetchTasks();
  };

  const openDeleteAlert = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);
      await taskApi.delete(taskToDelete);
      setTasks(tasks.filter(task => task._id !== taskToDelete));
      toast("Task deleted successfully");
      setIsDeleteAlertOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      toast("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertOpen(false);
    setTaskToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewDetails = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LiquidLoader size="md" showText={true} speed={1.5} />
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
            Manage and track all your tasks in one place
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#2b564e] hover:bg-[#2b564e]/90 text-white w-full sm:w-auto rounded-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Use the TaskFilters component */}
      <TaskFilters
        search={search}
        filterStatus={filterStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Desktop Table View */}
      <div className="hidden lg:block border bg-white dark:bg-[#101010]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">Deadline</TableHead>
              <TableHead className="font-semibold">Created By</TableHead>
              <TableHead className="font-semibold">Team Members</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell 
                  className="font-medium cursor-pointer hover:text-[#2b564e]"
                  onClick={() => handleViewDetails(task._id)}
                >
                  {task.title}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(task.startDate)}</TableCell>
                <TableCell>{formatDate(task.deadline)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium">{task.createdBy.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.createdBy.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {task.assignedUsers.slice(0, 3).map((user) => (
                      <div key={user._id} title={user.name}>
                        <img
                          src={user.display_image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                        />
                      </div>
                    ))}
                    {task.assignedUsers.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">
                        +{task.assignedUsers.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewDetails(task._id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTask(task);
                          setIsUpdateOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => openDeleteAlert(task._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {tasks.map((task) => (
          <div 
            key={task._id} 
            className="border bg-white dark:bg-[#101010] p-4 cursor-pointer"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTask(task);
                      setIsUpdateOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => openDeleteAlert(task._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status and Deadline */}
            <div className="flex flex-wrap justify-between gap-3 mb-4">
              <div className="flex items-start gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-sm font-medium capitalize">
                    {task.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Deadline</p>
                  <p className="text-sm font-medium">{formatDate(task.deadline)}</p>
                </div>
              </div>
            </div>

            {/* Assigned Users and Created By */}
            
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <img
                      src={task.createdBy.display_image}
                      alt={task.createdBy.name}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Created By</p>
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {task.createdBy.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                 <Users className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col items-start">
                <p className="text-xs text-gray-600 dark:text-gray-400">Team Members</p>
                <div className="flex -space-x-2 mt-1">
                  {task.assignedUsers.slice(0, 3).map((user) => (
                    <div key={user._id} title={user.name}>
                      <img
                        src={user.display_image}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      />
                    </div>
                  ))}
                  {task.assignedUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">
                      +{task.assignedUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>

            {/* Click indicator */}
            <div className="mt-4 pt-3 border-t dark:border-gray-800"  onClick={() => handleViewDetails(task._id)}>
              <div className="flex items-center justify-between text-sm">
                <span>Tap to view details</span>
                <span className="text-[#2b564e] font-bold text-2xl">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Alert */}
      {isDeleteAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Alert variant="destructive" className="w-full max-w-md shadow-lg">
            <AlertTitle className="text-lg font-semibold">Delete Task</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className='dark:text-white text-black'>
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3 mt-4">
               <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="border-gray-300 hover:bg-gray-100"
                  disabled={isDeleting} 
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  disabled={isDeleting} 
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>

              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* CREATE & UPDATE MODALS */}
      <CreateTask
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchTasks}
      />

      {selectedTask && (
        <UpdateTask
          task={selectedTask}
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
}
