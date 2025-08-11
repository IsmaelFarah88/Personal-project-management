
import React, { useState, useRef, useEffect } from 'react';
import { type Project, Status, statusDetails } from '../services/types';
import { PencilIcon } from './icons/PencilIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';

interface ProjectCardProps {
  project: Project;
  onUpdateStatus: (projectId: string, newStatus: Status) => void;
  onOpenEditModal: (project: Project) => void;
  onOpenNotificationModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onAddTask: (projectId: string, taskText: string) => void;
  onAddUpdate: (projectId: string, updateText: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateStatus, onOpenEditModal, onOpenNotificationModal, onDeleteProject, onUpdateProject, onAddTask, onAddUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(project.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const completedTasks = project.tasks?.filter(t => t.isCompleted).length ?? 0;
  const totalTasks = project.tasks?.length ?? 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const latestUpdate = project.updateLog && project.updateLog.length > 0 ? project.updateLog[project.updateLog.length - 1] : null;

  const handleNameSave = () => {
    if (editingNameValue.trim() && editingNameValue !== project.name) {
      onUpdateProject({ ...project, name: editingNameValue });
    }
    setIsEditingName(false);
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setEditingNameValue(project.name);
      setIsEditingName(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(project.id, newTaskText.trim());
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleAddUpdate = () => {
    if (newUpdateText.trim()) {
      onAddUpdate(project.id, newUpdateText.trim());
      setNewUpdateText('');
      setIsAddingUpdate(false);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col justify-between border-t-4 ${statusDetails[project.status]?.borderColor ?? 'border-gray-500'} transform hover:-translate-y-1 transition-transform duration-300`}>
      <div>
        <div className="flex justify-between items-start">
          {isEditingName ? (
            <div className="flex-grow flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editingNameValue}
                onChange={(e) => setEditingNameValue(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameSave}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-white text-xl font-bold focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={handleNameSave} className="p-1 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
              <button onClick={() => setIsEditingName(false)} className="p-1 text-red-400 hover:text-red-300"><XMarkIcon className="w-5 h-5"/></button>
            </div>
          ) : (
            <h3 onClick={() => setIsEditingName(true)} className="text-xl font-bold text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors">
              {project.name}
            </h3>
          )}
          <span className="text-sm font-semibold bg-gray-700 text-cyan-300 px-2 py-1 rounded flex-shrink-0 ml-2">
            {project.technology}
          </span>
        </div>
        <p className="text-gray-400 mt-1">الطالب: {project.studentName}</p>
        
        <div className="mt-4 space-y-4 text-sm">
            <div>
                <h4 className="font-semibold text-gray-300">الوصف:</h4>
                <p className="text-gray-400 max-h-16 overflow-y-auto pr-2">{project.description}</p>
            </div>
            {totalTasks > 0 && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-300">تقدم المهام</span>
                          <button onClick={() => setIsAddingTask(true)} className="text-cyan-400 hover:text-cyan-300"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        <span className="text-gray-400">{completedTasks}/{totalTasks}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            )}
             {isAddingTask && (
              <div className="flex items-center gap-2 mt-2">
                  <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()} placeholder="أدخل مهمة جديدة..." className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-1 focus:ring-indigo-500" autoFocus/>
                  <button onClick={handleAddTask} className="p-1 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                  <button onClick={() => setIsAddingTask(false)} className="p-1 text-red-400 hover:text-red-300"><XMarkIcon className="w-5 h-5"/></button>
              </div>
            )}
             {latestUpdate && (
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-300">آخر تحديث:</h4>
                        <button onClick={() => setIsAddingUpdate(true)} className="text-cyan-400 hover:text-cyan-300"><PlusIcon className="w-4 h-4"/></button>
                    </div>
                    <p className="text-gray-400 truncate" title={latestUpdate.text}>{latestUpdate.text}</p>
                </div>
            )}
            {isAddingUpdate && (
              <div className="flex flex-col gap-2 mt-2">
                  <textarea value={newUpdateText} onChange={e => setNewUpdateText(e.target.value)} placeholder="أدخل تحديثًا جديدًا..." rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-1 focus:ring-indigo-500" autoFocus></textarea>
                  <div className="flex justify-end gap-2">
                    <button onClick={handleAddUpdate} className="p-1 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsAddingUpdate(false)} className="p-1 text-red-400 hover:text-red-300"><XMarkIcon className="w-5 h-5"/></button>
                  </div>
              </div>
            )}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
          <span>الموعد النهائي:</span>
          <span>{new Date(project.deadline).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        
        <div className="mt-4 flex flex-wrap justify-center sm:justify-between items-center gap-3">
            <select
                value={project.status}
                onChange={(e) => onUpdateStatus(project.id, e.target.value as Status)}
                className={`text-sm font-bold text-white px-3 py-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${statusDetails[project.status]?.color ?? 'bg-gray-500'} border-2 border-transparent focus:border-indigo-400`}
                aria-label="تغيير حالة المشروع"
            >
                {Object.values(Status).map((s: Status) => <option key={s} value={s} className="bg-gray-700 font-bold">{s}</option>)}
            </select>

            <div className="flex items-center gap-1">
                 {project.attachments && project.attachments.length > 0 && (
                    <button onClick={() => onOpenEditModal(project)} className="p-2 text-gray-400 hover:text-white transition-colors group relative" aria-label="عرض المرفقات">
                        <PaperClipIcon className="w-6 h-6" />
                         <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {project.attachments.length} مرفقات
                        </span>
                    </button>
                )}
                 {project.githubLink && (
                    <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors group relative"
                        aria-label="رابط GitHub"
                    >
                        <GitHubIcon className="w-6 h-6" />
                        <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          GitHub
                        </span>
                    </a>
                )}
                {project.whatsappNumber && (
                    <button onClick={() => onOpenNotificationModal(project)} className="p-2 text-green-400 hover:text-green-300 transition-colors group relative" aria-label="إرسال إشعار واتساب">
                        <WhatsAppIcon className="w-6 h-6" />
                        <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">إرسال واتساب</span>
                    </button>
                )}
                {project.telegramUsername && (
                    <button onClick={() => onOpenNotificationModal(project)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors group relative" aria-label="إرسال إشعار تليجرام">
                        <TelegramIcon className="w-6 h-6" />
                        <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">إرسال تليجرام</span>
                    </button>
                )}
                <button
                    onClick={() => onOpenEditModal(project)}
                    className="p-2 text-gray-400 hover:text-white transition-colors group relative"
                    aria-label="تعديل المشروع"
                >
                    <PencilIcon className="w-6 h-6" />
                     <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        تعديل
                    </span>
                </button>
                <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors group relative"
                    aria-label="حذف المشروع"
                >
                    <TrashIcon className="w-6 h-6" />
                    <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        حذف
                    </span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
