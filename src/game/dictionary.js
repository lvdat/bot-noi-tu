import prisma from '../database/prisma.js'
import { MAX_RANDOM_WORD_ATTEMPTS } from '../config.js'

/**
 * In-memory dictionary index for fast word lookup.
 * Maps firstSyllable -> Set of words starting with that syllable.
 * @type {Map<string, Set<string>>}
 */
let wordIndex = new Map()

/**
 * Set of all valid words for O(1) existence check.
 * @type {Set<string>}
 */
let wordSet = new Set()

/**
 * Loads the dictionary from the database into memory.
 * Builds a Map index for O(1) lookup by first syllable.
 * Should be called once at startup.
 */
export async function loadDictionary() {
  console.log('[DICTIONARY] Loading dictionary from database...')

  const words = await prisma.dictionaryWord.findMany({
    where: { isReported: false },
    select: { word: true, firstSyllable: true }
  })

  wordIndex = new Map()
  wordSet = new Set()

  for (const { word, firstSyllable } of words) {
    wordSet.add(word)

    if (!wordIndex.has(firstSyllable)) {
      wordIndex.set(firstSyllable, new Set())
    }
    wordIndex.get(firstSyllable).add(word)
  }

  console.log(`[DICTIONARY] Loaded ${wordSet.size} words into memory.`)
}

/**
 * Checks if a word exists in the dictionary.
 * @param {string} word - The word to check
 * @returns {boolean}
 */
export function checkWord(word) {
  return wordSet.has(word.toLowerCase())
}

/**
 * Checks if there is at least one word that can follow the given word.
 * Uses the Map index for O(1) lookup instead of linear scan.
 * @param {string} word - The current word
 * @param {Set<string>} [usedWords] - Optional set of already used words to exclude
 * @returns {boolean}
 */
export function hasAnswer(word, usedWords = new Set()) {
  const parts = word.split(' ')
  const lastSyllable = parts[parts.length - 1]
  const candidates = wordIndex.get(lastSyllable)

  if (!candidates) return false

  for (const candidate of candidates) {
    if (candidate !== word && !usedWords.has(candidate)) {
      return true
    }
  }
  return false
}

/**
 * Gets a random word that has at least one valid follow-up answer.
 * Uses a loop with max attempts instead of recursion to prevent stack overflow.
 * @returns {string|null} A random word, or null if no valid word found
 */
export function getRandomWord() {
  const allWords = Array.from(wordSet)

  for (let attempt = 0; attempt < MAX_RANDOM_WORD_ATTEMPTS; attempt++) {
    const randomIdx = Math.floor(Math.random() * allWords.length)
    const word = allWords[randomIdx]

    if (hasAnswer(word)) {
      return word
    }
  }

  // Fallback: if random selection failed, find any word with an answer
  for (const word of allWords) {
    if (hasAnswer(word)) {
      return word
    }
  }

  return null
}

/**
 * Reports a word (adds it to the blacklist).
 * Removes it from the in-memory index and marks it in the database.
 * @param {string} word - The word to report
 * @returns {Promise<boolean>} True if word was found and reported
 */
export async function reportWord(word) {
  const normalizedWord = word.toLowerCase()

  const updated = await prisma.dictionaryWord.updateMany({
    where: { word: normalizedWord },
    data: { isReported: true }
  })

  if (updated.count > 0) {
    // Remove from in-memory index
    wordSet.delete(normalizedWord)
    const parts = normalizedWord.split(' ')
    const firstSyllable = parts[0]
    const syllableSet = wordIndex.get(firstSyllable)
    if (syllableSet) {
      syllableSet.delete(normalizedWord)
    }
    return true
  }
  return false
}

/**
 * Checks if a word is in the report/blacklist.
 * @param {string} word - The word to check
 * @returns {Promise<boolean>}
 */
export async function isWordReported(word) {
  const result = await prisma.dictionaryWord.findFirst({
    where: { word: word.toLowerCase(), isReported: true }
  })
  return result !== null
}

/**
 * Returns the count of active (non-reported) words in the dictionary.
 * @returns {Promise<number>}
 */
export async function countWords() {
  return await prisma.dictionaryWord.count({
    where: { isReported: false }
  })
}
