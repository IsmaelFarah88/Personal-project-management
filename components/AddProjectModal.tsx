
import React, { useState } from 'react';
import { type Project, Technology, Status } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id' | 'tasks' | 'updateLog' | 'attachments'>) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAddProject, showToast }) => {
  const [name, setName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [technology, setTechnology] = useState<Technology>(Technology.Python);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentName || !startDate || !deadline || !description) {
      showToast('الرجاء تعبئة الحقول الأساسية (اسم المشروع، اسم الطالب، تاريخ البدء، الموعد، الوصف)', 'error');
      return;
    }
    onAddProject({
      name,
      studentName,
      technology,
      startDate,
      deadline,
      description,
      status: Status.NotStarted,
      githubLink,
      whatsappNumber,
      telegramUsername
    });
    // Reset form
    setName('');
    setStudentName('');
    setTechnology(Technology.Python);
    setStartDate('');
    setDeadline('');
    setDescription('');
    setGithubLink('');
    setWhatsappNumber('');
    setTelegramUsername('');
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-300">إضافة مشروع جديد</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-gray-300 mb-1">اسم المشروع</label>
                <input type="text" id="add-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="add-studentName" className="block text-sm font-medium text-gray-300 mb-1">اسم الطالب</label>
                <input type="text" id="add-studentName" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="add-startDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ البدء</label>
                    <input type="date" id="add-startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="add-deadline" className="block text-sm font-medium text-gray-300 mb-1">الموعد النهائي</label>
                    <input type="date" id="add-deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
             <div>
                <label htmlFor="add-technology" className="block text-sm font-medium text-gray-300 mb-1">التقنية المستخدمة</label>
                <select id="add-technology" value={technology} onChange={e => setTechnology(e.target.value as Technology)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  {Object.values(Technology).map((tech: Technology) => <option key={tech} value={tech}>{tech}</option>)}
                </select>
              </div>
             <div>
                <label htmlFor="add-description" className="block text-sm font-medium text-gray-300 mb-1">وصف المشروع</label>
                <textarea id="add-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div>
              <label htmlFor="add-githubLink" className="block text-sm font-medium text-gray-300 mb-1">رابط GitHub (اختياري)</label>
              <input type="url" id="add-githubLink" value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="https://github.com/user/repo" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="add-whatsappNumber" className="block text-sm font-medium text-gray-300 mb-1">رقم واتساب (اختياري)</label>
                    <input type="tel" id="add-whatsappNumber" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="e.g. 966501234567" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="add-telegramUsername" className="block text-sm font-medium text-gray-300 mb-1">معرف تليجرام (اختياري)</label>
                    <input type="text" id="add-telegramUsername" value={telegramUsername} onChange={e => setTelegramUsername(e.target.value)} placeholder="e.g. username" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">إلغاء</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">إضافة المشروع</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
