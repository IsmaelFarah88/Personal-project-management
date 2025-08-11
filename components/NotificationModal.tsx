
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
  const projectName = project.name;
  const myName = "إسماعيل فرح";
  const deadline = new Date(project.deadline).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });

  const messages = {
    ar: {
      greeting: `👋 مرحباً ${studentName}،`,
      status_subject: {
        [Status.NotStarted]: `✅ تم تسجيل مشروعك بنجاح!`,
        [Status.InProgress]: `🚀 تحديث بخصوص مشروعك "${projectName}"`,
        [Status.Completed]: `🎉 أخبار رائعة! مشروعك "${projectName}" اكتمل تقريباً`,
        [Status.Delivered]: `📦 تم تسليم مشروعك "${projectName}" بنجاح!`
      },
      details_header: "تفاصيل المشروع:",
      project_name: `📌 المشروع: ${projectName}`,
      technology: `🔧 التقنية: ${project.technology}`,
      deadline: `🗓️ الموعد النهائي: ${deadline}`,
      github: `🔗 رابط GitHub:`,
      latest_update_header: `💡 آخر تحديث مسجل:`,
      status_message: {
        [Status.NotStarted]: `تم إعداد كل شيء لمشروعك. سنقوم بإعلامك فور بدء العمل عليه. استعد للانطلاق!`,
        [Status.InProgress]: `العمل يجري على قدم وساق! نحن نحقق تقدمًا جيدًا. يمكنك متابعة آخر التحديثات مباشرةً عبر مستودع GitHub.`,
        [Status.Completed]: `لقد انتهينا من مرحلة البرمجة الأساسية! المشروع الآن قيد المراجعة النهائية والاختبار لضمان خلوه من الأخطاء وتقديمه بأفضل جودة.`,
        [Status.Delivered]: `نأمل أن يكون كل شيء كما توقعت. لا تتردد في مراجعته وإعلامنا بأي ملاحظات. نتمنى لك كل التوفيق في استخدامه وعرضه.`,
      },
      closing: `بالتوفيق،\n${myName}`,
      system_intro: `\n\n---\n📬 هذا إشعار آلي من نظام إدارة المشاريع.`
    },
    fa: {
      greeting: `👋 سلام ${studentName}،`,
      status_subject: {
        [Status.NotStarted]: `✅ پروژه شما با موفقیت ثبت شد!`,
        [Status.InProgress]: `🚀 به‌روزرسانی در مورد پروژه شما "${projectName}"`,
        [Status.Completed]: `🎉 خبر عالی! پروژه شما "${projectName}" تقریباً کامل شده است`,
        [Status.Delivered]: `📦 پروژه شما "${projectName}" با موفقیت تحویل داده شد!`
      },
      details_header: "جزئیات پروژه:",
      project_name: `📌 پروژه: ${projectName}`,
      technology: `🔧 تکنولوژی: ${project.technology}`,
      deadline: `🗓️ مهلت نهایی: ${deadline}`,
      github: `🔗 لینک گیت‌هاب:`,
      latest_update_header: `💡 آخرین به‌روزرسانی ثبت‌شده:`,
      status_message: {
        [Status.NotStarted]: `همه چیز برای پروژه شما آماده شده است. به محض شروع کار به شما اطلاع خواهیم داد. آماده شروع باشید!`,
        [Status.InProgress]: `کار با سرعت در حال انجام است! ما پیشرفت خوبی داریم. شما می‌توانید آخرین به‌روزرسانی‌ها را مستقیماً از طریق مخزن گیت‌هاب دنبال کنید.`,
        [Status.Completed]: `ما مرحله اصلی برنامه‌نویسی را به پایان رسانده‌ایم! پروژه اکنون در حال بررسی نهایی و آزمایش است تا از بدون خطا بودن آن و ارائه با بهترین کیفیت اطمینان حاصل شود.`,
        [Status.Delivered]: `امیدواریم همه چیز همانطور که انتظار داشتید باشد. لطفاً آن را بررسی کرده و هرگونه بازخورد را به ما اطلاع دهید. برای شما در استفاده و ارائه آن آرزوی موفقیت داریم.`,
      },
      closing: `با آرزوی موفقیت،\n${myName}`,
      system_intro: `\n\n---\n📬 این یک اعلان خودکار از سیستم مدیریت پروژه است.`
    }
  };

  const langMessages = messages[language];
  const subject = langMessages.status_subject[project.status] || `تحديث بخصوص مشروعك`;
  const statusMessage = langMessages.status_message[project.status] || '';
  
  const projectDetails = [
      langMessages.details_header,
      langMessages.project_name,
      langMessages.technology,
      langMessages.deadline,
      project.githubLink ? `${langMessages.github} ${project.githubLink}` : null
  ].filter(Boolean).join('\n');

  const latestUpdate = project.updateLog?.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const latestUpdateMessage = latestUpdate ? `${langMessages.latest_update_header} "${latestUpdate.text}"` : null;

  return [
    langMessages.greeting,
    subject,
    '', // empty line
    projectDetails,
    '', // empty line
    statusMessage,
    latestUpdateMessage,
    '', // empty line
    langMessages.closing,
    langMessages.system_intro
  ].filter(Boolean).join('\n');
};


const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, project }) => {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<'ar' | 'fa'>('ar');

  const updateMessageTemplate = useCallback(() => {
    if (project) {
        setMessage(getNotificationMessage(project, language));
    }
  }, [project, language]);

  useEffect(() => {
    updateMessageTemplate();
  }, [updateMessageTemplate]);

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
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-300">إرسال إشعار للطالب</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 mb-4">
            إشعار بخصوص مشروع "{project.name}" (الحالة: {project.status}). يمكنك تعديل الرسالة أدناه قبل إرسالها.
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
              <label htmlFor="notification-message" className="block text-sm font-medium text-gray-300 mb-1">نص الرسالة (قابل للتعديل)</label>
              <textarea
                id="notification-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={15}
                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={updateMessageTemplate}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
              >
                استعادة النص الأصلي
              </button>
              <button
                onClick={handleCopy}
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
              >
                نسخ الرسالة
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
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
