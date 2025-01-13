import { DbService } from "../services/db.service";

export class DBRepository {
  constructor(private readonly dbService: DbService) {}

  // Method 1: Update 'last_sent_date' when a message is sent
  async updateLastSentDate(
    chatId: number,
    lastSentTime: string,
  ): Promise<void> {
    const query = `
      UPDATE chat_settings
      SET last_sent_date = $1
      WHERE chat_id = $2
    `;
    await this.dbService.query(query, [lastSentTime, chatId]);
  }

  // Method 2: Set predefined send time for a chat
  async setSendTime(chatId: number, sendTime: string): Promise<void> {
    console.log("setSendTime", chatId, sendTime);
    const query = `
      UPDATE chat_settings
      SET send_time = $1
      WHERE chat_id = $2
    `;
    await this.dbService.query(query, [sendTime, chatId]);
  }

  // Method 3: Set up notification time for a chat (insert or update)
  async setTimeForChat(
    chatId: number,
    startTime: string,
    endTime: string,
    timezone: string,
  ): Promise<void> {
    const query = `
      INSERT INTO chat_settings (chat_id, start_time, end_time, timezone, last_sent_date, send_time)
      VALUES ($1, $2, $3, $4, NULL, NULL)
      ON CONFLICT (chat_id)
      DO UPDATE SET start_time = $2, end_time = $3, timezone = $4, send_time = NULL
    `;
    await this.dbService.query(query, [chatId, startTime, endTime, timezone]);
  }

  // Method 4: Get chat settings by ID
  async getChatSettings(chatId: number): Promise<any> {
    const query = `
      SELECT * FROM chat_settings
      WHERE chat_id = $1
    `;
    const result = await this.dbService.query(query, [chatId]);
    return result[0]; // Return the first row (if found)
  }

  // Method 5: Get all chats eligible for notifications based on send_time
  async getChatsWithActiveSchedules(): Promise<any[]> {
    const query = `
      SELECT chat_id, timezone, send_time, last_sent_date, start_time, end_time
      FROM chat_settings
    `;
    return await this.dbService.query(query);
  }
}
