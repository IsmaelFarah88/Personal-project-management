
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type Project, Technology, type Task, type UpdateLogEntry, type Attachment } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { EyeIcon } from './icons/EyeIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { suggestTasksForProject } from '../services/geminiService';
import Spinner from './Spinner';
import { CheckIcon } from './icons/CheckIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (project: Project) => void;
  project: Project;
  showToast: (message: string, type: 'success' | 'error') => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

type Tab = 'details' | 'progress' | 'attachments';

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onUpdateProject, project, showToast, showConfirmation }) => {
  const [formData, setFormData] = useState<Project>(project);
  const initialFormDataRef = useRef<Project>(project);
  const [newTaskText, setNewTaskText] = useState('');
  const [newUpdateText, setNewUpdateText] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        const initialData = {
          ...project,
          tasks: project.tasks || [],
          updateLog: project.updateLog || [],
          attachments: project.attachments || [],
          startDate: project.startDate || '',
        };
        setFormData(initialData);
        initialFormDataRef.current = JSON.parse(JSON.stringify(initialData));
        setNewTaskText('');
        setNewUpdateText('');
        setActiveTab('details');
        setSuggestedTasks([]);
        setEditingTaskId(null);
    }
  }, [project, isOpen]);
  
  useEffect(() => {
    if (editingTaskId && taskInputRef.current) {
      taskInputRef.current.focus();
      taskInputRef.current.select();
    }
  }, [editingTaskId]);

  const handleCloseAttempt = useCallback(() => {
    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);
    if (hasUnsavedChanges) {
      showConfirmation(
        'تجاهل التغييرات؟',
        'لديك تغييرات لم يتم حفظها. هل أنت متأكد أنك تريد الإغلاق؟',
        onClose
      );
    } else {
      onClose();
    }
  }, [formData, onClose, showConfirmation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStartEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleCommitTaskEdit = () => {
    if (!editingTaskId) return;
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === editingTaskId ? { ...t, text: editingTaskText.trim() || t.text } : t
      )
    }));
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleTaskEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitTaskEdit();
    } else if (e.key === 'Escape') {
      handleCancelTaskEdit();
    }
  };

  const handleAddTask = useCallback((taskText: string) => {
    if (!taskText.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: taskText.trim(),
      isCompleted: false,
    };
    setFormData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
    setNewTaskText('');
  }, []);

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
            showToast("حجم الملف كبير جدًا. الرجاء اختيار ملف أصغر من 5 ميجابايت.", 'error');
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
  
    const handleSuggestTasks = async () => {
        if (!formData.name || !formData.description) {
            showToast('يجب توفر اسم المشروع والوصف لاقتراح المهام.', 'error');
            return;
        }
        setIsSuggesting(true);
        setSuggestedTasks([]);
        try {
            const tasks = await suggestTasksForProject(formData.name, formData.description);
            if (tasks.length > 0) {
                setSuggestedTasks(tasks);
                showToast('تم اقتراح المهام بنجاح.', 'success');
            } else {
                 showToast('لم يتمكن الذكاء الاصطناعي من اقتراح مهام. حاول تغيير الوصف.', 'error');
            }
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAddSuggestedTask = (taskText: string) => {
        const newTask: Task = { id: `task-${Date.now()}`, text: taskText.trim(), isCompleted: false };
        setFormData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
        setSuggestedTasks(prev => prev.filter(t => t !== taskText));
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.name || !formData.studentName || !formData.startDate || !formData.deadline || !formData.description) {
      showToast('الرجاء تعبئة الحقول الأساسية (اسم المشروع، اسم الطالب، تاريخ البدء، الموعد، الوصف)', 'error');
      setActiveTab('details');
      return;
    }
    onUpdateProject(formData);
  };

  if (!isOpen) return null;

  const TabButton = ({ tab, label, children }: { tab: Tab, label: string, children: React.ReactNode}) => (
      <button
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base font-semibold border-b-2 transition-colors duration-200 ${
              activeTab === tab 
              ? 'border-indigo-400 text-indigo-300' 
              : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
          }`}
          role="tab"
          aria-selected={activeTab === tab}
      >
          {children}
          <span className="hidden sm:inline">{label}</span>
      </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseAttempt}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
          <header className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-cyan-300">تعديل المشروع</h2>
            <button type="button" onClick={handleCloseAttempt} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="flex border-b border-gray-700 -mx-6 px-2 sm:px-4" role="tablist">
              <TabButton tab="details" label="التفاصيل"><InformationCircleIcon className="w-5 h-5"/></TabButton>
              <TabButton tab="progress" label="التقدم"><ListBulletIcon className="w-5 h-5"/></TabButton>
              <TabButton tab="attachments" label="المرفقات"><PaperClipIcon className="w-5 h-5"/></TabButton>
          </div>
          
          <main className="overflow-y-auto pr-4 -mr-4 flex-grow custom-scrollbar mt-6">
            <div role="tabpanel" hidden={activeTab !== 'details'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">اسم المشروع</label>
                        <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label htmlFor="edit-studentName" className="block text-sm font-medium text-gray-300 mb-1">اسم الطالب</label>
                        <input type="text" id="edit-studentName" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ البدء</label>
                        <input type="date" id="edit-startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-300 mb-1">الموعد النهائي</label>
                        <input type="date" id="edit-deadline" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="edit-technology" className="block text-sm font-medium text-gray-300 mb-1">التقنية المستخدمة</label>
                      <select id="edit-technology" name="technology" value={formData.technology} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500">
                        {Object.values(Technology).map((tech: Technology) => <option key={tech} value={tech}>{tech}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">وصف المشروع</label>
                      <textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"></textarea>
                    </div>
                </div>
            </div>
            
            <div role="tabpanel" hidden={activeTab !== 'progress'}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Tasks Column */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-200 text-lg">قائمة المهام</h3>
                    <div className="flex gap-2">
                      <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') { e.preventDefault(); handleAddTask(newTaskText);}}} placeholder="إضافة مهمة جديدة..." className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                      <button type="button" onClick={() => handleAddTask(newTaskText)} className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md shrink-0"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {formData.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-md">
                           <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => handleToggleTask(task.id)}
                                className="w-5 h-5 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-600 focus:ring-2 ring-offset-gray-800 cursor-pointer flex-shrink-0"
                            />
                            {editingTaskId === task.id ? (
                                <div className="flex-grow flex items-center gap-2">
                                    <input
                                        ref={taskInputRef}
                                        type="text"
                                        value={editingTaskText}
                                        onChange={(e) => setEditingTaskText(e.target.value)}
                                        onKeyDown={handleTaskEditKeyDown}
                                        className="flex-grow bg-gray-900 border border-indigo-500 rounded-md px-2 py-1 text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button type="button" onClick={handleCommitTaskEdit} className="p-1 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                                    <button type="button" onClick={handleCancelTaskEdit} className="p-1 text-red-400 hover:text-red-300"><XMarkIcon className="w-5 h-5"/></button>
                                </div>
                            ) : (
                                <span
                                    onClick={() => handleStartEditingTask(task)}
                                    className={`flex-grow text-white cursor-pointer hover:bg-gray-700/80 rounded-md -m-1 p-1 transition-colors ${task.isCompleted ? 'line-through text-gray-400' : ''}`}
                                >
                                    {task.text}
                                </span>
                            )}
                          <button type="button" onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-400 p-1 shrink-0"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                    {/* AI Helper Section */}
                    <div className="pt-2">
                        <button type="button" onClick={handleSuggestTasks} disabled={isSuggesting} className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
                            {isSuggesting ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                            <span>{isSuggesting ? 'جاري التفكير...' : 'اقترح مهام بالذكاء الاصطناعي'}</span>
                        </button>
                    </div>
                    {suggestedTasks.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-700">
                             <h4 className="font-semibold text-gray-300">مهام مقترحة:</h4>
                            {suggestedTasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-md">
                                    <p className="flex-grow text-gray-300">{task}</p>
                                    <button type="button" onClick={() => handleAddSuggestedTask(task)} className="text-cyan-400 hover:text-cyan-300 p-1 shrink-0"><PlusIcon className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>

                  {/* Update Log Column */}
                  <div className="space-y-4">
                     <h3 className="font-semibold text-gray-200 text-lg">سجل التحديثات</h3>
                     <div className="flex flex-col gap-2">
                        <textarea value={newUpdateText} onChange={(e) => setNewUpdateText(e.target.value)} placeholder="إضافة تحديث جديد..." rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"></textarea>
                        <button type="button" onClick={handleAddUpdate} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md self-end">إضافة تحديث</button>
                     </div>
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                       {(formData.updateLog || []).slice().reverse().map(log => (
                          <div key={log.id} className="bg-gray-700/50 p-2 rounded-md text-sm">
                            <p className="text-gray-300">{log.text}</p>
                            <p className="text-gray-500 text-xs mt-1">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
                          </div>
                       ))}
                     </div>
                  </div>
                </div>
            </div>
            
            <div role="tabpanel" hidden={activeTab !== 'attachments'}>
                <div className="space-y-6">
                    {/* Attachments Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2"><PaperClipIcon className="w-5 h-5" />المرفقات</h3>
                        <div className="space-y-3">
                             <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar bg-gray-900/50 p-3 rounded-lg">
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
                                 {(formData.attachments || []).length === 0 && (
                                     <p className="text-center text-gray-500 py-4">لا توجد مرفقات.</p>
                                 )}
                             </div>
                             <div>
                                <label htmlFor="attachment-upload" className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-block transition-colors">
                                    <span>إضافة مرفق</span>
                                </label>
                                <input type="file" id="attachment-upload" className="hidden" onChange={handleFileChange} />
                             </div>
                        </div>
                    </div>
                    {/* Contact & Links Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">روابط ومعلومات الاتصال</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-githubLink" className="block text-sm font-medium text-gray-300 mb-1">رابط GitHub (اختياري)</label>
                                <input type="url" id="edit-githubLink" name="githubLink" value={formData.githubLink || ''} onChange={handleChange} placeholder="https://github.com/user/repo" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="edit-whatsappNumber" className="block text-sm font-medium text-gray-300 mb-1">رقم واتساب (اختياري)</label>
                                <input type="tel" id="edit-whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} placeholder="e.g. 966501234567" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="edit-telegramUsername" className="block text-sm font-medium text-gray-300 mb-1">معرف تليجرام (اختياري)</label>
                                <input type="text" id="edit-telegramUsername" name="telegramUsername" value={formData.telegramUsername || ''} onChange={handleChange} placeholder="e.g. username" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
          </main>
          
           <footer className="flex justify-end gap-4 pt-6 mt-auto flex-shrink-0 border-t border-gray-700">
              <button type="button" onClick={handleCloseAttempt} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">إلغاء</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">حفظ التعديلات</button>
            </footer>
        </form>
      </div>
      
       <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #1f2937; /* Equivalent to gray-800 */
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4b5563; /* Equivalent to gray-600 */
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6b7280; /* Equivalent to gray-500 */
            }
        `}</style>
    </div>
  );
};

export default EditProjectModal;
