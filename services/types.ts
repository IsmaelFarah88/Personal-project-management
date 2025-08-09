export enum Technology {
  C = "C",
  Java = "Java",
  JavaFX = "JavaFX",
  Python = "Python",
  Android = "Android",
  WebApp = "تطبيق ويب",
}

export enum Status {
  NotStarted = "لم يبدأ",
  InProgress = "قيد التنفيذ",
  Completed = "مكتمل",
  Delivered = "تم التسليم",
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface UpdateLogEntry {
  id:string;
  text: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface Project {
  id: string;
  name: string;
  studentName: string;
  technology: Technology;
  startDate: string;
  deadline:string;
  status: Status;
  description: string;
  tasks: Task[];
  updateLog: UpdateLogEntry[];
  attachments: Attachment[];
  githubLink?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  // Kept for migration purposes from old data structures
  progressNotes?: string; 
}


export const statusDetails: Record<Status, { color: string; borderColor: string; emoji: string }> = {
  [Status.NotStarted]: { color: 'bg-gray-500', borderColor: 'border-gray-500', emoji: '⏸️' },
  [Status.InProgress]: { color: 'bg-blue-500', borderColor: 'border-blue-500', emoji: '⏳' },
  [Status.Completed]: { color: 'bg-green-500', borderColor: 'border-green-500', emoji: '✅' },
  [Status.Delivered]: { color: 'bg-purple-500', borderColor: 'border-purple-500', emoji: '🎉' },
};