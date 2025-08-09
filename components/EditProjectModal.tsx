import React, { useState, useEffect } from 'react';
import { type Project, Technology, type Task, type UpdateLogEntry, type Attachment } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { EyeIcon } from './icons/EyeIcon';


interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (project: Project) => void;
  project: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onUpdateProject, project }) => {
  const [formData, setFormData] = useState<Project>(project);
  const [newTaskText, setNewTaskText] = useState('');
  const [newUpdateText, setNewUpdateText] = useState('');


  useEffect(() => {
    // Ensure project data has the new structure
    const initialData = {
      ...project,
      tasks: project.tasks || [],
      updateLog: project.updateLog || [],
      attachments: project.attachments || [],
      startDate: project.startDate || '',
    };
    setFormData(initialData);
    setNewTaskText('');
    setNewUpdateText('');
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      isCompleted: false,
    };
    setFormData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
    setNewTaskText('');
  };

  const handleDeleteTask = (taskId: string) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const handleToggleTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  };

  const handleAddUpdate = () => {
    if(!newUpdateText.trim()) return;
    const newLogEntry: UpdateLogEntry = {
      id: `log-${Date.now()}`,
      text: newUpdateText.trim(),
      timestamp: new Date().toISOString(),
    };
    setFormData(prev => ({...prev, updateLog: [...(prev.updateLog || []), newLogEntry]}));
    setNewUpdateText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("حجم الملف كبير جدًا. الرجاء اختيار ملف أصغر من 5 ميجابايت.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const newAttachment: Attachment = {
                id: `att-${Date.now()}`,
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: dataUrl
            };
            setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment]}));
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attachmentId)}));
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.name || !formData.studentName || !formData.startDate || !formData.deadline || !formData.description) {
      alert('الرجاء تعبئة الحقول الأساسية (اسم المشروع، اسم الطالب، تاريخ البدء، الموعد، الوصف)');
      return;
    }
    onUpdateProject(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-full">
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-cyan-300">تعديل المشروع</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">اسم المشروع</label>
                <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="edit-studentName" className="block text-sm font-medium text-gray-300 mb-1">اسم الطالب</label>
                <input type="text" id="edit-studentName" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ البدء</label>
                <input type="date" id="edit-startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-300 mb-1">الموعد النهائي</label>
                <input type="date" id="edit-deadline" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="edit-technology" className="block text-sm font-medium text-gray-300 mb-1">التقنية المستخدمة</label>
              <select id="edit-technology" name="technology" value={formData.technology} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {Object.values(Technology).map((tech: Technology) => <option key={tech} value={tech}>{tech}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">وصف المشروع</label>
              <textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            
            {/* --- Progress Management --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
              {/* Tasks List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-200">قائمة المهام</h3>
                <div className="flex gap-2">
                  <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="إضافة مهمة جديدة..." className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  <button type="button" onClick={handleAddTask} className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {formData.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-md">
                      <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleTask(task.id)} className="w-5 h-5 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-600 focus:ring-2 ring-offset-gray-800 cursor-pointer" />
                      <span className={`flex-grow text-white ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>{task.text}</span>
                      <button type="button" onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Log */}
              <div className="space-y-3">
                 <h3 className="font-semibold text-lg text-gray-200">سجل التحديثات</h3>
                 <div className="flex flex-col gap-2">
                    <textarea value={newUpdateText} onChange={(e) => setNewUpdateText(e.target.value)} placeholder="إضافة تحديث جديد..." rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    <button type="button" onClick={handleAddUpdate} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md self-end">إضافة تحديث</button>
                 </div>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                   {formData.updateLog.slice().reverse().map(log => (
                      <div key={log.id} className="bg-gray-700/50 p-2 rounded-md text-sm">
                        <p className="text-gray-300">{log.text}</p>
                        <p className="text-gray-500 text-xs mt-1">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
                      </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* --- Attachments --- */}
            <div className="pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-lg text-gray-200 mb-3 flex items-center gap-2">
                    <PaperClipIcon className="w-5 h-5" />
                    المرفقات
                </h3>
                <div className="space-y-3">
                     <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                         {(formData.attachments || []).map(att => (
                             <div key={att.id} className="flex items-center justify-between gap-3 bg-gray-700/50 p-2 rounded-md">
                                <div className="flex-grow truncate">
                                    <p className="text-white truncate" title={att.name}>{att.name}</p>
                                    <p className="text-gray-400 text-xs">{(att.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <a href={att.dataUrl} download={att.name} className="text-cyan-400 hover:text-cyan-300 p-1" title="تحميل/عرض">
                                        <EyeIcon className="w-5 h-5" />
                                    </a>
                                    <button type="button" onClick={() => handleDeleteAttachment(att.id)} className="text-red-500 hover:text-red-400 p-1" title="حذف">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                         ))}
                     </div>
                     <div>
                        <label htmlFor="attachment-upload" className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-block">
                            إضافة مرفق
                        </label>
                        <input type="file" id="attachment-upload" className="hidden" onChange={handleFileChange} />
                     </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                    <label htmlFor="edit-githubLink" className="block text-sm font-medium text-gray-300 mb-1">رابط GitHub (اختياري)</label>
                    <input type="url" id="edit-githubLink" name="githubLink" value={formData.githubLink || ''} onChange={handleChange} placeholder="https://github.com/user/repo" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="edit-whatsappNumber" className="block text-sm font-medium text-gray-300 mb-1">رقم واتساب (اختياري)</label>
                    <input type="tel" id="edit-whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} placeholder="e.g. 966501234567" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="edit-telegramUsername" className="block text-sm font-medium text-gray-300 mb-1">معرف تليجرام (اختياري)</label>
                    <input type="text" id="edit-telegramUsername" name="telegramUsername" value={formData.telegramUsername || ''} onChange={handleChange} placeholder="e.g. username" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
          </div>
           <div className="flex justify-end gap-4 pt-4 flex-shrink-0">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">إلغاء</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">حفظ التعديلات</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;