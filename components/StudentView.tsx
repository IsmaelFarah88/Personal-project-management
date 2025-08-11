

import React, { useMemo } from 'react';
import { type Project, Status } from '../services/types';
import ProjectCard from './ProjectCard';

interface StudentViewProps {
  projects: Project[];
  onUpdateStatus: (projectId: string, newStatus: Status) => void;
  onOpenEditModal: (project: Project) => void;
  onOpenNotificationModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onAddTask: (projectId: string, taskText: string) => void;
  onAddUpdate: (projectId: string, updateText: string) => void;
}

interface ProjectsByStudent {
    [studentName: string]: Project[];
}

const StudentView: React.FC<StudentViewProps> = (props) => {
    const projectsByStudent = useMemo(() => {
        return props.projects.reduce((acc, project) => {
            const studentName = project.studentName.trim();
            if (!acc[studentName]) {
                acc[studentName] = [];
            }
            acc[studentName].push(project);
            return acc;
        }, {} as ProjectsByStudent);
    }, [props.projects]);
    
    const sortedStudents = Object.keys(projectsByStudent).sort((a, b) => a.localeCompare(b));

    if (sortedStudents.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-400 text-lg">لا توجد مشاريع لعرضها حاليًا.</p>
                <p className="text-gray-500">قم بإضافة مشروع جديد للبدء.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {sortedStudents.map(studentName => (
                <div key={studentName} className="bg-gray-800/50 rounded-lg p-4 sm:p-6 transition-all duration-300 hover:bg-gray-800">
                    <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-cyan-300">{studentName}</h3>
                        <span className="bg-gray-700 text-white font-semibold py-1 px-3 rounded-full text-sm">
                            {projectsByStudent[studentName].length} {projectsByStudent[studentName].length > 2 ? 'مشاريع' : (projectsByStudent[studentName].length > 1 ? 'مشروعان' : 'مشروع')}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {projectsByStudent[studentName]
                            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                            .map(project => (
                                <ProjectCard
                                  key={project.id}
                                  project={project}
                                  onUpdateStatus={props.onUpdateStatus}
                                  onOpenEditModal={props.onOpenEditModal}
                                  onOpenNotificationModal={props.onOpenNotificationModal}
                                  onDeleteProject={props.onDeleteProject}
                                  onUpdateProject={props.onUpdateProject}
                                  onAddTask={props.onAddTask}
                                  onAddUpdate={props.onAddUpdate}
                                />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentView;
