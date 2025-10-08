import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { todosAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Edit, Clock, AlertCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const columns = [
  { id: 'pending', title: '📋 To Do', status: 'pending' as const },
  { id: 'in_progress', title: '🚀 In Progress', status: 'in_progress' as const },
  { id: 'completed', title: '✅ Done', status: 'completed' as const },
];

export default function TasksKanban() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHarvestOpen, setIsHarvestOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await todosAPI.list();
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title,
        description: description || undefined,
        priority,
      };
      
      // Set due date if provided
      if (dueDate) {
        payload.due_date = dueDate.toISOString();
      }
      
      await todosAPI.create(payload);
      setIsCreateOpen(false);
      resetForm();
      fetchTodos();
    } catch (error: any) {
      console.error('Failed to create todo:', error);
      alert(error.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    try {
      const payload: any = {
        title,
        description: description || undefined,
        priority,
      };
      
      // Set due date if provided
      if (dueDate) {
        payload.due_date = dueDate.toISOString();
      }
      
      await todosAPI.update(editingTodo.id, payload);
      setIsEditOpen(false);
      setEditingTodo(null);
      resetForm();
      fetchTodos();
    } catch (error: any) {
      console.error('Failed to update todo:', error);
      alert(error.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await todosAPI.delete(id);
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const todoId = active.id as number;
    const newStatus = over.id as string;
    
    // Check if it's a valid status
    if (!['pending', 'in_progress', 'completed'].includes(newStatus)) return;
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.status === newStatus) return;

    // Optimistically update UI
    setTodos(prev => prev.map(t => 
      t.id === todoId ? { ...t, status: newStatus as Todo['status'] } : t
    ));

    try {
      await todosAPI.update(todoId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert on error
      fetchTodos();
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPriority(todo.priority);
    setDueDate(todo.due_date ? new Date(todo.due_date) : undefined);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getTodosByStatus = (status: Todo['status']) => {
    const filtered = todos.filter(todo => todo.status === status);
    if (status === 'completed' && !showCompleted) {
      return [];
    }
    return filtered;
  };

  const handleHarvestCompleted = async () => {
    try {
      const response = await todosAPI.harvestCompleted();
      toast.success(
        `🎉 Harvested ${response.data.harvested} task${response.data.harvested > 1 ? 's' : ''}!`,
        {
          description: `🌾 Lifetime total: ${response.data.total_completed_count} tasks completed`,
          duration: 5000,
        }
      );
      setIsHarvestOpen(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to harvest tasks:', error);
      toast.error('Failed to harvest tasks');
    }
  };

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  if (loading) {
    return <div className="text-center py-12">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Board</h1>
          <p className="text-muted-foreground mt-2">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const completedCount = todos.filter(t => t.status === 'completed').length;
              if (completedCount === 0) {
                toast.error('No completed tasks to harvest');
              } else {
                setIsHarvestOpen(true);
              }
            }}
            disabled={todos.filter(t => t.status === 'completed').length === 0}
          >
            🌾 Harvest Completed
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your board
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTodos = getTodosByStatus(column.status);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary">{columnTodos.length}</Badge>
                  </h2>
                </div>
                
                <div
                  className="flex-1 space-y-3 min-h-[500px] p-4 rounded-lg bg-muted/20 border-2 border-dashed"
                  data-status={column.status}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-primary/10');
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-primary/10');
                    const todoId = parseInt(e.dataTransfer.getData('text/plain'));
                    await handleDragEnd({
                      active: { id: todoId },
                      over: { id: column.status },
                    } as any);
                  }}
                >
                  {columnTodos.map((todo) => (
                    <Card
                      key={todo.id}
                      className="cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', todo.id.toString());
                        setActiveId(todo.id);
                      }}
                      onDragEnd={() => setActiveId(null)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{todo.title}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(todo)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(todo.id)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {todo.description && (
                          <CardDescription className="text-sm">{todo.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(todo.priority)} variant="outline">
                            {todo.priority}
                          </Badge>
                          {todo.due_date && (
                            <Badge 
                              variant="outline" 
                              className={isOverdue(todo.due_date) ? 'bg-red-50 text-red-700 border-red-200' : ''}
                            >
                              {isOverdue(todo.due_date) && <AlertCircle className="h-3 w-3 mr-1" />}
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(todo.due_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnTodos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTodo && (
            <Card className="opacity-90 rotate-3 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">{activeTodo.title}</CardTitle>
              </CardHeader>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update your task details</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <select
                  id="edit-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Harvest Confirmation Dialog */}
      <Dialog open={isHarvestOpen} onOpenChange={setIsHarvestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🌾 Harvest Tasks</DialogTitle>
            <DialogDescription>
              Delete completed tasks and add to your lifetime count.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">
                {todos.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">
                tasks to harvest
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsHarvestOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleHarvestCompleted}
              className="bg-green-600 hover:bg-green-700"
            >
              🌾 Harvest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
