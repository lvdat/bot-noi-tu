const fs = require('fs')
const path = require('path')
const { Client, GatewayIntentBits, Collection, PermissionsBitField } = require('discord.js')
const axios = require('axios')
require('dotenv').config()
const { generateDependencyReport } = require('@discordjs/voice')
const moment = require('moment-timezone')

console.log(generateDependencyReport());

const emptyData = {}
const dataPath = path.resolve(__dirname, './data/data.json')
const wordDataPath = path.resolve(__dirname, './data/word-data.json')
const queryPath = path.resolve(__dirname, './data/query.txt')
const wordDataUrl = 'https://github.com/undertheseanlp/dictionary/raw/master/dictionary/words.txt'
const wordDatabasePath = path.resolve(__dirname, './data/words.txt')
const voiceLogPath = path.resolve(__dirname, './data/voice-log.txt')

if (!fs.existsSync(dataPath)) {
    console.log(`[WARNING] File data.json doesn't exist. Creating...`)
    fs.writeFileSync(dataPath, JSON.stringify(emptyData))
} else {
    console.log(`[OK] File data.json exist.`)
}

if (!fs.existsSync(wordDataPath)) {
    console.log(`[WARNING] File word-data.json doesn't exist. Creating...`)
    fs.writeFileSync(wordDataPath, JSON.stringify(emptyData))
} else {
    console.log(`[OK] File word-data.json exist.`)
}

if (!fs.existsSync(queryPath)) {
    console.log(`[WARNING] File query.txt doesn't exist. Creating...`)
    fs.writeFileSync(queryPath, '0')
} else {
    console.log(`[OK] File query.txt exist.`)
}

if (!fs.existsSync(voiceLogPath)) {
    console.log(`[WARNING] File voice-log.txt doesn't exist. Creating...`)
    fs.writeFileSync(voiceLogPath, '')
} else {
    console.log(`[OK] File voice-log.txt exist.`)
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})

let dicData = []

// load word data
if (!fs.existsSync(wordDatabasePath)) {
    console.log('[WARNING] Downloading words database from Github...')
    // load dictionary from Github repo
    axios.get(wordDataUrl)
        .then(async res => {
            const lines = res.data.trim().split('\n')
            const wordsdb = lines.map(line => JSON.parse(line).text)
            fs.writeFileSync(wordDatabasePath, wordsdb.join('\n'))
            console.log('[OK] Saved words database to ' + wordDatabasePath)

            await continueExecution()
        })
        .catch(err => {
            console.log('[ERROR] Error when download data: ' + err.message)
            return
        })
} else {
    continueExecution()
}

async function continueExecution() {
    console.log('[WARNING] Loading words...')
    fs.readFile(wordDatabasePath, 'utf-8', (err, data) => {
        if(err) {
            console.log('[ERROR] Error when load words:', err)
            return
        }
        const tempWord = data.toLowerCase().split('\n')
        console.log(`[OK] Loaded ${tempWord.length} words. Normalizing...`)
        global.dicData = tempWord.filter(w => w.split(' ').length == 2 && !w.includes('-') && !w.includes('(') && !w.includes(')'))
        console.log(`[OK] Normalized words. ${global.dicData.length} words remaining.`)
        // console.log(global.dicData)
    })
}

const checkDict = (word) => {
    return global.dicData.includes(word.toLowerCase())
}

// global config
const START_COMMAND = '!start'
const STOP_COMMAND = '!stop'
let queryCount = parseInt(fs.readFileSync(queryPath, 'utf-8'))

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

// LOGIC GAME

client.on('messageCreate', async message => {
    const dataChannel = require(dataPath)
    const wordDataChannel = require(wordDataPath)

    // function
    const sendMessageToChannel = (msg, channel_id) => {
        client.channels.cache.get(channel_id).send({
            content: msg,
            flags: [4096]
        })
    }

    const isWordDataExist = (channel) => {
        return wordDataChannel[channel] !== undefined
    }

    const isGameRunning = (channel) => {
        return isWordDataExist(channel) && wordDataChannel[channel].running === true
    }

    const startGame = (channel) => {
        wordDataChannel[channel].running = true
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }
    const stopGame = (channel) => {
        wordDataChannel[channel].running = false
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }

    const initWordData = (channel) => {
        wordDataChannel[channel] = {
            running: false,
            currentPlayer: {},
            words: []
        }
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }
    // end function

    if(message.author.bot) return // detect mess from BOT

    let guild = message.guild
    let channel = message.channel

    if(dataChannel[guild.id] === undefined || dataChannel[guild.id].channel === undefined) {
        // detect channel not config
        return
    }
    let configChannel = dataChannel[guild.id].channel
    
    if (message.channel.id !== configChannel) return

    if(!isWordDataExist(configChannel)) {
        initWordData(configChannel)
    }

    let isRunning = isGameRunning(configChannel)

    if (message.content === START_COMMAND) {
        if (!isRunning) {
            sendMessageToChannel(`Trò chơi đã bắt đầu!`, configChannel)
            startGame(configChannel)
        } else sendMessageToChannel('Trò chơi vẫn đang tiếp tục. Bạn có thể dùng `!stop`', configChannel)
        return
    } else if (message.content === STOP_COMMAND) {

        if(!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            message.reply({
                content: 'Bạn không có quyền dùng lệnh này',
                ephemeral: true
            })
            return
        }

        if (isRunning) {
            sendMessageToChannel(`Đã kết thúc lượt này! Lượt mới đã bắt đầu!`, configChannel)
            initWordData(configChannel)
            startGame(configChannel)
        } else sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    if (!isRunning) {
        // check if game is running
        // sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    let currentWordData = wordDataChannel[configChannel]
    let tu = message.content.trim().toLowerCase()
    let args1 = tu.split(/\s+/).filter(Boolean) // split fix for multiple space in word.
    tu = args1.join(' ') // remake word after split.
    let words = wordDataChannel[configChannel].words

    // console.log(args1)

    // functions load after channel defined

    const checkIfWordUsed = (word) => {
        for (let j = 0; j < words.length; j++) {
            if (words[j] === word) {
                return true
            }
        }
    }

    const checkIfHaveAnswerInDb = (word) => {
        let w = word.split(/ +/)
        let lc = w[w.length - 1]
        for (let i = 0; i < global.dicData.length; i++) {
            let temp = global.dicData[i]
            let tempw = temp.split(/ +/)
            if (tempw.length > 1 && tempw[0] === lc) {
                // detect word
                queryCount += i
                if (checkIfWordUsed(temp)) {
                    // if word is used, cancel this loop round.
                    continue
                }
                return true
            }
        }
        return false
    }

    // end function

    if(words.length > 0) {
        // player can't answer 2 times
        let lastPlayerId = currentWordData.currentPlayer.id
        if (message.author.id === lastPlayerId) {
            message.react('❌')
            sendMessageToChannel('Bạn đã trả lời lượt trước rồi, hãy đợi đối thủ!', configChannel)
            return
        }
    }

    // check if words have or more than 1 space
    if (!(args1.length > 1)) {
        message.react('❌')
        sendMessageToChannel('Vui lòng nhập từ có chứa nhiều hơn 2 tiếng!', configChannel)
        return
    }

    if (words.length > 0) {
        const lastWord = words[words.length - 1]
        const args2 = lastWord.split(/\s+/).filter(Boolean)
        if (!(args1[0] === args2[args2.length - 1])) {
            message.react('❌')
            sendMessageToChannel('Từ này không bắt đầu với tiếng `' + args2[args2.length - 1] + '`', configChannel)
            return
        }
    }

    if (checkIfWordUsed(tu)) {
        message.react('❌')
        sendMessageToChannel('Từ này đã được sử dụng!', configChannel)
        return
    }

    if(!checkDict(tu)) {
        // check in dictionary
        message.react('❌')
        //sendMessageToChannel('Từ này không có trong từ điển tiếng Việt!', configChannel)
        return
    }


    words.push(tu)
    wordDataChannel[configChannel].words = words
    wordDataChannel[configChannel].currentPlayer.id = message.author.id
    wordDataChannel[configChannel].currentPlayer.name = message.author.displayName

    fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))

    message.react('✅')

    console.log(`[${configChannel}] - #${words.length} - ${tu}`)

    if(!checkIfHaveAnswerInDb(tu)) {
        sendMessageToChannel(`${message.author.displayName} đã chiến thắng sau ${words.length} lượt! Lượt mới đã bắt đầu!`, configChannel)
        initWordData(configChannel)
        startGame(configChannel)
        return
    }

    fs.writeFileSync(queryPath, queryCount.toString())
    return
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

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channel) {
        console.log(`[${moment().tz('Asia/Ho_Chi_Minh').format()}] [${newState.guild.name}] [${newState.channel.name}] ${newState.member.user.username} connected`)
        fs.appendFileSync(voiceLogPath, `[${moment().tz('Asia/Ho_Chi_Minh').format()}] [${newState.guild.name}] [${newState.channel.name}] ${newState.member.user.username} connected\n`)
    } else if (oldState.channel) {
        console.log(`[${moment().tz('Asia/Ho_Chi_Minh').format()}] [${oldState.guild.name}] [${oldState.channel.name}] ${oldState.member.user.username} disconnected`)
        fs.appendFileSync(voiceLogPath, `[${moment().tz('Asia/Ho_Chi_Minh').format()}] [${oldState.guild.name}] [${oldState.channel.name}] ${oldState.member.user.username} díconnected\n`)
    }
})

// The token of your robot to be inserted
client.login(process.env.BOT_TOKEN)
