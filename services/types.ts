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

export interface Project {
  id: string;
  name: string;
  studentName: string;
  technology: Technology;
  deadline: string;
  status: Status;
  description: string;
  progressNotes: string;
  githubLink?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
}

export const statusDetails: Record<Status, { color: string; borderColor: string; emoji: string }> = {
  [Status.NotStarted]: { color: 'bg-gray-500', borderColor: 'border-gray-500', emoji: '⏸️' },
  [Status.InProgress]: { color: 'bg-blue-500', borderColor: 'border-blue-500', emoji: '⏳' },
  [Status.Completed]: { color: 'bg-green-500', borderColor: 'border-green-500', emoji: '✅' },
  [Status.Delivered]: { color: 'bg-purple-500', borderColor: 'border-purple-500', emoji: '🎉' },
};
