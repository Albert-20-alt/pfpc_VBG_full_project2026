
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Edit, Users, Video, FileText as FileTextIcon, Users as UsersIcon } from 'lucide-react'; // Keep CalendarIcon alias
import { toast } from '@/components/ui/use-toast';

const UpcomingTasksList = ({ tasks, onTaskClick, currentUser, allUsers }) => {
  const upcomingTasks = tasks
    .filter(task => new Date(task.date) >= new Date()) // Tasks from today onwards
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)) // Sort by date then time
    .slice(0, 5); // Show top 5

  const taskTypesMeta = {
    case_listening: { icon: Users, label: 'Écoute / Prise en charge' },
    legal_assistance: { icon: FileTextIcon, label: 'Accompagnement Juridique' },
    medical_assistance: { icon: FileTextIcon, label: 'Accompagnement Médical' },
    social_support: { icon: UsersIcon, label: 'Suivi Psychosocial' },
    awareness: { icon: UsersIcon, label: 'Sensibilisation' },
    coordination: { icon: UsersIcon, label: 'Coordination' },
    training: { icon: CalendarIcon, label: 'Formation' },
    other: { icon: CalendarIcon, label: 'Autre' },
    default: { icon: CalendarIcon, label: 'Tâche' }
  };

  const prioritiesMeta = {
    low: { label: 'Faible', color: 'text-green-400' },
    medium: { label: 'Moyenne', color: 'text-yellow-400' },
    high: { label: 'Élevée', color: 'text-red-400' },
    default: { label: '', color: 'text-gray-400' }
  };

  const getTaskMeta = (type) => taskTypesMeta[type] || taskTypesMeta.default;
  const getPriorityMeta = (priority) => prioritiesMeta[priority] || prioritiesMeta.default;

  const handleEditClick = (task) => {
    if (currentUser.role === 'admin' && task.createdBy && allUsers.find(u => String(u.id) === String(task.createdBy))?.role === 'super-admin') {
      toast({ title: "Action non autorisée", description: "Les administrateurs ne peuvent pas modifier les tâches/réunions créées par un Super Admin.", variant: "destructive" });
      return;
    }
    if (currentUser.role === 'agent') {
      // Agents can only edit tasks if they are the assignedTo person, and it's not a meeting created by admin/super-admin
      // This logic might need refinement based on exact agent permissions for tasks.
      // For now, let's assume agents can't edit tasks assigned by others.
      if (task.assignedTo !== currentUser.id && task.createdBy !== currentUser.id) {
        toast({ title: "Action non autorisée", description: "Vous ne pouvez pas modifier cette tâche.", variant: "destructive" });
        return;
      }
    }
    onTaskClick(task);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="tracking-tight text-xl font-bold text-white">Tâches à Venir</CardTitle>
          <CardDescription className="text-slate-400">Vos prochaines activités planifiées.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {upcomingTasks.map((task, index) => {
                const TaskIcon = getTaskMeta(task.type).icon;
                const priorityInfo = getPriorityMeta(task.priority);
                const canEdit = !(currentUser.role === 'admin' && task.createdBy && allUsers.find(u => String(u.id) === String(task.createdBy))?.role === 'super-admin') &&
                  !(currentUser.role === 'agent' && task.assignedTo !== currentUser.id && task.createdBy !== currentUser.id);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10 transition-all cursor-pointer gap-4"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors shrink-0">
                        <TaskIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors text-base sm:text-lg leading-tight mb-1">{task.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center whitespace-nowrap">
                            <CalendarIcon className="h-3 w-3 mr-1.5 opacity-60 text-blue-400" />
                            {new Date(task.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1.5 opacity-60 text-purple-400" />
                            {task.time}
                          </span>
                          {task.location && (
                            <span className="flex items-center truncate max-w-[150px]">
                              <MapPin className="h-3 w-3 mr-1.5 opacity-60 text-emerald-400" />
                              {task.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-[52px] sm:pl-0 w-full sm:w-auto mt-[-8px] sm:mt-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border border-white/5 ${priorityInfo.color} bg-white/5`}>
                        {priorityInfo.label}
                      </span>
                      {(currentUser.role === 'super-admin' || (currentUser.role === 'admin' && !(task.createdBy && allUsers.find(u => String(u.id) === String(task.createdBy))?.role === 'super-admin'))) && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditClick(task); }} disabled={!canEdit} className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-white/50 py-8">Aucune tâche planifiée pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpcomingTasksList;
