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
    fs.writeFileSync(queryPath, queryCount)
}

/**
 @returns {Number} word played count
 */
const getWordPlayedCount = () => {
    
}

/**
 * add word played count.
 */
const addWordPlayedCount = () => {

}

module.exports = {
    getQuery,
    addQuery,
    getWordPlayedCount,
    addWordPlayedCount,
}