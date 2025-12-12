import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { userApi, User as UserType } from '@/lib/user-api';
import { useAuth } from '@/app/providers/AuthProvider'; 

interface UserSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function UserSelect({
  value,
  onChange,
  placeholder = "Select users...",
  disabled = false,
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  useEffect(() => {
    fetchUsers();
  }, [user]); 

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();

      const loggedInUserRole = user?.role; 

      let filteredUsers: UserType[] = [];

      if (loggedInUserRole === 'owner' || loggedInUserRole === 'co_owner') {
        filteredUsers = data; 
      } else if (loggedInUserRole === 'project_manager') {
        filteredUsers = data.filter(user => user.role === 'project_manager');
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUsers = users.filter(user => value.includes(user._id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white dark:bg-[#3c3c3c] border-gray-300 dark:border-gray-700 rounded-none"
            disabled={disabled || loading}
          >
            <div className="flex items-center gap-2">
              {selectedUsers.length > 0 ? (
                <div className="flex -space-x-2">
                  {selectedUsers.slice(0, 3).map((user) => (
                    <Avatar
                      key={user._id}
                      className="w-6 h-6 border-2 border-white dark:border-[#3c3c3c]"
                    >
                      <AvatarImage src={user.display_image} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {selectedUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#3c3c3c] flex items-center justify-center text-xs">
                      +{selectedUsers.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white dark:bg-[#3c3c3c] border-gray-300 dark:border-gray-700">
          <Command>
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const isSelected = value.includes(user._id);
                  return (
                    <CommandItem
                      key={user._id}
                      value={user._id}
                      onSelect={() => {
                        if (isSelected) {
                          onChange(value.filter((id) => id !== user._id));
                        } else {
                          onChange([...value, user._id]);
                        }
                      }}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3c3c3c]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.display_image} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#2b564e]" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user._id}
              variant="secondary"
              className="flex items-center gap-2 bg-gray-100 dark:bg-[#3c3c3c] text-gray-700 dark:text-gray-300"
            >
              <Avatar className="w-4 h-4">
                <AvatarImage src={user.display_image} />
                <AvatarFallback className="text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== user._id))}
                className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
