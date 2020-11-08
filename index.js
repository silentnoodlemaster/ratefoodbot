const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {
    polling: {
        params: {
            timeout: 100
        }
    },
});
bot.on("channel_post", (msg) => {
    bot.sendMessage(
        msg.chat.id, "❓",
        {
            reply_to_message_id: msg.message_id,
            reply_markup: {
                inline_keyboard:
                    [
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
                        ]
                    ]
            }
        }
    );
});

bot.on("callback_query", async (query) => {
    const allowed_users = ['creator', 'administrator']
    const user_status = (await (bot.getChatMember(query.message.chat.id, query.from.id))).status
    if(allowed_users.indexOf(user_status) == -1) {
        bot.answerCallbackQuery(query.id, {text: `Your status is ${user_status} but you need to be ${allowed_users.join(" or ")}`});
    } else {
        var oldkeys = query.message.reply_markup.inline_keyboard;
        Object.entries(oldkeys).forEach(entry => {
            entry.forEach(row => {
                if (typeof (row) == "object") Object.entries(row).forEach(cell => {
                    Object.entries(cell).forEach(keyboard => {
                        keyboard.forEach(button => {
                            if (typeof (button) == "object") {
                                var data = JSON.parse(button.callback_data);
                                var textparts = button.text.split(" ");
                                if (JSON.parse(query.data).id == data.id) {
                                    if (data.users.includes(query.from.id)) {
                                        data.users.splice(data.users.indexOf(query.from.id));
                                        textparts[1]--;
                                    } else {
                                        data.users.push(query.from.id);
                                        textparts[1]++;
                                    }
                                    button.callback_data = JSON.stringify(data);
                                    button.text = textparts.join(" ");
                                }
                            }
                        });
                    });
                });
            });
        });
        bot.editMessageReplyMarkup({ inline_keyboard: oldkeys }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
        bot.answerCallbackQuery(query.id)
    }
})