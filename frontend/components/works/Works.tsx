'use client';

import { useState, useEffect } from 'react';
import { Work } from '@/types/work';
import { workApi } from '@/lib/work-api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import WorkCard from './WorkCard';
import CreateWork from './CreateWork';
import UpdateWork from './UpdateWorks';
import { useAuth } from '@/app/providers/AuthProvider';

interface WorksProps {
  taskId: string;
  taskTitle?: string;
}

export default function Works({ taskId, taskTitle }: WorksProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const { user } = useAuth(); 

  useEffect(() => {
    fetchWorks();
  }, [taskId]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const data = await workApi.getByTaskId(taskId);
      setWorks(data);
    } catch (error) {
      toast.error('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await workApi.delete(id);
      setWorks(works.filter(work => work._id !== id));
      toast.success('Work deleted successfully');
    } catch (error) {
      toast.error('Failed to delete work');
    }
  };

  const handleEdit = (work: Work) => {
    setSelectedWork(work);
    setIsUpdateOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Works {taskTitle && `- ${taskTitle}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
            Manage all work submissions for this task
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#2b564e] hover:bg-[#2b564e]/90 text-white w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Work
        </Button>
      </div>

      {/* Works Grid */}
      {works.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No works yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Be the first to submit work for this task
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#2b564e] hover:bg-[#2b564e]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Work
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {works.map((work) => (
            <WorkCard
              key={work._id}
              work={work}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isCreator={work.createdBy._id === user?._id}
            />
          ))}
        </div>
      )}

      {/* Create Work Modal */}
      <CreateWork
        taskId={taskId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          fetchWorks();
          setIsCreateOpen(false);
        }}
      />

      {/* Update Work Modal */}
      {selectedWork && (
        <UpdateWork
          work={selectedWork}
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
          onSuccess={() => {
            fetchWorks();
            setIsUpdateOpen(false);
            setSelectedWork(null);
          }}
        />
      )}
    </div>
  );
}