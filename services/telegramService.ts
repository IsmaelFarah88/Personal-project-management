
import { Project, Status } from './types';

const TELEGRAM_CONFIG_KEY = 'telegram-config-ismael-farah';

export type NotificationEvent = 'onAdd' | 'onStatusUpdate' | 'onDetailsUpdate' | 'onDelete';

export interface TelegramConfig {
  token: string;
  chatId: string;
  notifications: Record<NotificationEvent, boolean>;
}

// Helper to escape text for Telegram MarkdownV2
export const tgEscape = (text: string | undefined | null): string => {
    if (!text) return '';
    // Escape characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
    return text.replace(/(\_|\*|\[|\]|\(|\)|\~|\`|\>|\#|\+|\-|\=|\{|\}|\.|\!)/g, '\\$1');
};


export const saveTelegramConfig = (config: TelegramConfig): void => {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
};

export const getTelegramConfig = (): TelegramConfig | null => {
  const configStr = localStorage.getItem(TELEGRAM_CONFIG_KEY);
  if (!configStr) return null;
  try {
    const config = JSON.parse(configStr);
    // Add defaults for notifications for backward compatibility
    config.notifications = {
        onAdd: config.notifications?.onAdd ?? true,
        onStatusUpdate: config.notifications?.onStatusUpdate ?? true,
        onDetailsUpdate: config.notifications?.onDetailsUpdate ?? true,
        onDelete: config.notifications?.onDelete ?? true,
    };
    return config;
  } catch (e) {
    console.error("Failed to parse Telegram config", e);
    localStorage.removeItem(TELEGRAM_CONFIG_KEY);
    return null;
  }
};

const buildMessage = (eventType: NotificationEvent, project: Project, details?: any): string => {
    const projectName = `*${tgEscape(project.name)}*`;

    switch (eventType) {
        case 'onAdd':
            return [
                `🌟 *مشروع جديد تم إنشاؤه* 🌟`,
                '',
                `*المشروع:* ${projectName}`,
                `*الطالب:* ${tgEscape(project.studentName)}`,
                `*التقنية:* ${tgEscape(project.technology)}`,
                `*الموعد النهائي:* ${tgEscape(new Date(project.deadline).toLocaleDateString('en-CA'))}`,
                '',
                '🚀 لتبدأ الرحلة\\!',
            ].join('\n');
        
        case 'onDelete':
            return `🗑️ *تم حذف المشروع*\n\nتمت إزالة المشروع التالي:\n\n*المشروع:* ${projectName}\n*الطالب:* ${tgEscape(project.studentName)}\n\n_سيتم افتقاده\\._`;

        case 'onStatusUpdate':
            return `📊 *تحديث حالة المشروع: ${projectName}*\n\nتم تغيير الحالة من _${tgEscape(details?.originalStatus)}_ إلى *${tgEscape(project.status)}*\\.`;

        case 'onDetailsUpdate':
            const { changes } = details;
            const messageParts: string[] = [`🔄 *تحديث مشروع: ${projectName}*`];
            
            if (changes.details?.length > 0) {
                messageParts.push('\n*التفاصيل الأساسية:*\n' + changes.details.join('\n'));
            }
            if (changes.tasks?.length > 0) {
                messageParts.push('\n*تحديثات المهام:*\n' + changes.tasks.join('\n'));
            }
             if (changes.logs?.length > 0) {
                messageParts.push('\n*سجل التقدم:*\n' + changes.logs.join('\n'));
            }
            if (changes.attachments?.length > 0) {
                messageParts.push('\n*المرفقات:*\n' + changes.attachments.join('\n'));
            }
            messageParts.push('\n✨ استمر في العمل الرائع\\!');
            return messageParts.join('\n');
        
        default:
            return '';
    }
}

const buildKeyboard = (project: Project) => {
    const keyboard = [];
    
    if (project.githubLink) {
        keyboard.push({ text: 'View on GitHub ↗️', url: project.githubLink });
    }
    if (project.whatsappNumber) {
        const cleanNumber = project.whatsappNumber.replace(/\D/g, '');
        keyboard.push({ text: 'Chat on WhatsApp 💬', url: `https://wa.me/${cleanNumber}` });
    }

    return keyboard.length > 0 ? { inline_keyboard: [keyboard] } : null;
}


export const sendTelegramMessage = async (eventType: NotificationEvent, project: Project, details?: any): Promise<void> => {
  const config = getTelegramConfig();
  
  if (!config || !config.token || !config.chatId) {
    console.log("Telegram integration is not configured. Skipping message.");
    return;
  }

  if (!config.notifications[eventType]) {
    console.log(`Telegram notification for event type '${eventType}' is disabled. Skipping message.`);
    return;
  }
  
  const message = buildMessage(eventType, project, details);
  if (!message) return;

  const keyboard = buildKeyboard(project);
  
  const payload: any = {
    chat_id: config.chatId,
    text: message,
    parse_mode: 'MarkdownV2',
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`);
    }
    
    console.log("Telegram message sent successfully for event:", eventType);

  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    // In a real app, you might want to show a non-blocking notification to the user
    // For this personal tool, logging to console is sufficient.
  }
};
