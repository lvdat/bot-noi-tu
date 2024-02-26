const dictionary = require('@vntk/dictionary');
const Discord = require('discord.js');
const client = new Discord.Client();
const PREFIX = '!noitu ';
require('dotenv').config()

let isGameRunning = false;
let lastWord = '';

client.once('ready', () => {
    console.log('Bot đã sẵn sàng!');
});

client.on('message', async message => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === `${PREFIX}ping`) {
        const startTime = Date.now();
        const sent = await message.channel.send('Pinging...');
        const endTime = Date.now();
        sent.edit(`Pong! Latency is ${endTime - startTime}ms.`);
    } else if (command === `${PREFIX}start`) {
        if (isGameRunning) {
            message.channel.send('Trò chơi đã bắt đầu!');
        } else {
            isGameRunning = true;
            message.channel.send('Trò chơi đã bắt đầu! Hãy ghi ra một từ tiếng Việt có 2 tiếng.');
        }
    } else if (isGameRunning && command === `${PREFIX}word`) {
        const newWord = args.join(' ').trim();
        if (!newWord) {
            message.channel.send('Vui lòng ghi ra một từ tiếng Việt có 2 tiếng.');
            return;
        }

        if (lastWord && newWord.charAt(0) !== lastWord.slice(-1)) {
            message.channel.send(`Từ bạn ghi ra không hợp lệ. Hãy bắt đầu bằng chữ "${lastWord.slice(-1)}".`);
            return;
        }

        if (!dictionary.has(newWord)) {
            message.channel.send('Từ bạn ghi ra không có trong từ điển tiếng Việt.');
            return;
        }

        try {
            await message.react('✅'); // React emoji tick vào tin nhắn
            lastWord = newWord;
        } catch (error) {
            console.error('Lỗi khi thêm emoji phản ứng vào tin nhắn:', error);
        }
    }
});

client.login(process.env.BOT_TOKEN);
