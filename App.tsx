
import React, { useState, useCallback, useEffect } from 'react';
import { type Project, Status, Technology, statusDetails } from './services/types';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';
import NotificationModal from './components/NotificationModal';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentView from './components/StudentView';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import { sendTelegramMessage, tgEscape } from './services/telegramService';

const initialProjects: Project[] = [
    {
      id: '1',
      name: 'نظام إدارة مكتبة',
      studentName: 'أحمد علي',
      technology: Technology.Java,
      deadline: '2024-08-15',
      status: Status.InProgress,
      description: 'نظام متكامل لإدارة استعارة الكتب وإرجاعها في مكتبة جامعية باستخدام Java و Swing للواجهة الرسومية.',
      progressNotes: 'تم بناء واجهات المستخدم الأساسية وجار العمل على ربط قاعدة البيانات.',
      githubLink: 'https://github.com/example/library-system',
      whatsappNumber: '966501234567'
    },
    {
      id: '2',
      name: 'تطبيق توصيل طعام',
      studentName: 'فاطمة الزهراء',
      technology: Technology.Android,
      deadline: '2024-09-01',
      status: Status.NotStarted,
      description: 'تطبيق أندرويد يسمح للمستخدمين بطلب الطعام من مطاعم مختلفة وتتبع حالة الطلب.',
      progressNotes: 'لم يتم البدء بعد، تم وضع الخطة والميزات الأولية فقط.',
      githubLink: '',
      telegramUsername: 'fatima_zh'
    },
    {
      id: '3',
      name: 'أداة تحليل بيانات',
      studentName: 'خالد محمد',
      technology: Technology.Python,
      deadline: '2024-07-30',
      status: Status.Completed,
      description: 'برنامج بلغة بايثون يستخدم مكتبات Pandas و Matplotlib لتحليل مجموعة بيانات وعرض النتائج برسوم بيانية.',
      progressNotes: 'تم الانتهاء من جميع المتطلبات وتسليم النسخة النهائية من البرنامج.',
      githubLink: 'https://github.com/example/data-analyzer',
      whatsappNumber: '966501234568',
    },
     {
      id: '4',
      name: 'موقع تجارة إلكترونية',
      studentName: 'أحمد علي',
      technology: Technology.WebApp,
      deadline: '2024-10-01',
      status: Status.NotStarted,
      description: 'موقع ويب لبيع المنتجات الإلكترونية مع سلة شراء ودفع إلكتروني.',
      progressNotes: 'تحليل المتطلبات وتصميم الواجهات.',
      githubLink: 'https://github.com/example/ecommerce-web',
      whatsappNumber: '966501234567'
    },
];

const APP_STORAGE_KEY = 'projects-data-ismael-farah';

type ViewMode = 'projects' | 'students';

const formatProjectForTelegram = (project: Project): string => {
    return [
        `*Project:* ${tgEscape(project.name)}`,
        `*Student:* ${tgEscape(project.studentName)}`,
        `*Technology:* ${tgEscape(project.technology)}`,
        `*Deadline:* ${tgEscape(project.deadline)}`,
    ].join('\n');
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
        const storedProjects = localStorage.getItem(APP_STORAGE_KEY);
        return storedProjects ? JSON.parse(storedProjects) : initialProjects;
    } catch (error) {
        console.error("Error reading projects from localStorage", error);
        return initialProjects;
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error("Error saving projects to localStorage", error);
    }
  }, [projects]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
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
    const message = `🔄 *Project Status Updated*\n\n*Project:* ${tgEscape(project.name)}\n*Student:* ${tgEscape(project.studentName)}\n*New Status:* ${tgEscape(newStatus)} ${statusEmoji}`;
    sendTelegramMessage(message, 'onStatusUpdate');

  }, [projects]);
  
  const handleOpenNotificationModal = useCallback((project: Project) => {
    setNotificationModalProject(project);
  }, []);

  const handleCloseNotificationModal = useCallback(() => {
    setNotificationModalProject(null);
  }, []);

  const handleAddProject = useCallback((newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: Date.now().toString(),
    };
    setProjects(prev => [newProject, ...prev]);
    setIsAddModalOpen(false);

    const message = `✅ *New Project Added*\n\n${formatProjectForTelegram(newProject)}`;
    sendTelegramMessage(message, 'onAdd');
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    const originalProject = projects.find(p => p.id === updatedProject.id);
    if (!originalProject) return;

    const changes: string[] = [];

    if (originalProject.name !== updatedProject.name) changes.push(`*Name:* ${tgEscape(originalProject.name)} ➡️ ${tgEscape(updatedProject.name)}`);
    if (originalProject.studentName !== updatedProject.studentName) changes.push(`*Student:* ${tgEscape(originalProject.studentName)} ➡️ ${tgEscape(updatedProject.studentName)}`);
    if (originalProject.technology !== updatedProject.technology) changes.push(`*Technology:* ${tgEscape(originalProject.technology)} ➡️ ${tgEscape(updatedProject.technology)}`);
    if (originalProject.deadline !== updatedProject.deadline) changes.push(`*Deadline:* ${tgEscape(originalProject.deadline)} ➡️ ${tgEscape(updatedProject.deadline)}`);
    if (originalProject.description !== updatedProject.description) changes.push(`*Description has been updated\\.*`);
    if (originalProject.progressNotes !== updatedProject.progressNotes) changes.push(`*Progress Notes have been updated\\.*`);
    if (originalProject.githubLink !== updatedProject.githubLink) changes.push(`*GitHub Link has been updated\\.*`);
    if (originalProject.whatsappNumber !== updatedProject.whatsappNumber) changes.push(`*WhatsApp Number has been updated\\.*`);
    if (originalProject.telegramUsername !== updatedProject.telegramUsername) changes.push(`*Telegram Username has been updated\\.*`);
    
    if (originalProject.status !== updatedProject.status) {
      const oldStatusEmoji = statusDetails[originalProject.status]?.emoji || '';
      const newStatusEmoji = statusDetails[updatedProject.status]?.emoji || '';
      changes.push(`*Status:* ${tgEscape(originalProject.status)} ${oldStatusEmoji} ➡️ ${tgEscape(updatedProject.status)} ${newStatusEmoji}`);
    }

    if (changes.length > 0) {
        const title = `📝 *Project Details Updated: ${tgEscape(originalProject.name)}*`;
        const message = `${title}\n\n${changes.map(c => `• ${c}`).join('\n')}`;
        sendTelegramMessage(message, 'onDetailsUpdate');
    }

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditModalOpen(false);
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
        const message = `🗑️ *Project Deleted*\n\n*Project:* ${tgEscape(projectToDelete.name)}\n*Student:* ${tgEscape(projectToDelete.studentName)}`;
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
    const dataStr = JSON.stringify(projects, null, 2);
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
            setProjects(restoredProjects);
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
            />
        )}
      </main>

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
    </div>
  );
};

export default App;