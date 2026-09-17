import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import prisma from './database/prisma.js'
import { loadDictionary } from './game/dictionary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// Load commands
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const commandModule = await import(`./commands/${file}`)
    const command = commandModule.default
    client.commands.set(command.data.name, command)
    console.log(`[OK] Loaded command: ${command.data.name}`)
}

// Load events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
    const eventModule = await import(`./events/${file}`)
    const event = eventModule.default
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else {
        client.on(event.name, (...args) => event.execute(...args, client))
    }
    console.log(`[OK] Loaded event: ${event.name}`)
}

// Initialize
async function main() {
    try {
        // Connect to database
        await prisma.$connect()
        console.log('[OK] Connected to database.')

        // Load dictionary into memory
        await loadDictionary()

        // Login to Discord
        await client.login(process.env.BOT_TOKEN)
    } catch (error) {
        console.error('[ERROR] Failed to start bot:', error)
        process.exit(1)
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[INFO] Shutting down...')
    await prisma.$disconnect()
    client.destroy()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('\n[INFO] Shutting down...')
    await prisma.$disconnect()
    client.destroy()
    process.exit(0)
})

main()
