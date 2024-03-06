const fs = require('fs')
const path = require('path')
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const dictionary = require('@vntk/dictionary')
require('dotenv').config()
const dataChannel = require('./data/data.json')
const wordDataChannel = require('./data/word-data.json')

const wordDataPath = path.resolve(__dirname, './data/word-data.json')
const queryDataPath = path.resolve(__dirname, './query.txt')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// load word data
const dicData = dictionary.lower_words

// global config
const START_COMMAND = '!start'
const STOP_COMMAND = '!stop'
let queryCount = 0

// We create a collection for commands
client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
}

// Events like ready.js (when the robot turns on), 
// or messageCreate.js (when a user/robot sends a message)
const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else {
        client.on(event.name, (...args) => event.execute(...args, client))
    }
}

// function

const sendMessageToChannel = (msg, channel_id) => {
    client.channels.cache.get(channel_id).send(msg)
}

const checkIfHaveAnswerInDb = (word) => {
    let w = word.split(/ +/)
    let lc = w[w.length - 1]
    for (let i = 0; i < dicData.length; i++) {
        let tempw = dicData[i].split(/ +/)
        if (tempw.length > 1 && tempw[0] === lc && !isWordExist(dicData[i])) {
            // detect word
            queryCount += i
            return true
        }
    }
    return false
}

const isWordDataExist = (channel) => {
    return wordDataChannel[channel] !== undefined
}

const isGameRunning = (channel) => {
    return isWordDataExist(channel) && wordDataChannel[channel].running === true
}

const startGame = (channel) => {
    wordDataChannel[channel].running = true
    fs.writeFileSync(wordDataPath, wordDataChannel)
}
const stopGame = (channel) => {
    wordDataChannel[channel].running = false
    fs.writeFileSync(wordDataPath, wordDataChannel)
}

const initWordData = (channel) => {
    wordDataChannel[channel] = {
        running: false,
        currentPlayer: "",
        words: [],
        query: 0
    }
    fs.writeFileSync(wordDataPath, wordDataChannel)
}

const isWordExist = (word, words) => {
    for (let i = 0; i < words.length; i++) {
        if (words[i] === word) {
            return true
        }
    }
    return false
}
// end function

// LOGIC GAME

client.on('messageCreate', async message => {
    if(message.author.bot) return // detect mess from BOT

    let guild = message.guild
    let channel = message.channel

    if(dataChannel[guild.id] !== undefined && dataChannel[guild.id].channel !== undefined) {
        // detect channel not config
        return
    }
    let configChannel = dataChannel[guild.id].channel
    
    if(!isWordDataExist(configChannel)) {
        initWordData(configChannel)
    }

    let isRunning = isGameRunning(configChannel)

    if (message.content === START_COMMAND) {
        if (!isRunning) {
            sendMessageToChannel(`Trò chơi đã bắt đầu, ai đó hãy bắt đầu với một từ nào!`, configChannel)
            startGame(configChannel)
        } else sendMessageToChannel('Trò chơi vẫn đang tiếp tục. Bạn có thể dùng `!stop`', configChannel)
        return
    } else if (message.content === STOP_COMMAND) {
        if (isRunning) {
            sendMessageToChannel(`Đã kết thúc lượt này!`, configChannel)
            initWordData(configChannel)
        } else sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    if (!isRunning) {
        // check if game is running
        sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    let currentWordData = wordDataChannel[configChannel]
    let tu = message.content.trim().toLowerCase()
    let args1 = tu.split(/ +/)
    let words = currentWordData.words

    if(words.length > 0) {
        // player can't answer 2 times
        let lastPlayerId = currentWordData.currentPlayer
        if (message.author.id === lastPlayerId) {
            message.react('❌')
            sendMessageToChannel('Bạn đã trả lời lượt trước rồi, hãy đợi đối thủ!')
            return
        }
    }

    // check if words have or more than 1 space
    if (!(args1.length > 1)) {
        message.react('❌')
        sendMessageToChannel('Vui lòng nhập từ có chứa nhiều hơn 2 tiếng!')
        return
    }

    if(isWordExist(tu, words)) {
        // check used word
        message.react('❌')
        sendMessageToChannel('Từ này đã được sử dụng!')
        return
    }

    if (words.length > 0) {
        const lastWord = words[words.length - 1]
        const args2 = lastWord.split(/ +/)
        if (!(args1[0] === args2[args2.length - 1])) {
            message.react('❌')
            sendMessageToChannel('Từ này không bắt đầu với tiếng `' + args2[args2.length - 1] + '`', configChannel)
            return
        }
    }

    if(!dictionary.has(tu)) {
        // check in dictionary
        message.react('❌')
        sendMessageToChannel('Từ này không có trong từ điển tiếng Việt!', configChannel)
        return
    }

    words.push(tu)
    wordDataChannel[configChannel].words = words
    wordDataChannel[configChannel].currentPlayer.id = message.author.id
    wordDataChannel[configChannel].currentPlayer.name = message.author.displayName

    message.react('✅')

    console.log(`[${configChannel}] - #${words.length} - ${tu}`)

    if(!checkIfHaveAnswerInDb(tu)) {
        sendMessageToChannel(`${message.author.displayName} đã chiến thắng sau ${words.length} lượt! Trò chơi kết thúc`, configChannel)
        initWordData(configChannel)
        return
    }

})

// END LOGIC GAME

// The interactionCreate event directly here, as this is the heart of the robot.
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return

    // We log when a user makes a command
    try {
        await console.log(
            `/${interaction.commandName} — Par ${interaction.user.username}`
        )
        await command.execute(interaction, client)
        // But if there is a mistake, 
        // then we log that and send an error message only to the person (ephemeral: true)
    } catch (error) {
        console.error(error)
        return interaction.reply({
            content: "An error occurred while executing this command!",
            ephemeral: true,
            fetchReply: true
        })
    }
})

// The token of your robot to be inserted
client.login(process.env.BOT_TOKEN)