const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {
    polling: {params: {
        timeout: 100
    }},
});
bot.on("channel_post", (msg) => {
    bot.sendMessage(
        msg.chat.id,"❓", { reply_to_message_id: msg.message_id, reply_markup: {inline_keyboard: [
            [
                {text: "😍 0", callback_data: "a"},
                {text: "🤮 0", callback_data: "b"},
            ],
            [
                {text: "👍 0", callback_data: "c"},
                {text: "👎 0", callback_data: "d"},
            ],
            [
                {text: "🔥 0", callback_data: "e"},
                {text: "🤷 0", callback_data: "f"},
            ]
        ]}}
    );
});

bot.on("callback_query", (query) => {
    var oldkeys = query.message.reply_markup.inline_keyboard;
    Object.entries(oldkeys).forEach(entry => {
        entry.forEach(row => {
            if(typeof(row) == "object") Object.entries(row).forEach(cell => {
                Object.entries(cell).forEach(keyboard => {
                    keyboard.forEach(button => {
                        if(typeof(button) == "object") {
                            if(query.data == button.callback_data) {
                                var textparts = button.text.split(" ");
                                textparts[1]++
                                button.text = textparts.join(" ")
                            }
                        }
                    });
                });
            });
        });
    });
    bot.editMessageReplyMarkup({inline_keyboard: oldkeys}, {chat_id: query.message.chat.id,message_id: query.message.message_id });
    bot.answerCallbackQuery(query.id)
})