'use strict'
const Repl = require('repl')
const colors = require('./colors.js')
const bluebird = require('bluebird')

const CRESET = colors.CRESET
const CGREY = colors.CGREY
const CRED = colors.CRED
const CGREEN = colors.CGREEN
const CBLUE = colors.CBLUE

module.exports = replico

function replico (opt) {
  opt = opt || {}
  opt.prompt = opt.prompt || `${CBLUE}\u2234 ${CRESET}`
  let repl = Repl.start(opt || {})
  let _eval = repl.eval
  repl.superEval = function (cmd, context, filename, callback) {
    _eval.call(repl, cmd, context, filename, callback)
  }
  repl.eval = opt.eval || replico.coEval
  repl.silent = (typeof opt.silent === 'boolean') ? opt.silent : false
  if (opt.terminal) {
    let previousHistory = opt.history || []
    repl.history = previousHistory.slice(0, repl.historySize)
  }
  return repl
}

replico.coEval = function coEval (cmd, context, filename, callback) {
  let repl = this
  let promises = context._promises = context._promises || []

  function say (str) {
    if (!repl.silent) {
      repl.output.write(str)
    }
  }

  if (/\!\!$/.test(cmd.trim())) {
    cmd = cmd.trim().slice(0, -2) + repl.history[1]
    say(`${CGREY}${cmd}${CRESET}\n`)
  }

  if (cmd.match(/\W*await\s+/)) {
    cmd = ';(async function () {' + cmd + '})()'
  }

  repl.superEval(cmd, context, filename, function (err, res) {
    if (err || !res || typeof res.then !== 'function') {
      return callback(err, res)
    }
    let promiseId = promises.indexOf(res)
    if (!~promiseId) {
      promises.push(res)
      promiseId = promises.length - 1
    }

    say(`${CBLUE} ... await Promise#${promiseId} ->${CRESET} `)
    bluebird.resolve(res)
      .then((val) => {
        say(`${CGREEN}Resolved#${promiseId}${CRESET}\n`)
        callback(null, val)
      })
      .catch((error) => {
        say(`${CRED}Rejected#${promiseId}${CRESET}\n`)
        callback(error)
      })
  })
}
