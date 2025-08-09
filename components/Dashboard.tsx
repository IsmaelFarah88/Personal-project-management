import React, { useMemo, useRef } from 'react';
import { type Project, Status } from '../services/types';
import { PlusIcon } from './icons/PlusIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import StatCard from './StatCard';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PauseCircleIcon } from './icons/PauseCircleIcon';
import { RectangleGroupIcon } from './icons/RectangleGroupIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CogIcon } from './icons/CogIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';


interface DashboardProps {
    projects: Project[];
    onBackup: () => void;
    onRestore: (file: File) => void;
    onAddProjectClick: () => void;
    onOpenTelegramSettings: () => void;
    viewMode: 'projects' | 'students' | 'timeline';
    onViewChange: (mode: 'projects' | 'students' | 'timeline') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onBackup, onRestore, onAddProjectClick, onOpenTelegramSettings, viewMode, onViewChange }) => {
    const stats = useMemo(() => {
        const total = projects.length;
        const inProgress = projects.filter(p => p.status === Status.InProgress).length;
        const completed = projects.filter(p => p.status === Status.Completed).length;
        const notStarted = projects.filter(p => p.status === Status.NotStarted).length;
        return { total, inProgress, completed, notStarted };
    }, [projects]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onRestore(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const viewTitles: Record<typeof viewMode, string> = {
        projects: 'كل المشاريع',
        students: 'المشاريع حسب الطالب',
        timeline: 'الخط الزمني للمشاريع'
    };

    return (
        <div className="mb-8 space-y-10">
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                     <h2 className="text-3xl font-bold text-gray-200">
                        نظرة عامة
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={onAddProjectClick}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>إضافة مشروع</span>
                        </button>
                         <button
                            onClick={onBackup}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>نسخ احتياطي</span>
                        </button>
                         <button
                            onClick={handleRestoreClick}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <UploadIcon className="w-5 h-5" />
                            <span>استعادة بيانات</span>
                        </button>
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".json,application/json"
                        />
                         <button
                            onClick={onOpenTelegramSettings}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <CogIcon className="w-5 h-5" />
                            <span>إعدادات تليجرام</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="إجمالي المشاريع" value={stats.total} icon={<ListBulletIcon />} colorClass="border-cyan-400" />
                    <StatCard title="قيد التنفيذ" value={stats.inProgress} icon={<ClockIcon />} colorClass="border-blue-500" />
                    <StatCard title="مكتملة" value={stats.completed} icon={<CheckCircleIcon />} colorClass="border-green-500" />
                    <StatCard title="لم تبدأ" value={stats.notStarted} icon={<PauseCircleIcon />} colorClass="border-gray-500" />
                </div>
            </div>

            {/* View Switcher Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h2 className="text-3xl font-bold text-gray-200">
                    {viewTitles[viewMode]}
                </h2>
                <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => onViewChange('projects')}
                        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                            viewMode === 'projects' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={viewMode === 'projects'}
                    >
                        <RectangleGroupIcon className="w-5 h-5" />
                        <span>عرض المشاريع</span>
                    </button>
                    <button
                        onClick={() => onViewChange('students')}
                        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                            viewMode === 'students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={viewMode === 'students'}
                    >
                        <UserGroupIcon className="w-5 h-5" />
                        <span>عرض الطلاب</span>
                    </button>
                    <button
                        onClick={() => onViewChange('timeline')}
                        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                            viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={viewMode === 'timeline'}
                    >
                        <ChartBarIcon className="w-5 h-5" />
                        <span>الخط الزمني</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;