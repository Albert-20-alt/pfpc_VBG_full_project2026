
import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar as CalendarIcon, MapPin, Video, Clock, Link as LinkIcon, UserPlus, FileText as FileTextIcon, Users as UsersIcon, Trash2, CheckCircle2, Circle, XCircle } from 'lucide-react';


const TaskFormModal = ({ isOpen, onClose, onSubmit, onDelete, taskData, setTaskData, selectedTask, currentUser, allUsers }) => {
  const taskTypes = [
    { value: 'case_listening', label: 'Écoute / Prise en charge', icon: Users },
    { value: 'legal_assistance', label: 'Accompagnement Juridique', icon: FileTextIcon },
    { value: 'medical_assistance', label: 'Accompagnement Médical', icon: FileTextIcon },
    { value: 'social_support', label: 'Suivi Psychosocial', icon: UsersIcon },
    { value: 'awareness', label: 'Sensibilisation', icon: UsersIcon },
    { value: 'coordination', label: 'Coordination', icon: UsersIcon },
    { value: 'training', label: 'Formation', icon: CalendarIcon },
    { value: 'other', label: 'Autre', icon: CalendarIcon }
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' }
  ];

  const handleChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, value) => {
    setTaskData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(taskData);
  };

  const availableUsersForMeeting = allUsers.filter(u => u.id !== currentUser.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{selectedTask ? 'Modifier la Tâche/Réunion' : 'Nouvelle Tâche/Réunion'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedTask ? 'Mettez à jour les détails.' : 'Planifiez une nouvelle activité.'}
              </DialogDescription>
            </div>
            {selectedTask && (
              <div className="flex gap-2">
                {taskData.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Circle className="h-3 w-3" />
                    En attente
                  </span>
                )}
                {taskData.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Terminée
                  </span>
                )}
                {taskData.status === 'cancelled' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    <XCircle className="h-3 w-3" />
                    Annulée
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogHeader>
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-slate-300">Titre</Label>
              <Input id="title" value={taskData.title} onChange={(e) => handleChange('title', e.target.value)} required className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>
            <div>
              <Label htmlFor="date" className="text-slate-300">Date</Label>
              <Input id="date" type="date" value={taskData.date} onChange={(e) => handleChange('date', e.target.value)} required className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>
            <div>
              <Label htmlFor="time" className="text-slate-300">Heure</Label>
              <Input id="time" type="time" value={taskData.time} onChange={(e) => handleChange('time', e.target.value)} required className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>
            <div>
              <Label htmlFor="type" className="text-slate-300">Type</Label>
              <Select value={taskData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className="bg-slate-900/50 border-white/10 focus:border-blue-500/50"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  {taskTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority" className="text-slate-300">Priorité</Label>
              <Select value={taskData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger className="bg-slate-900/50 border-white/10 focus:border-blue-500/50"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  {priorities.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {currentUser.role === 'super-admin' && (
              <>
                <div>
                  <Label htmlFor="assignedTo" className="text-slate-300">Assigné à (Responsable)</Label>
                  <Select value={taskData.assignedTo ? String(taskData.assignedTo) : ''} onValueChange={(value) => handleChange('assignedTo', value)}>
                    <SelectTrigger className="bg-slate-900/50 border-white/10 focus:border-blue-500/50"><SelectValue placeholder="Sélectionner un responsable" /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                      {allUsers.map(u => (<SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.role})</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="participants" className="text-slate-300">Participants (Ctrl+Clic pour multiple)</Label>
                  <select
                    id="participants"
                    multiple
                    value={taskData.participants || []}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      handleChange('participants', selectedOptions);
                    }}
                    className="w-full p-2 rounded-md bg-slate-900/50 border border-white/10 min-h-[100px] text-sm focus:outline-none focus:border-blue-500/50 text-slate-300"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Sélectionnez les participants à inviter.</p>
                </div>
              </>
            )}

            {currentUser.role !== 'super-admin' && (
              <div>
                <Label htmlFor="assignedTo" className="text-slate-300">Assigné à (principal)</Label>
                <Input id="assignedTo" value={taskData.assignedTo ? allUsers.find(u => String(u.id) === String(taskData.assignedTo))?.name : currentUser.name} readOnly className="bg-slate-900/30 border-white/5 text-slate-400" />
              </div>
            )}

            <div>
              <Label htmlFor="location" className="text-slate-300">Lieu (si applicable)</Label>
              <Input id="location" value={taskData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Ex: Bureau régional, Salle de réunion X" className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>

            {taskData.type === 'videoconf' && (
              <div className="md:col-span-2">
                <Label htmlFor="meetingLink" className="text-slate-300">Lien Visioconférence (Zoom/Meet)</Label>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-slate-500" />
                  <Input id="meetingLink" value={taskData.meetingLink} onChange={(e) => handleChange('meetingLink', e.target.value)} placeholder="https://zoom.us/... ou https://meet.google.com/..." className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="relatedCaseId" className="text-slate-300">ID Cas Associé (optionnel)</Label>
              <Input id="relatedCaseId" value={taskData.relatedCaseId} onChange={(e) => handleChange('relatedCaseId', e.target.value)} placeholder="Ex: 12345" className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-slate-300">Description / Ordre du jour</Label>
              <Textarea id="description" value={taskData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="bg-slate-900/50 border-white/10 focus:border-blue-500/50" />
            </div>          </div>
          <DialogFooter className="pt-4">
            <div className="w-full space-y-3">
              {selectedTask && (
                <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
                  <span className="text-sm text-slate-400 font-medium">Changer le statut:</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant={taskData.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => handleChange('status', 'completed')}
                      className="gap-1.5 flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Terminée
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={taskData.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => handleChange('status', 'pending')}
                      className="gap-1.5 flex-1"
                    >
                      <Circle className="h-4 w-4" />
                      En attente
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={taskData.status === 'cancelled' ? 'destructive' : 'outline'}
                      onClick={() => handleChange('status', 'cancelled')}
                      className="gap-1.5 flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Annulée
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  {selectedTask && onDelete && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => onDelete(selectedTask.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">{selectedTask ? 'Modifier' : 'Créer'}</Button>
                </div>
              </div>
            </div>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
