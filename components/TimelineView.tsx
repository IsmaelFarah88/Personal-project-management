import React from 'react';
import { type Project, statusDetails } from '../services/types';

interface TimelineViewProps {
  projects: Project[];
  onOpenEditModal: (project: Project) => void;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const dayDiff = (date1: Date, date2: Date) => Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));

const TimelineView: React.FC<TimelineViewProps> = ({ projects, onOpenEditModal }) => {
    const validProjects = projects.filter(p => p.startDate && p.deadline);
    if (validProjects.length === 0) {
        return <div className="text-center py-16 text-gray-400">لا توجد مشاريع بتواريخ صالحة لعرضها في الخط الزمني.</div>;
    }

    const sortedProjects = [...validProjects].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const overallStartDate = new Date(sortedProjects[0].startDate);
    overallStartDate.setDate(1);

    const overallEndDate = new Date(Math.max(...sortedProjects.map(p => new Date(p.deadline).getTime())));
    overallEndDate.setDate(getDaysInMonth(overallEndDate.getFullYear(), overallEndDate.getMonth()));
    
    const totalDays = dayDiff(overallEndDate, overallStartDate);
    if (totalDays <= 0) {
         return <div className="text-center py-16 text-gray-400">بيانات التواريخ غير صالحة لعرض الخط الزمني.</div>;
    }

    const months = [];
    let currentDate = new Date(overallStartDate);
    while (currentDate <= overallEndDate) {
        months.push({
            name: currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
            days: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()),
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <div className="overflow-x-auto">
                <div className="relative" style={{ minWidth: `${totalDays * 4}px` }}>
                    {/* Month Headers */}
                    <div className="flex sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10 select-none">
                        {months.map((month, index) => (
                            <div key={index} className="text-center font-semibold text-cyan-300 py-2 border-b-2 border-r border-gray-700" style={{ width: `${(month.days / totalDays) * 100}%` }}>
                                {month.name}
                            </div>
                        ))}
                    </div>
                    {/* Project Rows */}
                    <div className="pt-4 space-y-3">
                        {sortedProjects.map(project => {
                            const projectStartDate = new Date(project.startDate);
                            const projectEndDate = new Date(project.deadline);
                            
                            const offsetDays = dayDiff(projectStartDate, overallStartDate);
                            const durationDays = dayDiff(projectEndDate, projectStartDate) + 1;

                            if (durationDays < 0 || offsetDays < 0) return null;

                            const offsetPercent = (offsetDays / totalDays) * 100;
                            const durationPercent = (durationDays / totalDays) * 100;
                            
                            const statusColor = statusDetails[project.status]?.color ?? 'bg-gray-500';
                            
                            return (
                                <div key={project.id} className="h-10 flex items-center group relative">
                                    <div 
                                        onClick={() => onOpenEditModal(project)}
                                        className={`absolute h-8 ${statusColor} rounded-md flex items-center px-2 cursor-pointer transition-all duration-300 hover:brightness-125 hover:shadow-lg`}
                                        style={{ left: `${offsetPercent}%`, width: `${durationPercent}%` }}
                                        title={`${project.name} - ${project.studentName}`}
                                    >
                                        <p className="text-white text-sm font-bold truncate">{project.name}</p>
                                    </div>
                                    <div className="absolute top-full mt-1 w-max p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                                         style={{ left: `${offsetPercent}%` }}>
                                        <p className="font-bold">{project.name}</p>
                                        <p>{project.studentName}</p>
                                        <p>الحالة: {project.status}</p>
                                        <p>من: {project.startDate} إلى: {project.deadline}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;