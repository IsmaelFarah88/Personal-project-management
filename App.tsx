
import React, { useState, useCallback, useEffect } from 'react';
import { type Project, Status, Technology, statusDetails, Task, UpdateLogEntry } from './services/types';
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

const formatProjectForTelegram = (project: Project, title: string): string => {
    return [
        title,
        '',
        `*Project:* ${tgEscape(project.name)}`,
        `*Student:* ${tgEscape(project.studentName)}`,
        `*Technology:* ${tgEscape(project.technology)}`,
        `*Deadline:* ${tgEscape(new Date(project.deadline).toLocaleDateString('en-CA'))}`,
    ].join('\n');
};

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

  useEffect(() => {
    try {
        const projectsToStore = projects.map(p => {
            const { progressNotes, ...rest } = p;
            return rest;
        });
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(projectsToStore));
    } catch (error) {
        console.error("Error saving projects to localStorage", error);
    }
  }, [projects]);
  
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
    
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      )
    );

    const statusEmoji = statusDetails[newStatus]?.emoji || '';
    const message = `📊 *Status Update: ${tgEscape(project.name)}*\n\nThe status has been changed to:\n*New Status:* ${statusEmoji} ${tgEscape(newStatus)}`;
    sendTelegramMessage(message, 'onStatusUpdate');

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

    const title = '🌟 *New Project Created\\!* 🌟';
    const body = formatProjectForTelegram(newProject, title);
    const message = `${body}\n\nLet the journey begin\\! 🚀`;
    sendTelegramMessage(message, 'onAdd');
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    const originalProject = projects.find(p => p.id === updatedProject.id);
    if (!originalProject) return;

    const changes: string[] = [];
    const original = migrateProject(originalProject);
    const updated = updatedProject;

    const fieldMappings: { key: keyof Project, label: string, emoji: string }[] = [
        { key: 'name', label: 'Name', emoji: '📝' },
        { key: 'studentName', label: 'Student', emoji: '🧑‍💻' },
        { key: 'technology', label: 'Technology', emoji: '💻' },
        { key: 'startDate', label: 'Start Date', emoji: '🏁' },
        { key: 'deadline', label: 'Deadline', emoji: '📅' },
        { key: 'githubLink', label: 'GitHub Link', emoji: '🔗' },
        { key: 'whatsappNumber', label: 'WhatsApp', emoji: '💬' },
        { key: 'telegramUsername', label: 'Telegram', emoji: '✈️' },
    ];

    fieldMappings.forEach(({ key, label, emoji }) => {
        if (original[key] !== updated[key]) {
            changes.push(`${emoji} *${label}:*\n_${tgEscape(original[key] as string)}_ ➡️ *${tgEscape(updated[key] as string)}*`);
        }
    });
    
    if (original.description !== updated.description) {
      changes.push(`📄 *Description has been updated\\.*`);
    }

    if (original.status !== updated.status) {
      const oldStatusEmoji = statusDetails[original.status]?.emoji || '';
      const newStatusEmoji = statusDetails[updated.status]?.emoji || '';
      changes.push(`${newStatusEmoji} *Status:*\n_${tgEscape(original.status)} ${oldStatusEmoji}_ ➡️ *${tgEscape(updated.status)} ${newStatusEmoji}*`);
    }

    const originalAttachmentsCount = original.attachments?.length ?? 0;
    const updatedAttachmentsCount = updated.attachments?.length ?? 0;
    if (originalAttachmentsCount !== updatedAttachmentsCount) {
        changes.push(`📎 *Attachments:*\nChanged from ${originalAttachmentsCount} to ${updatedAttachmentsCount} file(s)`);
    }


    if (changes.length > 0) {
        const title = `🔄 *Project Updated: ${tgEscape(original.name)}* 🔄`;
        const message = `${title}\n\nHere are the changes:\n\n${changes.join('\n\n')}\n\nKeep up the great work\\! ✨`;
        sendTelegramMessage(message, 'onDetailsUpdate');
    }

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditModalOpen(false);
  }, [projects]);
  
  const handleAddTask = useCallback((projectId: string, taskText: string) => {
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === projectId) {
              const newTask: Task = { id: `task-${Date.now()}`, text: taskText, isCompleted: false };
              return { ...p, tasks: [...p.tasks, newTask] };
          }
          return p;
      }));
      
      const project = projects.find(p => p.id === projectId);
      if(project) {
        const message = `✅ *New Task Added to ${tgEscape(project.name)}*\n\n*Task:* ${tgEscape(taskText)}\n\nOne step closer to completion\\!`;
        sendTelegramMessage(message, 'onDetailsUpdate');
      }

  }, [projects]);

  const handleAddUpdateLog = useCallback((projectId: string, updateText: string) => {
      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === projectId) {
              const newLog: UpdateLogEntry = { id: `log-${Date.now()}`, text: updateText, timestamp: new Date().toISOString() };
              return { ...p, updateLog: [...p.updateLog, newLog] };
          }
          return p;
      }));
      
      const project = projects.find(p => p.id === projectId);
       if(project) {
        const message = `✍️ *New Update for ${tgEscape(project.name)}*\n\n*Update:*\n> ${tgEscape(updateText)}\n\nProgress is being made\\!`;
        sendTelegramMessage(message, 'onDetailsUpdate');
      }
  }, [projects]);

  const handleOpenEditModal = useCallback((project: Project) => {
    setCurrentProjectForEdit(project);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteProject = (projectId: string) => {
     const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) {
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        
        const message = `🗑️ *Project Deleted* 🗑️\n\nThe following project has been removed:\n\n*Project:* ${tgEscape(projectToDelete.name)}\n*Student:* ${tgEscape(projectToDelete.studentName)}\n\n_It will be missed\\._`;
        sendTelegramMessage(message, 'onDelete');
    }
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleBackup = useCallback(() => {
    if (projects.length === 0) {
      alert("لا توجد مشاريع لعمل نسخة احتياطية.");
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
    alert('تم بدء تحميل النسخة الاحتياطية بنجاح.');
  }, [projects]);

  const handleRestore = useCallback((file: File) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في استعادة البيانات؟ سيتم استبدال جميع المشاريع الحالية.')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const restoredProjects = JSON.parse(content);
          if (Array.isArray(restoredProjects) && (restoredProjects.length === 0 || restoredProjects.every(p => p.id && p.name && p.status))) {
            setProjects(restoredProjects.map(migrateProject));
            alert('تم استعادة البيانات بنجاح!');
          } else {
            throw new Error('الملف غير صالح أو لا يتبع التنسيق الصحيح.');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error restoring data:", error);
        alert(`فشل في استعادة البيانات. الرجاء التأكد من أن الملف صحيح. الخطأ: ${errorMessage}`);
      }
    };
    reader.onerror = () => {
      alert('حدث خطأ أثناء قراءة الملف.');
    };
    reader.readAsText(file);
  }, []);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }


  return (
    <div className="bg-gray-900 text-white min-h-screen">
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transform transition-all duration-300 z-40"
        aria-label="فتح مساعد البوت"
      >
        <BotIcon className="w-8 h-8" />
      </button>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProject={handleAddProject}
      />
      
      {currentProjectForEdit && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={currentProjectForEdit}
          onUpdateProject={handleUpdateProject}
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