const fs = require('fs')
const { Client, Collection, Intents, GatewayIntentBits } = require('discord.js')
const dictionary = require('@vntk/dictionary')
require('dotenv').config()
const client = new Client({
  // The intents will depend on what you want to do with the robot, 
  // but don't forget to activate them in your discord.dev dashboard
  // at the address https://discord.com/developers/applications/{ID}/bot, 
  // section "Privileged Gateway Intents"
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

//global config
const GAME_CHANNEL_ID = process.env.GAME_CHANNEL_ID
let isRunning = false
let words = []

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

const sendMessageToChannel = (mess) => {
    client.channels.cache.get(GAME_CHANNEL_ID).send(mess)
}

client.on('messageCreate', async message => {
    if (message.author.bot) return // detect if message from BOT.
    if (message.channel.id !== GAME_CHANNEL_ID) return // dectect only from game channel
    // console.log(message)

    if (message.content === '!start') {
        if (!isRunning) {
            sendMessageToChannel(`Trò chơi đã bắt đầu, ai đó hãy bắt đầu với một từ nào!`)
            isRunning = true
        } else sendMessageToChannel('Trò chơi vẫn đang tiếp tục. Bạn có thể dùng `!stop`')
        return
    } else if (message.content === '!stop') {
        if (isRunning) {
            sendMessageToChannel(`Đã kết thúc lượt này!`)
            isRunning = false
        } else sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`')
        return
    }

    if (!isRunning) {
        // check if game is running
        sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`')
        return
    }
    let tu = message.content.trim()
    let lastWord = words[words.length - 1]
    let args = tu.split(/ +/)

    // check if words have or more than 1 space
    if (!(args.length > 1)) {
        message.react('❌')
        sendMessageToChannel('Vui lòng nhập từ có chứa nhiều hơn 2 tiếng!')
        return
    }

    if(!dictionary.has(tu)) {
        // check in dictionary
        message.react('❌')
        sendMessageToChannel('Từ này không có trong từ điển tiếng Việt!')
        return
    }

    if(words.includes(tu)) {
        message.react('❌')
        sendMessageToChannel('Từ này đã được sử dụng trong lượt chơi rồi!')
    }

    message.react('✅')
    sendMessageToChannel(`Từ hiện tại: \`${tu.toLowerCase()}\``)
    words.push(tu)

    console.log(`args: ${args.length}`)

})

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