import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FarmTask } from "@shared/schema";

export default function Schedule() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  const { data: tasks, isLoading } = useQuery<FarmTask[]>({
    queryKey: ["/api/tasks"],
  });

  const createTask = useMutation({
    mutationFn: async (task: typeof newTask) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowForm(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      toast({ title: t('common.success'), description: t('schedule.taskCreated') });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t('common.success'), description: t('schedule.taskDeleted') });
    },
  });

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const overdueTasks = tasks?.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    return new Date(t.dueDate) < new Date();
  }) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary">{t('schedule.title')}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">{t('schedule.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 whitespace-nowrap" data-testid="button-add-task">
          <Plus className="w-4 h-4" />
          {t('schedule.addTask')}
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-orange-600 flex-wrap">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{t('schedule.overdue')} ({overdueTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">{overdueTasks.length}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-blue-600 flex-wrap">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{t('schedule.pending')} ({pendingTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">{pendingTasks.length}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-green-600 flex-wrap">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{t('schedule.completed')} ({completedTasks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{completedTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            exit={ { opacity: 0, height: 0 } }
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{t('schedule.addTask')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">{t('schedule.taskName')}</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder={t('schedule.taskNamePlaceholder')}
                      data-testid="input-task-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">{t('schedule.dueDate')}</Label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      data-testid="input-task-date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm md:text-base">{t('schedule.priority')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <Button
                        key={p}
                        variant={newTask.priority === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        data-testid={`button-priority-${p}`}
                      >
                        {t(`schedule.${p}`)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    onClick={() => createTask.mutate(newTask)}
                    disabled={!newTask.title || createTask.isPending}
                    data-testid="button-save-task"
                    className="w-full sm:w-auto"
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <span>{t('schedule.upcoming')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm md:text-base">{t('common.loading')}</p>
          ) : tasks?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm md:text-base">{t('schedule.noTasks')}</p>
          ) : (
            <div className="space-y-3">
              {tasks?.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={ { opacity: 0 } }
                  animate={ { opacity: 1 } }
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 rounded-xl bg-muted/30 border border-muted hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => updateTask.mutate({ 
                        id: task.id, 
                        status: task.status === 'completed' ? 'pending' : 'completed' 
                      })}
                      className="shrink-0 mt-0.5 sm:mt-0"
                      data-testid={`button-toggle-task-${task.id}`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm md:text-base break-words ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline" className={getPriorityColor(task.priority || 'medium')} data-testid={`badge-priority-${task.id}`}>
                      {t(`schedule.${task.priority || 'medium'}`)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask.mutate(task.id)}
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
