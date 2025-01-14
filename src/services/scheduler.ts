import cron from "node-cron";
import { BotService } from "../services/botservice";
import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export class Scheduler {
  constructor(
    private readonly bot: Telegraf<IBotContext>,
    private readonly botService: BotService,
  ) {}

  start() {
    // Check every minute for scheduled messages
    cron.schedule("* * * * *", async () => {
      try {
        console.log("Checking for scheduled messages...");

        const now = new Date();
        const nowUtc = now.toISOString(); // Current time in UTC

        // Fetch chats with messages to be sent now, considering their timezone
        const chats = await this.botService.getChatsWithActiveSchedules();

        for (const chat of chats) {
          try {
            const {
              timezone,
              send_time,
              last_sent_date,
              start_time,
              end_time,
            } = chat;

            // Convert current UTC time to the user's timezone
            const nowInUserTz = toZonedTime(
              nowUtc,
              this.normalizeTimezone(timezone),
            );
            const currentTime = this.formatTime(nowInUserTz);

            if (send_time != null) {
              console.log("current send time", send_time.slice(0, 5));
            }

            if (
              send_time != null &&
              last_sent_date == null &&
              currentTime === send_time.slice(0, 5)
            ) {
              // Send the message
              await this.bot.telegram.sendMessage(
                chat.chat_id,
                "Что ты делаешь прямо сейчас? Жду фотографии или видео.",
              );

              // Mark the message as sent
              // await this.botService.updateLastSentDate(chat.chat_id, send_time);

              // Generate a new random time for the next message in the user's timezone
              const newSendTimeInTz = this.getRandomTime(start_time, end_time);

              // Update the send_time in the database
              await this.botService.setSendTime(chat.chat_id, newSendTimeInTz);
            } else if (send_time == null) {
              console.log("SEND TIME IS NULL");
              // Generate a new random time for the next message in the user's timezone
              const newSendTimeInTz = this.getRandomTime(start_time, end_time);

              // Update the send_time in the database
              await this.botService.setSendTime(chat.chat_id, newSendTimeInTz);
              console.log(
                `Message scheduled to chat ID ${chat.chat_id}, next send time: ${newSendTimeInTz} (UTC)`,
              );
            }
          } catch (error) {
            console.error(`Failed to process chat ID ${chat.chat_id}:`, error);
          }
        }
      } catch (error) {
        console.error("Error in scheduler:", error);
      }
    });

    console.log("Scheduler started...");
  }

  // Helper function to format time as HH:MM
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // Generate a random time within the specified range
  private getRandomTime(startTime: string, endTime: string): string {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    const randomMinute = Math.floor(Math.random() * (end - start + 1)) + start;
    const randomHour = Math.floor(randomMinute / 60);
    const randomMin = randomMinute % 60;

    return `${randomHour.toString().padStart(2, "0")}:${randomMin
      .toString()
      .padStart(2, "0")}`;
  }

  // Convert a time in the user's timezone to UTC
  private convertTimeToUtc(time: string, timezone: string): string {
    const [hours, minutes] = time.split(":").map(Number);

    // Create a base date
    const baseDate = new Date();
    baseDate.setUTCHours(hours, minutes, 0, 0); // Set the desired time in UTC

    // Convert the base UTC time to the target timezone
    const utcDate = fromZonedTime(baseDate, timezone); // Converts to UTC

    // Format the adjusted UTC time
    const utcTime = this.formatTime(utcDate);
    console.log(
      `Converted time ${time} in timezone ${timezone} to UTC: ${utcTime}`,
    );
    return utcTime;
  }

  private normalizeTimezone(timezone: string): string {
    const offsetMatch = timezone.match(/UTC([+-]\d+)/);
    if (offsetMatch) {
      const offset = parseInt(offsetMatch[1], 10);
      const hours = Math.abs(offset).toString().padStart(2, "0");
      const sign = offset >= 0 ? "+" : "-";
      return `${sign}${hours}:00`;
    }
    throw new Error(`Invalid timezone format: ${timezone}`);
  }
}
