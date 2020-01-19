const config = require('config');
const express = require('express')();
const server = require('http').createServer(express);
const socket = require('socket.io')(server);
const bodyParser = require('body-parser');
const port = config.get('cidget').server.port;

express.use(bodyParser.urlencoded({ extended: false }));
express.use(bodyParser.json());
server.listen(port, () => console.log(`listening on port ${port}.`));
socket.on('connection', () => console.log('socket connected.'));

express.post('/', (req, res) => {
    socket.emit('data', req.body);
    res.sendStatus(200);
});
