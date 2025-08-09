import React, { useState, useEffect } from 'react';
import { type Project, Technology } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (project: Project) => void;
  project: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onUpdateProject, project }) => {
  const [formData, setFormData] = useState<Project>(project);

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.name || !formData.studentName || !formData.deadline || !formData.description) {
      alert('الرجاء تعبئة الحقول الأساسية (اسم المشروع، اسم الطالب، الموعد، الوصف)');
      return;
    }
    onUpdateProject(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-300">تعديل المشروع</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">اسم المشروع</label>
                <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="edit-studentName" className="block text-sm font-medium text-gray-300 mb-1">اسم الطالب</label>
                <input type="text" id="edit-studentName" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="edit-technology" className="block text-sm font-medium text-gray-300 mb-1">التقنية المستخدمة</label>
                <select id="edit-technology" name="technology" value={formData.technology} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  {Object.values(Technology).map((tech: Technology) => <option key={tech} value={tech}>{tech}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-300 mb-1">الموعد النهائي</label>
                <input type="date" id="edit-deadline" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">وصف المشروع</label>
              <textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div>
              <label htmlFor="edit-progressNotes" className="block text-sm font-medium text-gray-300 mb-1">ملاحظات التقدم</label>
              <textarea id="edit-progressNotes" name="progressNotes" value={formData.progressNotes} onChange={handleChange} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div>
              <label htmlFor="edit-githubLink" className="block text-sm font-medium text-gray-300 mb-1">رابط GitHub (اختياري)</label>
              <input type="url" id="edit-githubLink" name="githubLink" value={formData.githubLink || ''} onChange={handleChange} placeholder="https://github.com/user/repo" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-whatsappNumber" className="block text-sm font-medium text-gray-300 mb-1">رقم واتساب (اختياري)</label>
                    <input type="tel" id="edit-whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} placeholder="e.g. 966501234567" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="edit-telegramUsername" className="block text-sm font-medium text-gray-300 mb-1">معرف تليجرام (اختياري)</label>
                    <input type="text" id="edit-telegramUsername" name="telegramUsername" value={formData.telegramUsername || ''} onChange={handleChange} placeholder="e.g. username" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">إلغاء</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">حفظ التعديلات</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;