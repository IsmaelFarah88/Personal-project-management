
import React, { useState, useCallback, useEffect } from 'react';
import { type Project, Status, Technology, statusDetails, Task, UpdateLogEntry, Attachment } from './services/types';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';
import NotificationModal from './components/NotificationModal';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentView from './components/StudentView';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import TelegramBotSimulatorModal from './components/TelegramBotSimulatorModal';
import { BotIcon } from './components/icons/BotIcon';
import { sendTelegramMessage, tgEscape } from './services/telegramService';
import TimelineView from './components/TimelineView';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';

const migrateProject = (p: any): Project => {
    if (p.progressNotes && !p.updateLog) {
        const migratedProject: Project = {
            ...p,
            tasks: p.tasks || [],
            updateLog: [{
                id: `log-${Date.now()}-${Math.random()}`,
                text: p.progressNotes,
                timestamp: new Date().toISOString()
            }]
        };
        delete migratedProject.progressNotes;
        return migratedProject;
    }
    // Ensure new fields exist for projects that might not have them
    if (!p.tasks) p.tasks = [];
    if (!p.updateLog) p.updateLog = [];
    if (!p.attachments) p.attachments = [];
    if (!p.startDate && p.deadline) {
        const deadline = new Date(p.deadline);
        const defaultStartDate = new Date(deadline.setMonth(deadline.getMonth() - 1));
        p.startDate = defaultStartDate.toISOString().split('T')[0];
    } else if (!p.startDate) {
        p.startDate = new Date().toISOString().split('T')[0];
    }
    return p;
};


const initialProjects: Project[] = [
    {
      id: '1',
      name: 'نظام إدارة مكتبة',
      studentName: 'أحمد علي',
      technology: Technology.Java,
      startDate: '2024-06-15',
      deadline: '2024-08-15',
      status: Status.InProgress,
      description: 'نظام متكامل لإدارة استعارة الكتب وإرجاعها في مكتبة جامعية باستخدام Java و Swing للواجهة الرسومية.',
      tasks: [
        { id: '1-1', text: 'تصميم واجهات المستخدم', isCompleted: true },
        { id: '1-2', text: 'ربط قاعدة البيانات', isCompleted: false },
        { id: '1-3', text: 'تطوير وظيفة البحث', isCompleted: false },
      ],
      updateLog: [
          { id: '1-u1', text: 'تم بناء واجهات المستخدم الأساسية.', timestamp: new Date('2024-07-20T10:00:00Z').toISOString() },
          { id: '1-u2', text: 'جار العمل على ربط قاعدة البيانات.', timestamp: new Date().toISOString() }
      ],
      attachments: [],
      githubLink: 'https://github.com/example/library-system',
      whatsappNumber: '966501234567'
    },
    {
      id: '2',
      name: 'تطبيق توصيل طعام',
      studentName: 'فاطمة الزهراء',
      technology: Technology.Android,
      startDate: '2024-07-15',
      deadline: '2024-09-01',
      status: Status.NotStarted,
      description: 'تطبيق أندرويد يسمح للمستخدمين بطلب الطعام من مطاعم مختلفة وتتبع حالة الطلب.',
      tasks: [],
      updateLog: [
          { id: '2-u1', text: 'تم وضع الخطة والميزات الأولية.', timestamp: new Date().toISOString() }
      ],
      attachments: [],
      githubLink: '',
      telegramUsername: 'fatima_zh'
    },
    {
      id: '3',
      name: 'أداة تحليل بيانات',
      studentName: 'خالد محمد',
      technology: Technology.Python,
      startDate: '2024-06-01',
      deadline: '2024-07-30',
      status: Status.Completed,
      description: 'برنامج بلغة بايثون يستخدم مكتبات Pandas و Matplotlib لتحليل مجموعة بيانات وعرض النتائج برسوم بيانية.',
      tasks: [
        { id: '3-1', text: 'تحميل البيانات', isCompleted: true },
        { id: '3-2', text: 'تنظيف البيانات', isCompleted: true },
        { id: '3-3', text: 'تحليل البيانات', isCompleted: true },
        { id: '3-4', text: 'عرض النتائج', isCompleted: true },
      ],
      updateLog: [
        { id: '3-u1', text: 'تم الانتهاء من جميع المتطلبات وتسليم النسخة النهائية.', timestamp: new Date().toISOString() }
      ],
      attachments: [],
      githubLink: 'https://github.com/example/data-analyzer',
      whatsappNumber: '966501234568',
    },
     {
      id: '4',
      name: 'موقع تجارة إلكترونية',
      studentName: 'أحمد علي',
      technology: Technology.WebApp,
      startDate: '2024-08-15',
      deadline: '2024-10-01',
      status: Status.NotStarted,
      description: 'موقع ويب لبيع المنتجات الإلكترونية مع سلة شراء ودفع إلكتروني.',
      tasks: [],
      updateLog: [
          { id: '4-u1', text: 'تحليل المتطلبات وتصميم الواجهات.', timestamp: new Date().toISOString() }
      ],
      attachments: [],
      githubLink: 'https://github.com/example/ecommerce-web',
      whatsappNumber: '966501234567'
    },
];

const APP_STORAGE_KEY = 'projects-data-ismael-farah';

type ViewMode = 'projects' | 'students' | 'timeline';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' };
type ConfirmationState = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
        const storedProjects = localStorage.getItem(APP_STORAGE_KEY);
        const projectsToLoad = storedProjects ? JSON.parse(storedProjects) : initialProjects;
        return projectsToLoad.map(migrateProject);
    } catch (error) {
        console.error("Error reading projects from localStorage", error);
        return initialProjects.map(migrateProject);
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, title, message, onConfirm });
  }, []);
  
  const closeConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    try {
        const projectsToStore = projects.map(p => {
            const { progressNotes, ...rest } = p;
            return rest;
        });
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(projectsToStore));
    } catch (error) {
        console.error("Error saving projects to localStorage", error);
        showToast('فشل حفظ المشاريع في المتصفح.', 'error');
    }
  }, [projects, showToast]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isBotSimulatorOpen, setIsBotSimulatorOpen] = useState(false);
  const [currentProjectForEdit, setCurrentProjectForEdit] = useState<Project | null>(null);
  const [notificationModalProject, setNotificationModalProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('projects');


  const handleUpdateProjectStatus = useCallback((projectId: string, newStatus: Status) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.status === newStatus) return;
    
    const originalStatus = project.status;
    const updatedProject = { ...project, status: newStatus };

    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? updatedProject : p
      )
    );

    sendTelegramMessage('onStatusUpdate', updatedProject, { originalStatus });

  }, [projects]);
  
  const handleOpenNotificationModal = useCallback((project: Project) => {
    setNotificationModalProject(project);
  }, []);

  const handleCloseNotificationModal = useCallback(() => {
    setNotificationModalProject(null);
  }, []);

  const handleAddProject = useCallback((newProjectData: Omit<Project, 'id' | 'tasks' | 'updateLog' | 'attachments'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: Date.now().toString(),
      tasks: [],
      updateLog: [{
        id: `log-${Date.now()}`,
        text: 'تم إنشاء المشروع.',
        timestamp: new Date().toISOString()
      }],
      attachments: []
    };
    setProjects(prev => [newProject, ...prev]);
    setIsAddModalOpen(false);
    showToast(`تمت إضافة مشروع "${newProject.name}" بنجاح.`);

    sendTelegramMessage('onAdd', newProject);
  }, [showToast]);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    const originalProject = projects.find(p => p.id === updatedProject.id);
    if (!originalProject) return;

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditModalOpen(false);
    showToast(`تم تحديث مشروع "${updatedProject.name}" بنجاح.`);
    
    const changes: { details: string[]; tasks: string[]; attachments: string[]; logs: string[] } = {
        details: [],
        tasks: [],
        attachments: [],
        logs: []
    };
    
    const original = migrateProject(originalProject);
    const updated = updatedProject;

    const fieldMappings: { key: keyof Project, label: string }[] = [
        { key: 'name', label: 'الاسم' },
        { key: 'studentName', label: 'الطالب' },
        { key: 'technology', label: 'التقنية' },
        { key: 'startDate', label: 'تاريخ البدء' },
        { key: 'deadline', label: 'الموعد النهائي' },
        { key: 'githubLink', label: 'GitHub' },
        { key: 'whatsappNumber', label: 'WhatsApp' },
        { key: 'telegramUsername', label: 'Telegram' },
    ];
    
    fieldMappings.forEach(({ key, label }) => {
        const originalValue = (original[key] || '').toString();
        const updatedValue = (updated[key] || '').toString();
        if (originalValue !== updatedValue) {
            changes.details.push(`*${label}:* _${tgEscape(originalValue) || 'فارغ'}_ ⬅️ *${tgEscape(updatedValue) || 'فارغ'}*`);
        }
    });

    if (original.description !== updated.description) {
        changes.details.push(`*الوصف:* تم تحديثه.`);
    }

    if (original.status !== updated.status) {
       sendTelegramMessage('onStatusUpdate', updated, { originalStatus: original.status });
    }
    
    const originalTasks = original.tasks || [];
    const updatedTasks = updated.tasks || [];
    const addedTasks = updatedTasks.filter(ut => !originalTasks.some(ot => ot.id === ut.id));
    const deletedTasks = originalTasks.filter(ot => !updatedTasks.some(ut => ut.id === ot.id));
    const toggledTasks = updatedTasks.filter(ut => {
        const ot = originalTasks.find(ot => ot.id === ut.id);
        return ot && ot.isCompleted !== ut.isCompleted;
    });
    const modifiedTasks = updatedTasks.filter(ut => {
        const ot = originalTasks.find(ot => ot.id === ut.id);
        return ot && ot.text !== ut.text;
    });

    addedTasks.forEach(t => changes.tasks.push(`➕ *إضافة مهمة:* ${tgEscape(t.text)}`));
    deletedTasks.forEach(t => changes.tasks.push(`➖ *حذف مهمة:* ${tgEscape(t.text)}`));
    toggledTasks.forEach(t => changes.tasks.push(t.isCompleted ? `✅ *إكمال مهمة:* ${tgEscape(t.text)}` : `🔄 *إعادة فتح مهمة:* ${tgEscape(t.text)}`));
    modifiedTasks.forEach(t => changes.tasks.push(`✏️ *تعديل مهمة:* ${tgEscape(t.text)}`));


    const originalAttachments = original.attachments || [];
    const updatedAttachments = updated.attachments || [];
    const addedAttachments = updatedAttachments.filter(ua => !originalAttachments.some(oa => oa.id === ua.id));
    const deletedAttachments = originalAttachments.filter(oa => !updatedAttachments.some(ua => ua.id === oa.id));

    addedAttachments.forEach(a => changes.attachments.push(`📎 *إضافة مرفق:* ${tgEscape(a.name)}`));
    deletedAttachments.forEach(a => changes.attachments.push(`🗑️ *حذف مرفق:* ${tgEscape(a.name)}`));

    const originalLogs = original.updateLog || [];
    const updatedLogs = updated.updateLog || [];
    const addedLogs = updatedLogs.filter(ul => !originalLogs.some(ol => ol.id === ul.id));

    addedLogs.forEach(l => changes.logs.push(`✍️ *تحديث جديد:* ${tgEscape(l.text)}`));


    if (changes.details.length > 0 || changes.tasks.length > 0 || changes.attachments.length > 0 || changes.logs.length > 0) {
        sendTelegramMessage('onDetailsUpdate', updated, { changes });
    }
    
  }, [projects, showToast]);
  
  const handleAddTask = useCallback((projectId: string, taskText: string) => {
      let project: Project | undefined;
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === projectId) {
              const newTask: Task = { id: `task-${Date.now()}`, text: taskText, isCompleted: false };
              project = { ...p, tasks: [...p.tasks, newTask] };
              return project;
          }
          return p;
      }));
      
      if(project) {
        showToast('تمت إضافة المهمة بنجاح.');
        sendTelegramMessage('onDetailsUpdate', project, { changes: { tasks: [`➕ *إضافة مهمة:* ${tgEscape(taskText)}`] } });
      }

  }, [projects, showToast]);

  const handleAddUpdateLog = useCallback((projectId: string, updateText: string) => {
      let project: Project | undefined;
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === projectId) {
              const newLog: UpdateLogEntry = { id: `log-${Date.now()}`, text: updateText, timestamp: new Date().toISOString() };
              project = { ...p, updateLog: [...p.updateLog, newLog] };
              return project;
          }
          return p;
      }));
      
       if(project) {
        showToast('تمت إضافة التحديث بنجاح.');
        sendTelegramMessage('onDetailsUpdate', project, { changes: { logs: [`✍️ *تحديث جديد:* ${tgEscape(updateText)}`] } });
      }
  }, [projects, showToast]);

  const handleOpenEditModal = useCallback((project: Project) => {
    setCurrentProjectForEdit(project);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteProject = (projectId: string) => {
     const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    showConfirmation(
        'تأكيد الحذف',
        `هل أنت متأكد من رغبتك في حذف مشروع "${projectToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        () => {
            setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
            showToast(`تم حذف مشروع "${projectToDelete.name}".`);
            sendTelegramMessage('onDelete', projectToDelete);
            closeConfirmation();
        }
    );
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleBackup = useCallback(() => {
    if (projects.length === 0) {
      showToast("لا توجد مشاريع لعمل نسخة احتياطية.", 'error');
      return;
    }
    const dataStr = JSON.stringify(projects.map(p => {
        const { progressNotes, ...rest } = p;
        return rest;
    }), null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم بدء تحميل النسخة الاحتياطية بنجاح.');
  }, [projects, showToast]);

  const handleRestore = useCallback((file: File) => {
    showConfirmation(
      'تأكيد الاستعادة',
      'هل أنت متأكد من رغبتك في استعادة البيانات؟ سيتم استبدال جميع المشاريع الحالية بالبيانات من الملف الذي اخترته.',
      () => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result;
            if (typeof content === 'string') {
              const restoredProjects = JSON.parse(content);
              if (Array.isArray(restoredProjects) && (restoredProjects.length === 0 || restoredProjects.every(p => p.id && p.name && p.status))) {
                setProjects(restoredProjects.map(migrateProject));
                showToast('تم استعادة البيانات بنجاح!');
              } else {
                throw new Error('الملف غير صالح أو لا يتبع التنسيق الصحيح.');
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error restoring data:", error);
            showToast(`فشل في استعادة البيانات. الخطأ: ${errorMessage}`, 'error');
          }
        };
        reader.onerror = () => {
          showToast('حدث خطأ أثناء قراءة الملف.', 'error');
        };
        reader.readAsText(file);
        closeConfirmation();
      }
    );
  }, [showToast]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }


  return (
    <div className="bg-gray-900 text-white min-h-screen">
       <div id="toast-container" className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
      />

      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <Dashboard
          projects={projects}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onAddProjectClick={() => setIsAddModalOpen(true)}
          onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
        
        {viewMode === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdateStatus={handleUpdateProjectStatus}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenNotificationModal={handleOpenNotificationModal}
                  onDeleteProject={handleDeleteProject}
                  onUpdateProject={handleUpdateProject}
                  onAddTask={handleAddTask}
                  onAddUpdate={handleAddUpdateLog}
                />
              ))}
            </div>
        )}

        {viewMode === 'students' && (
            <StudentView
                projects={projects}
                onUpdateStatus={handleUpdateProjectStatus}
                onOpenEditModal={handleOpenEditModal}
                onOpenNotificationModal={handleOpenNotificationModal}
                onDeleteProject={handleDeleteProject}
                onUpdateProject={handleUpdateProject}
                onAddTask={handleAddTask}
                onAddUpdate={handleAddUpdateLog}
            />
        )}

        {viewMode === 'timeline' && (
            <TimelineView projects={projects} onOpenEditModal={handleOpenEditModal} />
        )}

      </main>

      <button
        onClick={() => setIsBotSimulatorOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:scale-110 transform transition-all duration-300 z-40"
        aria-label="فتح مساعد البوت"
      >
        <BotIcon className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProject={handleAddProject}
        showToast={showToast}
      />
      
      {currentProjectForEdit && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={currentProjectForEdit}
          onUpdateProject={handleUpdateProject}
          showToast={showToast}
          showConfirmation={showConfirmation}
        />
      )}
      
      <NotificationModal
          isOpen={!!notificationModalProject}
          onClose={handleCloseNotificationModal}
          project={notificationModalProject}
        />
      
      <TelegramSettingsModal 
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        showToast={showToast}
      />

      <TelegramBotSimulatorModal
        isOpen={isBotSimulatorOpen}
        onClose={() => setIsBotSimulatorOpen(false)}
        projects={projects}
        onUpdateProject={handleUpdateProject}
        onBackup={handleBackup}
      />
    </div>
  );
};

export default App;
