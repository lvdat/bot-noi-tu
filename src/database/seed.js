import axios from 'axios'
import prisma from './prisma.js'
import { WORD_DATA_URL, CONTRIBUTE_WORDS_URL } from '../config.js'

/**
 * Downloads words from a URL and returns a cleaned array.
 * @param {string} url - The URL to download from
 * @param {boolean} isJsonl - If true, parse each line as JSON and extract .text
 * @returns {Promise<string[]>}
 */
async function downloadWords(url, isJsonl = false) {
  console.log(`[SEED] Downloading words from ${url}...`)
  const res = await axios.get(url)
  const lines = res.data.trim().split('\n')

  if (isJsonl) {
    return lines.map(line => JSON.parse(line).text)
  }
  return lines.map(line => line.trim().toLowerCase())
}

/**
 * Normalizes a word list: keeps only 2-syllable words without special characters.
 * @param {string[]} words - Raw word list
 * @returns {string[]}
 */
function normalizeWords(words) {
  return words
    .map(w => w.toLowerCase().trim())
    .filter(w => {
      const parts = w.split(' ')
      return parts.length === 2 && !w.includes('-') && !w.includes('(') && !w.includes(')')
    })
}

/**
 * Seeds the DictionaryWord table with words from the main dictionary
 * and community contributions.
 */
async function seed() {
  console.log('[SEED] Starting dictionary seed...')

  // Download main dictionary
  const mainWords = await downloadWords(WORD_DATA_URL, true)
  console.log(`[SEED] Downloaded ${mainWords.length} words from main dictionary.`)

  // Download contribute words
  let contributeWords = []
  try {
    contributeWords = await downloadWords(CONTRIBUTE_WORDS_URL)
    console.log(`[SEED] Downloaded ${contributeWords.length} contribute words.`)
  } catch (err) {
    console.log(`[SEED] Warning: Could not download contribute words: ${err.message}`)
  }

  // Combine and normalize
  const allWords = normalizeWords([...mainWords, ...contributeWords])
  const uniqueWords = [...new Set(allWords)]
  console.log(`[SEED] ${uniqueWords.length} unique words after normalization.`)

  // Clear existing dictionary
  await prisma.dictionaryWord.deleteMany()
  console.log('[SEED] Cleared existing dictionary data.')

  // Batch insert with upsert for safety
  const batchSize = 500
  let inserted = 0

  for (let i = 0; i < uniqueWords.length; i += batchSize) {
    const batch = uniqueWords.slice(i, i + batchSize)
    const data = batch.map(word => {
      const parts = word.split(' ')
      return {
        word,
        firstSyllable: parts[0],
        lastSyllable: parts[parts.length - 1],
        isReported: false
      }
    })

    await prisma.dictionaryWord.createMany({
      data,
      skipDuplicates: true
    })

    inserted += batch.length
    if (inserted % 5000 === 0 || inserted === uniqueWords.length) {
      console.log(`[SEED] Progress: ${inserted}/${uniqueWords.length} words inserted.`)
    }
  }

  // Initialize BotStats if not exists
  await prisma.botStats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      totalQueries: 0,
      wordsPlayed: 0,
      roundsPlayed: 0
    }
  })

  console.log('[SEED] Dictionary seed completed!')
  console.log(`[SEED] Total words in database: ${await prisma.dictionaryWord.count()}`)
}

// Run seed if called directly
seed()
  .catch(err => {
    console.error('[SEED] Error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
