import { Chat, TelegramBot } from "https://deno.land/x/telegram_bot_api/mod.ts";

const handleError = function handleError(
  e: Error,
  chat: Chat,
  bot: TelegramBot,
) {
  const handleNestedError = (e: Error) => {
    console.error("error when handling error", e.name, e.message);
  }
  console.error(e.name, e.message);
  bot.sendMessage({
    chat_id: chat.id,
    text: "Sorry something went wrong",
  }).then((message) => {
    setTimeout(() => {
      bot.deleteMessage({
        chat_id: chat.id,
        message_id: message.message_id,
      }).catch((e: Error) => {
        handleNestedError(e);
      });
    }, 2000);
  }).catch((e: Error) => {
    handleNestedError(e);
  });
};

export default handleError;