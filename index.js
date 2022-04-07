// Place your server entry point code here
// Serve static HTML files
app.use(express.static('./public'));
const express = require('express');
// Make Express use its own built-in body parser to handle JSON
app.use(express.json());
const app = express();
const morgan = require('morgan')
var fs = require('fs')
const db = require("./src/services/database.js")
var md5 = require("md5");
const { aggregate } = require('./src/services/database.js');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var args = require("minimist")(process.argv.slice(2), {
    boolean: ['debug'],           
    boolean: ['help'], 
    boolean: ['log'],
    int: ['port']
  })
  const port = args.port || process.env.PORT || 5555;
  const debug = ((args.debug === true) && (args.debug != null))|| process.env.PORT || false;
  const logger = !(((args.log === false) && (args.log != null))|| process.env.PORT || false);
  const help = args.help;
  console.log(debug)
  console.log(logger)
if (help == true) {
    console.log("server.js [options]")
    console.log("  --port	Set the port number for the server to listen on. Must be an integerbetween 1 and 65535.");
    console.log('  --debug	If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message "Error test successful." Defaults to `false`.')
    console.log('  --log		If set to false, no log files are written. Defaults to true. Logs are always written to database.')
    console.log('  --help	Return this message and exit.')
    process.exit(1)
}
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now().toString(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url,  protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr.toString(), logdata.remoteuser, logdata.time, logdata.method.toString(), logdata.url.toString(), logdata.protocol.toString(), logdata.httpversion.toString(), logdata.secure.toString(), logdata.status.toString(), logdata.referer, logdata.useragent.toString())
    next()
})
if (logger == true) {
  const WRITESTREAM = fs.createWriteStream('./data/log/access.log', { flags: 'a' })
      app.use(morgan('combined', { stream: WRITESTREAM }))
}

app.get('/app/', (req, res) => {
  res.statusCode = 200;
  res.statusMessage = 'OK';
  res.status(200);
  res.type('text/plain')
  res.send(res.statusCode + ' ' + res.statusMessage);
});

function coinFlip() {
    return Math.random() < 0.6 ? ("heads") : ("tails")
}

function countFlipsT(array) {
    let num_h = 0;
    let num_t = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        num_h += 1;
      }
      else {
        num_t += 1;
      }
    }
    return num_t
}

function countFlipsH(array) {
  let num_h = 0;
  let num_t = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] == "heads") {
      num_h += 1;
    }
    else {
      num_t += 1;
    }
  }
  return num_h
}

app.get('/app/log/access', (req, res) => {
    if (debug == true) {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
                } catch {
            console.error(e)
            }
        }
        else {
            res.status(404).type("text/plain").send('404 NOT FOUND')
        }
})

    app.get('/app/error', (req, res) => {
        if (debug == true) {
            throw new Error("Error test successful.")
        }
        else {
            res.status(404).type("text/plain").send('404 NOT FOUND')
        }
    })

app.get('/app/flip/call/heads', (req, res) => {
    let call = coinFlip();
    let ret="";
    if (call == "heads") {
      ret = "win";
    }
    else {
      ret = "lose";
    }
    res.status(200);
    res.type("application/json")
    res.json({'call':'heads','flip':call,'result':ret});
});

app.get('/app/flip/call/tails', (req, res) => {
  let call = coinFlip();
  let ret="";
  if (call == "tails") {
    ret = "win";
  }
  else {
    ret = "lose";
  }
  res.status(200);
  res.type("application/json")
  res.json({'call':'tails','flip':call,'result':ret});
});

app.get('/app/flip/', (req, res) => {
    ret = coinFlip();
    res.status(200);
    res.type("application/json")
    res.json({'flip':ret});
});

app.get('/app/flips/:number', (req, res) => {
  const ret = [];
  for (let i = 0; i < req.params.number; i++) {
    ret[i] = coinFlip();
  }
  const num_t = countFlipsT(ret);
  const num_h = countFlipsH(ret);
  res.status(200);
  res.type("application/json")
  if (num_t == 0) {
    res.json({'raw': ret, 'summary': {'heads':num_h}});
  }
  else if (num_h == 0) {
    res.json({'raw': ret, 'summary': {'tails':num_t}});
  }
  else {
  res.json({'raw': ret, 'summary': {'tails':num_t, 'heads':num_h}});
  }
});

app.use(function(req, res){
    res.status(404).type("text/plain").send('404 NOT FOUND')
});