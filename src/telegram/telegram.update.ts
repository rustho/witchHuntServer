import { Start, Update, Ctx, Message, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
  private userStates: Map<number, 'WAITING_FOR_NAME'> = new Map();

  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    this.userStates.set(userId, 'WAITING_FOR_NAME');
    await ctx.reply('Please write your name:');

    console.log('startCommand', userId);
  }

  @On('text')
  async onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    const userId = ctx.from.id;
    const state = this.userStates.get(userId);

    console.log('onMessage', userId, message, state);

    if (state === 'WAITING_FOR_NAME') {
      const telegramNickname = ctx.from.username || '';

      console.log('onMessage', userId, message, state, telegramNickname);
      
      try {
        await this.telegramService.saveUserName(telegramNickname, message);
        await ctx.reply('Thank you! Your name has been saved.');
      } catch (error) {
        await ctx.reply('Sorry, there was an error saving your name. Please try again later.');
      }
      
      this.userStates.delete(userId);
    }
  }
} 