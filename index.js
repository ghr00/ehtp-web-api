/* eslint-disable prettier/prettier */
const express = require('express');

require('dotenv').config();

const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

const http = require('http').createServer(app);

const io            = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
//const socketioJwt   = require('socketio-jwt');

var cors = require('cors')

/*
io.use(socketioJwt.authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));
*/

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send(
    'API de test pour le module Web 2.0 (EHTP) par Amine Yahemdi, bievenue!'
  );
});

const processData = (data, res) => {
  const { token, text, platform } = data;
  if(res)
    console.log('HTTP');
  else
    console.log('Socket');
  console.log('Data token : ' + token);
  console.log('Data message : ' + text);
  console.log('Data platform : ' + platform);

  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    console.log('Data username:' + decoded.username) // bar

    const message = `${decoded.username  }(${platform}): ${  text}`;
    io.sockets.emit('broadcast', { message });

    if(res)
      res.status(200).send('Message envoyé.');
  });
}

io.sockets.on('connection', function (socket) {
  console.log('Connected')
  socket.on('message', function(data) {
    processData(data, null);
  });
});

app.get('/message', (req, res) => {
  processData(req.query, res)
})

app.get('/login', (req, res) => {
  const {username} = req.query;

  if(username) {
    jwt.sign({ username }, process.env.JWT_SECRET, { algorithm: 'HS256' }, function(err, token) {
      if(token)
      {
        console.log(`Utilisateur ${username} authentifié avec le token: ${token}`);

        res.status(200).json({ token });

      }
      else
        console.log(`Login, erreur: ${JSON.stringify(err)}`);
    });
  }

  else {
    res.status(400).send("Erreur: nom d'utilisateur invalide.");
  }
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
