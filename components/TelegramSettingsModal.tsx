
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { getTelegramConfig, saveTelegramConfig, type TelegramConfig, type NotificationEvent, tgEscape } from '../services/telegramService';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface TestResult {
    success: boolean;
    message: string;
}

const defaultNotificationSettings: Record<NotificationEvent, boolean> = {
    onAdd: true,
    onStatusUpdate: true,
    onDetailsUpdate: true,
    onDelete: true,
};

const testTelegramConnection = async (token: string, chatId: string): Promise<TestResult> => {
    if (!token || !chatId) {
        return { success: false, message: 'الرجاء إدخال التوكن ومعرف الدردشة.' };
    }
    const escapedMessage = tgEscape('👋 هذه رسالة اختبار من مدير المشاريع.\n*الاتصال ناجح!*');
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: escapedMessage, parse_mode: 'MarkdownV2' }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, message: `خطأ من واجهة تليجرام: ${data.description || 'خطأ غير معروف'}` };
        }
        return { success: true, message: 'تم إرسال رسالة الاختبار بنجاح!' };
    } catch (error) {
        console.error("Telegram test connection error:", error);
        return { success: false, message: `خطأ في الشبكة: لا يمكن الوصول إلى واجهة تليجرام.` };
    }
}

const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({ isOpen, onClose, showToast }) => {
    const [token, setToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const config = getTelegramConfig();
            if (config) {
                setToken(config.token);
                setChatId(config.chatId);
                setNotificationSettings(config.notifications);
            } else {
                setNotificationSettings(defaultNotificationSettings);
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!token || !chatId) {
            showToast('الرجاء تعبئة الحقول المطلوبة قبل الحفظ.', 'error');
            return;
        }
        const config: TelegramConfig = {
            token,
            chatId,
            notifications: notificationSettings
        };
        saveTelegramConfig(config);
        showToast('تم حفظ الإعدادات بنجاح!', 'success');
        onClose();
    };

    const handleTest = async () => {
        setIsTesting(true);
        const result = await testTelegramConnection(token, chatId);
        showToast(result.message, result.success ? 'success' : 'error');
        setIsTesting(false);
    };

    const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setNotificationSettings(prev => ({ ...prev, [name]: checked }));
    };

    if (!isOpen) return null;

    const notificationLabels: Record<NotificationEvent, string> = {
        onAdd: 'إضافة مشروع جديد',
        onStatusUpdate: 'تحديث حالة المشروع',
        onDetailsUpdate: 'تحديث بيانات المشروع',
        onDelete: 'حذف مشروع'
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-300">إعدادات بوت تليجرام</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg text-sm text-gray-300 space-y-3 mb-6">
                        <p>للحصول على إشعارات، تحتاج إلى إنشاء بوت تليجرام خاص بك:</p>
                        <ol className="list-decimal list-inside space-y-1 pr-4">
                            <li>تحدث مع <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">BotFather</a> على تليجرام لإنشاء بوت جديد والحصول على **Token**.</li>
                            <li>تحدث مع <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@userinfobot</a> للحصول على **Chat ID** الخاص بك.</li>
                            <li>ابدأ محادثة مع البوت الذي أنشأته للتو عن طريق إرسال أي رسالة له.</li>
                        </ol>
                        <p className="font-semibold text-yellow-400">ملاحظة: هذه المعلومات حساسة. لا تشاركها مع أي شخص.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="bot-token" className="block text-sm font-medium text-gray-300 mb-1">Bot Token</label>
                            <input
                                type="text"
                                id="bot-token"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder="مثال: 1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label htmlFor="chat-id" className="block text-sm font-medium text-gray-300 mb-1">Chat ID</label>
                            <input
                                type="text"
                                id="chat-id"
                                value={chatId}
                                onChange={e => setChatId(e.target.value)}
                                placeholder="مثال: 123456789"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                dir="ltr"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4">إعدادات الإشعارات</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(notificationLabels).map(([key, label]) => (
                                 <label key={key} className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-md cursor-pointer hover:bg-gray-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={notificationSettings[key as NotificationEvent]}
                                        onChange={handleNotificationChange}
                                        className="w-5 h-5 text-indigo-500 bg-gray-600 border-gray-500 rounded focus:ring-indigo-600 focus:ring-2 ring-offset-gray-800"
                                    />
                                    <span className="text-white">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={isTesting}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTesting ? 'جارٍ الاختبار...' : 'اختبار الاتصال'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                        >
                            حفظ الإعدادات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelegramSettingsModal;
