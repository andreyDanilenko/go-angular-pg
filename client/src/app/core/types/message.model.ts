/**
 * Модель сообщения чата. Рассчитана на будущий бекенд:
 * статусы доставки, пересланные сообщения, ответы, реакции и т.д.
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageSender {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  sender?: MessageSender;
  text: string;
  /** ISO date string — бекенд может отдавать sent_at или sentAt */
  sentAt: string;
  /** Статус для исходящих (будущий бекенд) */
  status?: MessageStatus;
  /** Пересланное сообщение */
  isForwarded?: boolean;
  /** ID сообщения, на которое отвечаем */
  replyToId?: string | null;
  replyTo?: ChatMessage | null;
  /** Редактировано ли сообщение (будущий бекенд) */
  editedAt?: string | null;
  /** Вложения, голосовые и т.д. (будущий бекенд) */
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  name?: string;
  size?: number;
}

/** Нормализация сырого ответа API в ChatMessage */
export function toChatMessage(raw: Record<string, unknown>): ChatMessage {
  const sentAt = (raw['sentAt'] ?? raw['sent_at']) as string;
  return {
    id: String(raw['id'] ?? ''),
    chatId: String(raw['chatId'] ?? raw['chat_id'] ?? ''),
    senderId: String(raw['senderId'] ?? raw['sender_id'] ?? ''),
    sender: raw['sender'] as MessageSender | undefined,
    text: String(raw['text'] ?? ''),
    sentAt: sentAt ? new Date(sentAt).toISOString() : new Date().toISOString(),
    status: raw['status'] as MessageStatus | undefined,
    isForwarded: Boolean(raw['isForwarded'] ?? raw['is_forwarded']),
    replyToId: (raw['replyToId'] ?? raw['reply_to_id']) as string | null | undefined,
    replyTo: (raw['replyTo'] ?? raw['reply_to']) as ChatMessage | null | undefined,
    editedAt: (raw['editedAt'] ?? raw['edited_at']) as string | null | undefined,
    attachments: (raw['attachments'] as MessageAttachment[] | undefined),
  };
}
