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

express.post('/azure-devops/build', (req, res) => {
    socket.emit('azure-devops-build', req.body);
    res.sendStatus(200);
});

express.post('/github/push', (req, res) => {
    socket.emit('github-push', req.body);
    res.sendStatus(200);
});

express.post('/github/pull_request', (req, res) => {
    socket.emit('github-pull-request', req.body);
    res.sendStatus(200);
});
