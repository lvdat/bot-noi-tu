const { Client, Intents, SlashCommandBuilder } = require('discord.js');
const dictionary = require('@vntk/dictionary');
require('dotenv').config()
const client = new Client({ intents: 3241725 });
const PREFIX = '!noitu ';

const LOG_FILE_PATH = 'voice-log.txt'; // Đường dẫn của file log

let isGameRunning = false;
let lastWord = '';

client.once('ready', () => {
    console.log('Bot đã sẵn sàng!');
});

// Hàm ghi log vào file
function writeToLog(message) {
    fs.appendFile(LOG_FILE_PATH, message + '\n', err => {
        if (err) {
            console.error('Lỗi khi ghi log vào file:', err);
        }
    });
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = interaction.commandName;
    const args = interaction.options.getString('word');

    if (command === 'ping') {
        const startTime = Date.now();
        await interaction.reply({ content: 'Pinging...', ephemeral: true });
        const endTime = Date.now();
        await interaction.editReply({ content: `Pong! Latency is ${endTime - startTime}ms.`, ephemeral: true });
    } else if (command === 'start') {
        if (isGameRunning) {
            await interaction.reply({ content: 'Trò chơi đã bắt đầu!', ephemeral: true });
        } else {
            isGameRunning = true;
            await interaction.reply({ content: 'Trò chơi đã bắt đầu! Hãy ghi ra một từ tiếng Việt có 2 tiếng.', ephemeral: true });
        }
    } else if (command === 'word') {
        if (!args) {
            await interaction.reply({ content: 'Vui lòng ghi ra một từ tiếng Việt có 2 tiếng.', ephemeral: true });
            return;
        }

        if (lastWord && args.charAt(0) !== lastWord.slice(-1)) {
            await interaction.reply({ content: `Từ bạn ghi ra không hợp lệ. Hãy bắt đầu bằng chữ "${lastWord.slice(-1)}".`, ephemeral: true });
            return;
        }

        if (!dictionary.has(args)) {
            await interaction.reply({ content: 'Từ bạn ghi ra không có trong từ điển tiếng Việt.', ephemeral: true });
            return;
        }

        lastWord = args;
        await interaction.reply({ content: `Từ "${args}" đã được ghi lại. Lượt kế tiếp!`, ephemeral: true });

        // Ghi tin nhắn vào file log
        writeToLog(`[${new Date().toLocaleString()}] ${interaction.user.username}: ${args}`);
    }
});

client.login(process.env.BOT_TOKEN);
