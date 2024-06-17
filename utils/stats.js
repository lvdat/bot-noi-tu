const fs = require('fs')
const path = require('path')

const queryPath = path.resolve(__dirname, './data/query.txt')
const wordPlayedPath = path.resolve(__dirname, './data/word-played.txt')
const roundPlayedPath = path.resolve(__dirname, './data/round-played.txt')

/**
 @returns {Number} query number total of Bot
 */
const getQuery = () => {
    return parseInt(fs.readFileSync(queryPath, 'utf-8'))
}

/**
 * 
 * @param {Number} query 
 */
const addQuery = (query = 1) => {
    let queryCount = getQuery()
    queryCount += query
    fs.writeFileSync(queryPath, queryCount.toString())
}

/**
 @returns {Number} word played count
 */
const getWordPlayedCount = () => {
    return parseInt(fs.readFileSync(wordPlayedPath, 'utf-8'))
}

/**
 * add word played count.
 */
const addWordPlayedCount = () => {
    let wordPlayedCount = getWordPlayedCount()
    wordPlayedCount++
    fs.writeFileSync(wordPlayedPath, wordPlayedCount.toString())
}

/**
 @returns {Number} word played count
 */
 const getRoundPlayedCount = () => {
    return parseInt(fs.readFileSync(roundPlayedPath, 'utf-8'))
}

/**
 * add word played count.
 */
const addRoundPlayedCount = () => {
    let roundPlayedCount = getRoundPlayedCount()
    roundPlayedCount++
    fs.writeFileSync(roundPlayedPath, roundPlayedCount.toString())
}

module.exports = {
    getQuery,
    addQuery,
    getWordPlayedCount,
    addWordPlayedCount,
    getRoundPlayedCount,
    addRoundPlayedCount
}