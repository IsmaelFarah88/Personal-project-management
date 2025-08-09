import React, { useState, useEffect, useCallback } from 'react';
import { type Project, Status } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { TelegramIcon } from './icons/TelegramIcon';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const getNotificationMessage = (project: Project, language: 'ar' | 'fa'): string => {
  const studentName = project.studentName;
  const projectName = `"${project.name}"`;
  const myName = "إسماعيل فرح";
  
  const messages = {
    ar: {
      greeting: `مرحباً ${studentName}،`,
      system_intro: `تم إرسال هذا الإشعار عبر نظام مراقبة المشاريع الخاص بـ "إسماعيل فرح".`,
      status_message: {
        [Status.NotStarted]: `نود إعلامك بأنه قد تم تسجيل مشروعك ${projectName} بنجاح في نظامنا. سيتم البدء في العمل عليه قريبًا، وسنوافيك بالتحديثات فورًا.`,
        [Status.InProgress]: `نحيطك علمًا بأن العمل جارٍ حاليًا على مشروعك ${projectName}. نعمل بجد لإنجازه بأفضل جودة، وسيتم إعلامك فور اكتماله.`,
        [Status.Completed]: `خبر سار! تم الانتهاء من تطوير مشروعك ${projectName}. حاليًا، يمر المشروع بمرحلة المراجعة والاختبار لضمان جودته. سيتم تجهيزه للتسليم النهائي قريبًا.`,
        [Status.Delivered]: `تم تسليم مشروعك ${projectName} بشكل نهائي. نأمل أن يكون قد نال رضاك. شكرًا لثقتك ونتمنى لك كل التوفيق.`,
      },
      closing: `بالتوفيق،\n${myName}`
    },
    fa: {
      greeting: `سلام ${studentName}،`,
      system_intro: `این اعلان از طریق سیستم نظارت بر پروژه "اسماعیل فرح" برای شما ارسال شده است.`,
      status_message: {
        [Status.NotStarted]: `مایلیم به اطلاع شما برسانیم که پروژه شما ${projectName} با موفقیت در سیستم ما ثبت شده است. کار بر روی آن به زودی آغاز خواهد شد و ما شما را از به‌روزرسانی‌ها مطلع خواهیم کرد.`,
        [Status.InProgress]: `به اطلاع می‌رسانیم که کار بر روی پروژه شما ${projectName} در حال انجام است. ما برای تکمیل آن با بهترین کیفیت تلاش می‌کنیم و پس از اتمام به شما اطلاع داده خواهد شد.`,
        [Status.Completed]: `خبر خوب! توسعه پروژه شما ${projectName} به پایان رسیده است. در حال حاضر، پروژه برای اطمینان از کیفیت، در مرحله بررسی و آزمایش قرار دارد. به زودی برای تحویل نهایی آماده خواهد شد.`,
        [Status.Delivered]: `پروژه شما ${projectName} به طور نهایی تحویل داده شد. امیدواریم مورد رضایت شما قرار گرفته باشد. از اعتماد شما سپاسگزاریم و برای شما آرزوی موفقیت داریم.`,
      },
      closing: `با آرزوی موفقیت،\n${myName}`
    }
  };

  const langMessages = messages[language];
  const statusMessage = langMessages.status_message[project.status] || `إشعار بخصوص مشروع ${projectName}.`;

  return `${langMessages.greeting}\n\n${langMessages.system_intro}\n\n${statusMessage}\n\n${langMessages.closing}`;
};


const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, project }) => {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<'ar' | 'fa'>('ar');

  useEffect(() => {
    if (project) {
        setMessage(getNotificationMessage(project, language));
    }
  }, [project, language]);

  // Reset language to Arabic when modal opens for a new project
  useEffect(() => {
    if(isOpen) {
        setLanguage('ar');
    }
  }, [isOpen]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message);
    alert('تم نسخ الرسالة!');
  }, [message]);
  
  if (!isOpen || !project) return null;
  
  const whatsappLink = project.whatsappNumber ? `https://wa.me/${project.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '';
  const telegramLink = project.telegramUsername ? `https://t.me/${project.telegramUsername}` : '';


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-300">إرسال إشعار للطالب</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 mb-4">
            إشعار بخصوص مشروع "{project.name}" (الحالة: {project.status}). اختر اللغة، ثم قم بمراجعة الرسالة وأرسلها للطالب.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">لغة الرسالة</label>
            <div className="flex gap-x-6">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                        type="radio"
                        name="language"
                        value="ar"
                        checked={language === 'ar'}
                        onChange={() => setLanguage('ar')}
                        className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-2 ring-offset-gray-800"
                    />
                    العربية
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                        type="radio"
                        name="language"
                        value="fa"
                        checked={language === 'fa'}
                        onChange={() => setLanguage('fa')}
                        className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-2 ring-offset-gray-800"
                    />
                    فارسی
                </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="notification-message" className="block text-sm font-medium text-gray-300 mb-1">نص الرسالة</label>
              <textarea
                id="notification-message"
                readOnly
                value={message}
                rows={10}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                نسخ الرسالة
              </button>
              {project.whatsappNumber && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>إرسال عبر واتساب</span>
                </a>
              )}
              {project.telegramUsername && (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  <TelegramIcon className="w-5 h-5" />
                  <span>نسخ وفتح تليجرام</span>
                </a>
              )}
            </div>
          </div>
           <div className="mt-6 flex justify-end">
             <button type="button" onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
                إغلاق
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;