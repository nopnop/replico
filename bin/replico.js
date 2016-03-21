#!/usr/bin/env node
'use strict'
const replico = require('../lib/replico')
const colors = require('../lib/colors.js')
const setupHistory = require('../lib/history')

const CRESET = colors.CRESET
const CBLUE = colors.CBLUE

const NODE_REPL_HISTORY = (process.env.NODE_REPL_HISTORY || '').trim()
const NODE_REPL_HISTORY_SIZE = Number(process.env.NODE_REPL_HISTORY_SIZE || '1000')

let replServer = replico({
  prompt: `${CBLUE}\u2234 ${CRESET}`,
  terminal: true,
  history: [],
  historySize: (!isNaN(NODE_REPL_HISTORY_SIZE) && NODE_REPL_HISTORY_SIZE > 0) ? NODE_REPL_HISTORY_SIZE : 1000
})

if (NODE_REPL_HISTORY) {
  setupHistory(replServer, NODE_REPL_HISTORY, function (err) {
    if (err) { throw err }
  })
}
