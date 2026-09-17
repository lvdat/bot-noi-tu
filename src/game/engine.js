import prisma from '../database/prisma.js'
import { checkWord, hasAnswer, getRandomWord } from './dictionary.js'
import { normalizeWord, isValidFormat, isCorrectChain } from './validator.js'
import { sendMessageToChannel, sendAutoDeleteMessage } from '../utils/message.js'

/**
 * Ensures a Guild record exists in the database.
 * @param {string} guildId - Discord guild ID
 */
export async function ensureGuild(guildId) {
  await prisma.guild.upsert({
    where: { id: guildId },
    update: {},
    create: { id: guildId }
  })
}

/**
 * Gets the configured word-chain channel for a guild.
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<string|null>} Channel ID or null
 */
export async function getConfiguredChannel(guildId) {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { channelId: true }
  })
  return guild?.channelId ?? null
}

/**
 * Sets the word-chain channel for a guild.
 * @param {string} guildId - Discord guild ID
 * @param {string} channelId - Channel ID to set
 */
export async function setChannel(guildId, channelId) {
  await prisma.guild.upsert({
    where: { id: guildId },
    update: { channelId },
    create: { id: guildId, channelId }
  })
}

/**
 * Gets the currently running game session for a channel.
 * @param {string} channelId - Channel ID
 * @returns {Promise<object|null>} Game session or null
 */
async function getRunningSession(channelId) {
  return await prisma.gameSession.findFirst({
    where: { channelId, isRunning: true },
    include: { words: { orderBy: { playedAt: 'asc' } } }
  })
}

/**
 * Starts a new game round in the given channel.
 * @param {import('discord.js').Client} client - Discord client
 * @param {string} guildId - Guild ID
 * @param {string} channelId - Channel ID
 */
export async function startGame(client, guildId, channelId) {
  // End any existing running session
  await prisma.gameSession.updateMany({
    where: { channelId, isRunning: true },
    data: { isRunning: false }
  })

  const startWord = getRandomWord()
  if (!startWord) {
    sendMessageToChannel(client, channelId, 'Không thể tìm từ bắt đầu. Vui lòng thử lại!')
    return
  }

  // Create new session with starting word
  await prisma.gameSession.create({
    data: {
      guildId,
      channelId,
      isRunning: true,
      words: {
        create: { word: startWord }
      }
    }
  })

  sendMessageToChannel(client, channelId, `Từ bắt đầu: **${startWord}**`)
}

/**
 * Stops the current game in a channel.
 * @param {string} channelId - Channel ID
 */
export async function stopGame(channelId) {
  await prisma.gameSession.updateMany({
    where: { channelId, isRunning: true },
    data: { isRunning: false }
  })
}

/**
 * Ensures a player record exists for the given user in the given guild.
 * Updates name and avatar if they changed.
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} name - Display name
 * @param {string|null} avatar - Avatar URL
 */
async function ensurePlayer(guildId, userId, name, avatar) {
  await prisma.player.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: { name, avatar },
    create: { guildId, userId, name, avatar }
  })
}

/**
 * Updates ranking stats for a player.
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {object} stats - Stats to add
 * @param {number} [stats.wins=0] - Wins to add
 * @param {number} [stats.correct=0] - Correct answers to add
 * @param {number} [stats.total=0] - Total attempts to add
 */
async function updatePlayerStats(guildId, userId, { wins = 0, correct = 0, total = 0 }) {
  await prisma.player.update({
    where: { guildId_userId: { guildId, userId } },
    data: {
      wins: { increment: wins },
      correctWords: { increment: correct },
      totalAttempts: { increment: total }
    }
  })
}

/**
 * Increments bot global stats.
 * @param {object} stats - Stats to increment
 * @param {number} [stats.wordsPlayed=0]
 * @param {number} [stats.roundsPlayed=0]
 * @param {number} [stats.queries=0]
 */
export async function incrementStats({ wordsPlayed = 0, roundsPlayed = 0, queries = 0 }) {
  await prisma.botStats.upsert({
    where: { id: 'global' },
    update: {
      wordsPlayed: { increment: wordsPlayed },
      roundsPlayed: { increment: roundsPlayed },
      totalQueries: { increment: queries }
    },
    create: {
      id: 'global',
      wordsPlayed,
      roundsPlayed,
      totalQueries: queries
    }
  })
}

/**
 * Main game logic: processes a player's word submission.
 * This is the core handler called from messageCreate event.
 * @param {import('discord.js').Message} message - Discord message
 * @param {import('discord.js').Client} client - Discord client
 */
export async function processWord(message, client) {
  const guildId = message.guild.id
  const channelId = message.channel.id

  // Normalize the input word
  const word = normalizeWord(message.content)

  // Check if word has exactly 2 syllables
  if (!isValidFormat(word)) {
    return // Silently ignore non-2-syllable messages
  }

  // Get current running session
  const session = await getRunningSession(channelId)
  if (!session) return

  // Ensure player exists
  await ensurePlayer(guildId, message.author.id, message.author.displayName, message.author.avatarURL())

  // Check if same player is trying to answer twice in a row
  if (session.words.length > 0 && session.currentPlayerId === message.author.id) {
    await message.react('❌')
    sendAutoDeleteMessage(client, channelId, 'Bạn đã trả lời lượt trước rồi, hãy đợi đối thủ!')
    return
  }

  // Check if word chains correctly from the last word
  if (session.words.length > 0) {
    const lastWord = session.words[session.words.length - 1].word
    if (!isCorrectChain(word, lastWord)) {
      const lastParts = lastWord.split(' ')
      await message.react('❌')
      sendAutoDeleteMessage(client, channelId, 'Từ này không bắt đầu với tiếng `' + lastParts[lastParts.length - 1] + '`')
      return
    }
  }

  // Check if word has already been used in this session
  const usedWords = new Set(session.words.map(w => w.word))
  if (usedWords.has(word)) {
    await message.react('❌')
    sendAutoDeleteMessage(client, channelId, 'Từ này đã được sử dụng!')
    return
  }

  // Check if word exists in dictionary
  if (!checkWord(word)) {
    await message.react('❌')
    await updatePlayerStats(guildId, message.author.id, { total: 1 })
    return
  }

  // Word is valid! Add it to the session
  await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      currentPlayerId: message.author.id,
      currentPlayerName: message.author.displayName,
      words: {
        create: { word }
      }
    }
  })

  await message.react('✅')
  await updatePlayerStats(guildId, message.author.id, { correct: 1, total: 1 })
  await incrementStats({ wordsPlayed: 1, queries: 1 })

  const wordCount = session.words.length // words before this one (not counting start word)

  console.log(`[${message.guild.name}][${message.channel.name}][#${wordCount + 1}] ${word}`)

  // Check if the opponent can still answer
  usedWords.add(word)
  if (!hasAnswer(word, usedWords)) {
    sendMessageToChannel(client, channelId, `${message.author.displayName} đã chiến thắng sau ${wordCount} lượt! Lượt mới đã bắt đầu!`)
    await updatePlayerStats(guildId, message.author.id, { wins: 1 })
    await incrementStats({ roundsPlayed: 1 })
    await stopGame(channelId)
    await startGame(client, guildId, channelId)
  }
}
