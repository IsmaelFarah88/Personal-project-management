
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Project, Status, UpdateLogEntry } from '../services/types';
import { CloseIcon } from './icons/CloseIcon';
import { BotIcon } from './icons/BotIcon';

type Message = {
    id: string;
    sender: 'user' | 'bot' | 'system';
    content: React.ReactNode;
};

interface TelegramBotSimulatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onUpdateProject: (project: Project) => void;
    onBackup: () => void;
}

const createMessage = (sender: 'user' | 'bot' | 'system', content: React.ReactNode): Message => ({
    id: `msg-${Date.now()}-${Math.random()}`,
    sender,
    content,
});

const TelegramBotSimulatorModal: React.FC<TelegramBotSimulatorModalProps> = ({ isOpen, onClose, projects, onUpdateProject, onBackup }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [actionContext, setActionContext] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const addBotMessage = useCallback((content: React.ReactNode) => {
        setMessages(prev => [...prev, createMessage('bot', content)]);
    }, []);

    const showWelcomeMessage = useCallback(() => {
        setMessages([
            createMessage('bot', 
                <div>
                    <p className="font-bold mb-2">أهلاً بك في مساعد المشاريع الآلي!</p>
                    <p>يمكنك استخدام الأوامر التالية لإدارة مشاريعك:</p>
                    <ul className="list-disc pr-4 mt-2 text-sm space-y-1">
                        <li><code className="bg-gray-900/50 p-1 rounded-md">/help</code> - عرض هذه الرسالة</li>
                        <li><code className="bg-gray-900/50 p-1 rounded-md">/summary</code> - ملخص سريع للمشاريع</li>
                        <li><code className="bg-gray-900/50 p-1 rounded-md">/backup</code> - إنشاء نسخة احتياطية</li>
                        <li><code className="bg-gray-900/50 p-1 rounded-md">/project [name]</code> - البحث عن مشروع واتخاذ إجراء</li>
                    </ul>
                </div>
            )
        ]);
        setActionContext(null);
    }, []);

    useEffect(() => {
        if (isOpen) {
            showWelcomeMessage();
        }
    }, [isOpen, showWelcomeMessage]);

    const processCommand = useCallback(async (commandText: string) => {
        const [command, ...args] = commandText.trim().toLowerCase().split(' ');
        const argString = args.join(' ');

        if (actionContext?.type === 'add_note') {
            const project = actionContext.project;
            const newLogEntry: UpdateLogEntry = {
                id: `log-${Date.now()}`,
                text: commandText,
                timestamp: new Date().toISOString(),
            };
            const updatedProject = { ...project, updateLog: [...(project.updateLog || []), newLogEntry] };
            onUpdateProject(updatedProject);
            addBotMessage(`✅ تمت إضافة الملاحظة بنجاح لمشروع "${project.name}".`);
            setActionContext(null);
            return;
        }

        switch (command) {
            case '/help':
                showWelcomeMessage();
                break;
            case '/summary':
                const total = projects.length;
                const inProgress = projects.filter(p => p.status === Status.InProgress).length;
                const completed = projects.filter(p => p.status === Status.Completed).length;
                addBotMessage(
                    <div>
                        <p>إليك ملخص المشاريع:</p>
                        <p>• الإجمالي: {total}</p>
                        <p>• قيد التنفيذ: {inProgress}</p>
                        <p>• مكتملة: {completed}</p>
                    </div>
                );
                break;
            case '/backup':
                onBackup();
                addBotMessage('تم بدء عملية النسخ الاحتياطي. سيتم تحميل الملف قريبًا.');
                break;
            case '/project':
                const foundProjects = projects.filter(p => p.name.toLowerCase().includes(argString));
                if (foundProjects.length === 0) {
                    addBotMessage(`لم أجد أي مشروع يطابق "${argString}".`);
                } else if (foundProjects.length === 1) {
                    const project = foundProjects[0];
                    setActionContext({ type: 'project_actions', project });
                    addBotMessage(
                        <div>
                            <p className="font-bold">مشروع: {project.name}</p>
                            <p className="text-sm">الطالب: {project.studentName}</p>
                            <p className="text-sm">الحالة: {project.status}</p>
                            <div className="mt-3 border-t border-gray-600 pt-2 flex flex-wrap gap-2">
                                <button onClick={() => setActionContext({ type: 'change_status', project })} className="text-sm bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-md">تغيير الحالة</button>
                                <button onClick={() => setActionContext({ type: 'add_note', project })} className="text-sm bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-md">إضافة ملاحظة</button>
                            </div>
                        </div>
                    );
                } else {
                    addBotMessage(`وجدت عدة مشاريع تطابق بحثك. الرجاء كن أكثر تحديدًا:\n${foundProjects.map(p => `• ${p.name}`).join('\n')}`);
                }
                break;
            default:
                addBotMessage('أمر غير معروف. اكتب /help لعرض قائمة الأوامر.');
        }
    }, [projects, onBackup, onUpdateProject, addBotMessage, showWelcomeMessage, actionContext]);

    useEffect(() => {
        if (actionContext?.type === 'change_status') {
            const project = actionContext.project;
            addBotMessage(
                <div>
                    <p>اختر الحالة الجديدة لمشروع "{project.name}":</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.values(Status).map(status => (
                            <button key={status} onClick={() => {
                                const updatedProject = { ...project, status: status };
                                onUpdateProject(updatedProject);
                                addBotMessage(`✅ تم تحديث حالة مشروع "${project.name}" إلى "${status}".`);
                                setActionContext(null);
                            }} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-md">{status}</button>
                        ))}
                    </div>
                </div>
            );
        } else if (actionContext?.type === 'add_note') {
            addBotMessage(`الرجاء كتابة الملاحظة التي تود إضافتها لمشروع "${actionContext.project.name}":`);
        }
    }, [actionContext, addBotMessage, onUpdateProject]);


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const commandText = input.trim();
        if (!commandText || isBotTyping) return;

        setMessages(prev => [...prev, createMessage('user', commandText)]);
        setInput('');
        setIsBotTyping(true);

        setTimeout(() => {
            processCommand(commandText);
            setIsBotTyping(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                <header className="p-4 flex justify-between items-center bg-gray-900/50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <BotIcon className="w-8 h-8 text-cyan-400" />
                        <div>
                            <h2 className="text-lg font-bold text-white">مساعد المشاريع</h2>
                            <p className="text-xs text-green-400">● متصل</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <BotIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />}
                            <div className={`rounded-lg px-4 py-2 text-white max-w-lg ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                {typeof msg.content === 'string' ? <p>{msg.content}</p> : msg.content}
                            </div>
                        </div>
                    ))}
                    {isBotTyping && (
                        <div className="flex items-end gap-2 justify-start">
                            <BotIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                            <div className="rounded-lg px-4 py-2 text-white bg-gray-700">
                                <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700">
                    <form onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={actionContext?.type === 'add_note' ? 'اكتب ملاحظتك هنا...' : 'اكتب أمراً... (مثال: /help)'}
                            disabled={isBotTyping}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TelegramBotSimulatorModal;
