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

export const sendTelegramMessage = async (message: string, eventType: NotificationEvent): Promise<void> => {
  const config = getTelegramConfig();
  
  if (!config || !config.token || !config.chatId) {
    console.log("Telegram integration is not configured. Skipping message.");
    return;
  }

  if (!config.notifications[eventType]) {
    console.log(`Telegram notification for event type '${eventType}' is disabled. Skipping message.`);
    return;
  }
  
  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'MarkdownV2',
      }),
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