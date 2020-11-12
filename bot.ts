import {
  InlineKeyboardCallbackDataButton,
  TelegramBot,
  UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

import handleError from "./errorhandling.ts";

const TOKEN = Deno.env.get("TELEGRAM_TOKEN");
if (!TOKEN) throw new Error("No token provided");
const bot = new TelegramBot(TOKEN);

interface ButtonData {
  id: number;
  users: [number];
}

bot.on(UpdateType.ChannelPost, ({ channel_post }) => {
  bot.sendMessage({
    chat_id: channel_post.chat.id,
    text: "❓",
    reply_to_message_id: channel_post.message_id,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "😍 0", callback_data: '{"id": 1, "users": [] }' },
          { text: "🤮 0", callback_data: '{"id": 2, "users": [] }' },
        ],
        [
          { text: "👍 0", callback_data: '{"id": 3, "users": [] }' },
          { text: "👎 0", callback_data: '{"id": 4, "users": [] }' },
        ],
        [
          { text: "🔥 0", callback_data: '{"id": 5, "users": [] }' },
          { text: "🤷 0", callback_data: '{"id": 6, "users": [] }' },
        ],
      ],
    },
  }).catch((e: Error) => {
    handleError(e, channel_post.chat, bot);
  });
});

bot.on(UpdateType.CallbackQuery, async ({ callback_query }) => {
  const allowedUsers = ["creator", "administrator"];
  const userStatus = (await (bot.getChatMember({
    chat_id: callback_query.message!.chat.id,
    user_id: callback_query.from.id,
  }))).status;
  var oldInlineKeyboard = callback_query.message!.reply_markup!.inline_keyboard;
  if (allowedUsers.indexOf(userStatus) == -1) {
    bot.answerCallbackQuery({
      callback_query_id: callback_query.id,
      text: `Your status is ${userStatus} but you need to be ${
        allowedUsers.join(" or ")
      }`,
    }).catch((e: Error) => {
      handleError(e, callback_query.message!.chat, bot);
    });
  } else {
    for (
      const button of oldInlineKeyboard
        .flat() as InlineKeyboardCallbackDataButton[]
    ) {
      if (
        callback_query.data == button.callback_data && button.text.includes(" ")
      ) {
        const data = JSON.parse(button.callback_data) as ButtonData;
        let number = parseInt(button.text.split(" ")[1]);
        const emoji = button.text.split(" ")[0];
        if ((JSON.parse(callback_query.data) as ButtonData).id == data.id) {
          if (data.users.includes(callback_query.from.id)) {
            data.users.splice(data.users.indexOf(callback_query.from.id));
            number--;
          } else {
            data.users.push(callback_query.from.id);
            number++;
          }
        }
        button.callback_data = JSON.stringify(data);
        button.text = `${emoji} ${number}`;
      }
    }
  }
  bot.editMessageReplyMarkup({
    chat_id: callback_query.message!.chat.id,
    message_id: callback_query.message!.message_id,
    reply_markup: {
      inline_keyboard: oldInlineKeyboard,
    },
  }).catch((e: Error) => {
    handleError(e, callback_query.message!.chat, bot);
  });
  bot.answerCallbackQuery({
    callback_query_id: callback_query.id,
  }).catch((e: Error) => {
    handleError(e, callback_query.message!.chat, bot);
  });
});
bot.run({
  polling: true,
});
