import { DBRepository } from "../repository/db.repository";

export class BotService {
  constructor(private readonly botRepository: DBRepository) {}

  // Public method to set timer range for a chat
  async setTimer(
    chatId: number,
    startTime: string,
    endTime: string,
    timezone: string,
  ): Promise<void> {
    await this.botRepository.setTimeForChat(
      chatId,
      startTime,
      endTime,
      timezone,
    );
  }

  // Public method to set predefined send time for a chat
  async setSendTime(chatId: number, sendTime: string): Promise<void> {
    await this.botRepository.setSendTime(chatId, sendTime);
  }

  // Public method to update last sent date for a chat
  async updateLastSentDate(chatId: number, sendTime: string): Promise<void> {
    await this.botRepository.updateLastSentDate(chatId, sendTime);
  }

  async getChatsWithActiveSchedules(): Promise<any[]> {
    return await this.botRepository.getChatsWithActiveSchedules();
  }

  // Public method to fetch settings for a particular chat
  async getChatSettings(chatId: number): Promise<any> {
    return await this.botRepository.getChatSettings(chatId);
  }
}
