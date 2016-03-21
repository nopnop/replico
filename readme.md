# replico [![Build Status](https://secure.travis-ci.org/nopnop/replico.png?branch=master)](http://travis-ci.org/nopnop/replico) [![NPM version](https://badge-me.herokuapp.com/api/npm/replico.png)](http://badges.enytc.com/for/npm/replico)

A REPL with bluebird co wrapper

- Track Promise results
- Support for `yield` keyword (expl: `user = yield db.User.get('foobar')` will populate user variable once promise is resolved)


## Installation

```sh
# For the command line "replico"
npm install --global replico

# And/or to use replico api in a project
npm install --save replico
```


## Command line usage

```sh
replico
```

## Api usage

#### Basic replacement of repl (see https://nodejs.org/dist/latest-v5.x/docs/api/repl.html#repl_class_replserver)
```javascript
var replico = require('replico')

let replServer = replico({
  prompt: `${CBLUE}\u2234 ${CRESET}`,
  terminal: true
})
```

#### Define your own eval

```javascript
var replico = require('replico')

let replServer = replico({
  prompt: `MyRepl> `,
  terminal: true
})

replServer.eval = function (cmd, context, filename, callback) {
  if (cmd === 'foo') {
    // ... your own implementation
    return callback(null, 'bar')
  } else if (/yield/.test(cmd)) {
    // Or use replico's eval (with bluebird-co):
    return replico.coEval.call(this, cmd, context, filename, callback)
  } else {
    // If you need it, superEval is a reference to the default repl eval
    return this.superEval(cmd, context, filename, callback)
  }
}
```


#### Plug it in your project

```javascript
'use strict'
const net = require('net')
const replico = require('replico')

const CRESET = '\x1b[0m'
const CBLUE = '\x1b[34m'

var history = ['console.log("ok")']

net.createServer((socket) => {
  socket.write(`${CBLUE}Welcome${CRESET}\n`)

  function extendContext (context) {
    context.actions = {
      hello (who) {
        socket.write('OK ' + who + '\n')
      }
    }
  }

  let replServer = replico({
    prompt: `${CBLUE}\u2234 ${CRESET}`,
    input: socket,
    output: socket,
    terminal: true,
    history: history
  })

  replServer.on('exit', () => {
    history = replServer.history.slice()
    socket.end()
  })

  replServer.on('reset', extendContext)

  replServer.defineCommand('chist', {
    help: 'Clear history',
    action: function () {
      history = []
      replServer.history = []
      this.displayPrompt()
    }
  })

  extendContext(replServer.context)
}).listen(5423, function () {
  console.log('Ready on 5423')
})

```

Then you can use [netcat](https://en.wikipedia.org/wiki/Netcat) or [repli](https://www.npmjs.com/package/repli):

```sh
nc localhost 5423
# Or repli
repli localhost 5423
```



---

[The MIT License](./LICENSE) • By [Novadiscovery](http://www.novadiscovery.com/)
