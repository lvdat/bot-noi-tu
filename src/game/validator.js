/**
 * Normalizes a raw input word: trim, lowercase, collapse multiple spaces.
 * @param {string} input - Raw user input
 * @returns {string} Normalized word
 */
export function normalizeWord(input) {
  return input.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ')
}

/**
 * Checks if the word has exactly 2 syllables (valid Vietnamese compound word).
 * @param {string} word - Normalized word
 * @returns {boolean}
 */
export function isValidFormat(word) {
  return word.split(' ').length === 2
}

/**
 * Checks if the new word correctly chains from the last word.
 * The first syllable of the new word must match the last syllable of the previous word.
 * @param {string} newWord - The new word being played
 * @param {string} lastWord - The last word in the chain
 * @returns {boolean}
 */
export function isCorrectChain(newWord, lastWord) {
  const newParts = newWord.split(' ')
  const lastParts = lastWord.split(' ')
  return newParts[0] === lastParts[lastParts.length - 1]
}
