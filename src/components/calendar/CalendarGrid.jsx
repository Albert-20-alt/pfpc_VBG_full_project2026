import React from 'react';
import { Calendar as CalendarIcon, Users, Video, MapPin, Clock, FileText as FileTextIcon, Users as UsersIcon } from 'lucide-react'; // Keep CalendarIcon alias for clarity

const CalendarGrid = ({ currentDate, tasks, onTaskClick }) => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null); // Empty cells for previous month's days
    }
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }
    return daysArray;
  };

  const days = getDaysInMonth(currentDate);

  const getTasksForDate = (dateObj) => {
    if (!dateObj) return [];
    const dateStr = dateObj.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateStr);
  };

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

  const getTaskTypeIcon = (type) => {
    const taskType = taskTypes.find(t => t.value === type);
    return taskType ? taskType.icon : CalendarIcon;
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-t-2xl overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center font-bold text-slate-400 bg-slate-900/50 text-[10px] sm:text-sm tracking-wider uppercase">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-white/5 border-x border-b border-white/5 rounded-b-2xl overflow-hidden">
        {days.map((dateObj, index) => {
          const dayNumber = dateObj ? dateObj.getDate() : null;
          const tasksForDay = getTasksForDate(dateObj);
          const isToday = dateObj &&
            new Date().toDateString() === dateObj.toDateString();

          return (
            <div
              key={index}
              className={`min-h-[80px] sm:min-h-[140px] p-1 sm:p-2 transition-all relative group flex flex-col
                ${dayNumber ? 'bg-slate-900/40 hover:bg-slate-800/60' : 'bg-slate-950/30'}
                ${isToday ? 'bg-blue-500/5' : ''}
              `}
            >
              {dayNumber && (
                <>
                  <div className="flex items-center justify-center sm:justify-between mb-1 sm:mb-2">
                    <span className={`
                      text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-colors
                      ${isToday
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                        : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/5'}
                    `}>
                      {dayNumber}
                    </span>
                    {tasksForDay.length > 0 && (
                      <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">{tasksForDay.length} <span className="hidden lg:inline">Tâches</span></span>
                    )}
                  </div>

                  {/* Desktop View: Full Task Cards */}
                  <div className="hidden sm:flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
                    {tasksForDay.slice(0, 3).map(task => {
                      const TaskIcon = getTaskTypeIcon(task.type);
                      return (
                        <div
                          key={task.id}
                          className="group/task flex items-center space-x-1.5 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 cursor-pointer transition-all"
                          onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                        >
                          <TaskIcon className="h-3 w-3 flex-shrink-0 text-blue-400 group-hover/task:text-blue-300" />
                          <span className="truncate text-xs font-medium text-slate-300 group-hover/task:text-blue-200 leading-none">
                            {task.title}
                          </span>
                        </div>
                      );
                    })}
                    {tasksForDay.length > 3 && (
                      <div className="text-[10px] font-medium text-center text-slate-500 hover:text-blue-400 cursor-pointer py-0.5 mt-auto">
                        +{tasksForDay.length - 3} autres
                      </div>
                    )}
                  </div>

                  {/* Mobile View: Dots */}
                  <div className="flex sm:hidden flex-wrap justify-center content-start gap-1 p-1 mt-1">
                    {tasksForDay.map(task => {
                      const priorityColor = task.priority === 'high' ? 'bg-red-400' : (task.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400');
                      return (
                        <div
                          key={task.id}
                          className={`h-1.5 w-1.5 rounded-full ${priorityColor} shadow-[0_0_4px_rgba(0,0,0,0.5)]`}
                          onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid;