const fs = require('fs')
const path = require('path')

const officalWordsPath = path.resolve(__dirname, '../data/official-words.txt')
let dic = []

try {
    const dicRead = fs.readFileSync(officalWordsPath, 'utf-8')
    dic = dicRead.toLowerCase().split('\n')
} catch (err) {
    console.error(`Error reading file ${officalWordsPath}:`, err)
}

/**
 * 
 * @param {String} word 
 * @returns {Boolean} return true if word included in dictionary
 */
const checkWordIfInDictionary = (word) => {
    return dic.includes(word)
}

/**
 * 
 * @returns length of dictionary array
 */
const countWordInDictionary = () => {
    return dic.length
}

module.exports = {
    checkWordIfInDictionary,
    countWordInDictionary
}