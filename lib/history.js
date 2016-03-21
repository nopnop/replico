'use strict'
// Derived from nodejs internal repl history management https://github.com/nodejs/node/blob/master/lib%2Finternal%2Frepl.js
// See https://github.com/nodejs/node/blob/master/LICENSE

const fs = require('fs')
const os = require('os')

const kDebounceHistoryMS = 15

module.exports = function setupHistory (repl, historyPath, ready) {
  historyPath = historyPath.trim()

  var timer = null
  var writing = false
  var pending = false
  repl.pause()

  fs.open(historyPath, 'a+', oninit)

  function oninit (err, hnd) {
    if (err) {
      repl.resume()
      return ready(null, repl)
    }
    fs.close(hnd, onclose)
  }

  function onclose (err) {
    if (err) {
      return ready(err)
    }
    fs.readFile(historyPath, 'utf8', onread)
  }

  function onread (err, data) {
    if (err) {
      return ready(err)
    }
    if (data) {
      repl.history = data.split(/[\n\r]+/, repl.historySize)
    }
    fs.open(historyPath, 'w', onhandle)
  }

  function onhandle (err, hnd) {
    if (err) {
      return ready(err)
    }
    repl._historyHandle = hnd
    repl.on('line', online)

    // reading the file data out erases it
    repl.once('flushHistory', function () {
      repl.resume()
      ready(null, repl)
    })
    flushHistory()
  }

  // ------ history listeners ------
  function online () {
    repl._flushing = true

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(flushHistory, kDebounceHistoryMS)
  }

  function flushHistory () {
    timer = null
    if (writing) {
      pending = true
      return
    }
    writing = true
    const historyData = repl.history.join(os.EOL)
    fs.write(repl._historyHandle, historyData, 0, 'utf8', onwritten)
  }

  function onwritten (_, data) {
    writing = false
    if (pending) {
      pending = false
      online()
    } else {
      repl._flushing = Boolean(timer)
      if (!repl._flushing) {
        repl.emit('flushHistory')
      }
    }
  }
}
