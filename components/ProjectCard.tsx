import React from 'react';
import { type Project, Status, statusDetails } from '../services/types';
import { PencilIcon } from './icons/PencilIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectCardProps {
  project: Project;
  onUpdateStatus: (projectId: string, newStatus: Status) => void;
  onOpenEditModal: (project: Project) => void;
  onOpenNotificationModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateStatus, onOpenEditModal, onOpenNotificationModal, onDeleteProject }) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col justify-between border-t-4 ${statusDetails[project.status]?.borderColor ?? 'border-gray-500'} transform hover:-translate-y-1 transition-transform duration-300`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-cyan-300">{project.name}</h3>
          <span className="text-sm font-semibold bg-gray-700 text-cyan-300 px-2 py-1 rounded">
            {project.technology}
          </span>
        </div>
        <p className="text-gray-400 mt-1">الطالب: {project.studentName}</p>
        
        <div className="mt-4 space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-gray-300">الوصف:</h4>
                <p className="text-gray-400 max-h-16 overflow-y-auto pr-2">{project.description}</p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-300">آخر المستجدات:</h4>
                <p className="text-gray-400 max-h-16 overflow-y-auto pr-2">{project.progressNotes}</p>
            </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
          <span>الموعد النهائي:</span>
          <span>{new Date(project.deadline).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
            <select
                value={project.status}
                onChange={(e) => onUpdateStatus(project.id, e.target.value as Status)}
                className={`text-sm font-bold text-white px-3 py-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${statusDetails[project.status]?.color ?? 'bg-gray-500'} border-2 border-transparent focus:border-indigo-400`}
                aria-label="تغيير حالة المشروع"
            >
                {Object.values(Status).map((s: Status) => <option key={s} value={s} className="bg-gray-700 font-bold">{s}</option>)}
            </select>

            <div className="flex items-center gap-1">
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