"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types/task';
import { Search, X, Filter, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TaskCalendar from './TaskCalendar';

interface TaskFiltersProps {
  tasks: Task[];
  search: string;
  filterStatus: TaskStatus | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (status: TaskStatus | '') => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function TaskFilters({
  tasks,
  search,
  filterStatus,
  onSearchChange,
  onStatusChange,
  onApplyFilters,
  onClearFilters,
}: TaskFiltersProps) {
  
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleStatusChange = (status: TaskStatus | '') => {
    onStatusChange(status);
  };

  const handleClearAll = () => {
    setSearchInput('');
    onClearFilters();
  };

  const handleSearch = () => {
    onSearchChange(searchInput);
    onApplyFilters();
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="mb-8 space-y-4">
      <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
        {/* Status Filter - Desktop */}
        <div className="hidden lg:block space-y-2 w-full lg:w-1/2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === '' ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange('')}
              className={`rounded-none text-xs py-5 text-white ${filterStatus === '' ? 'bg-[#2b564e] hover:bg-[#2b564e]/90' : ''}`}
            >
              All Tasks
            </Button>
            <Button
              variant={filterStatus === 'pending' ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange('pending')}
              className={`rounded-none text-xs py-5 ${filterStatus === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full md:mr-2 ${filterStatus === 'pending' ? 'bg-white' : 'bg-amber-500'}`}></span>
              Pending
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange('in_progress')}
              className={`rounded-none text-xs py-5 ${filterStatus === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full md:mr-2 ${filterStatus === 'in_progress' ? 'bg-white' : 'bg-blue-500'}`}></span>
              In Progress
            </Button>
            <Button
              variant={filterStatus === 'done' ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange('done')}
              className={`rounded-none text-xs py-5 ${filterStatus === 'done' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full md:mr-2 ${filterStatus === 'done' ? 'bg-white' : 'bg-green-500'}`}></span>
              Done
            </Button>
          </div>
        </div>

        {/* Status Filter - Mobile & Tablet (Sheet) */}
        <div className="block lg:hidden w-full lg:w-1/2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start rounded-none py-5 text-left font-normal"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterStatus ? (
                  <span className="capitalize">
                    {filterStatus.replace('_', ' ')}
                  </span>
                ) : (
                  "Filter by Status"
                )}
                <Menu className="ml-auto h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="rounded-none p-0">
              <SheetHeader className="p-6 pb-3 text-left">
                <SheetTitle className="text-left">Filter by Status</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 space-y-1 p-6 pt-0">
                <Button
                  variant={filterStatus === '' ? "default" : "ghost"}
                  onClick={() => handleStatusChange('')}
                  className={`justify-start rounded-none text-left border ${filterStatus === '' ? 'bg-[#2b564e] hover:bg-[#2b564e]/90 text-white' : 'border-[#2b564e]/50'}`}
                >
                  All Tasks
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? "default" : "ghost"}
                  onClick={() => handleStatusChange('pending')}
                  className={`justify-start rounded-none text-left border ${filterStatus === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'border-amber-500/20'}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${filterStatus === 'pending' ? 'bg-white' : 'bg-amber-500'}`}></span>
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'in_progress' ? "default" : "ghost"}
                  onClick={() => handleStatusChange('in_progress')}
                  className={`justify-start rounded-none text-left border ${filterStatus === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border-blue-500/20'}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${filterStatus === 'in_progress' ? 'bg-white' : 'bg-blue-500'}`}></span>
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === 'done' ? "default" : "ghost"}
                  onClick={() => handleStatusChange('done')}
                  className={`justify-start rounded-none text-left border ${filterStatus === 'done' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-green-500/20'}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 ${filterStatus === 'done' ? 'bg-white' : 'bg-green-500'}`}></span>
                    Done
                  </Button>
                </div>

                <div className="mt-6">
                  <TaskCalendar tasks={tasks} filterStatus={filterStatus}/>
                </div>
              </SheetContent>
          </Sheet>
        </div>

        {/* Search Input */}
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-1/2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchInput} // local input state
              onChange={(e) => setSearchInput(e.target.value)} // only local change
              onKeyDown={handleEnterKey} // apply on Enter
              className="w-full pl-10 pr-4 py-2.5 border border-input bg-white dark:bg-[#101010] text-sm outline-none focus:outline-none focus:ring-1 focus:ring-ring rounded-none"
            />
          </div>

          {/* Apply Search Button */}
          <Button
            onClick={handleSearch} // triggers parent update
            className="bg-[#2b564e] hover:bg-[#2b564e]/90 text-white px-6 py-5 rounded-none"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(search || filterStatus) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-none text-xs">
              Search: `{search}`
              <button
                onClick={() => {
                  setSearchInput('');
                  onSearchChange('');
                  onApplyFilters();
                }}
                className="hover:text-blue-900 dark:hover:text-blue-100 ml-1"
              >
                ×
              </button>
            </span>
          )}
          {filterStatus && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-none text-xs">
              Status: {filterStatus.replace('_', ' ').toUpperCase()}
              <button
                onClick={() => {
                  onStatusChange('');
                  onApplyFilters();
                }}
                className="hover:text-blue-900 dark:hover:text-blue-100 ml-1"
              >
                ×
              </button>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="rounded-none text-red-500 hover:text-white hover:bg-red-500 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All & Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
