const config = require('config');
const express = require('express')();
const server = require('http').createServer(express);
const socket = require('socket.io')(server);
const bodyParser = require('body-parser');
const { port } = config.get('cidget').server;

express.use(bodyParser.urlencoded({ extended: false }));
express.use(bodyParser.json());
server.listen(port, () => console.log(`listening on port ${port}.`));
socket.on('connection', () => console.log('socket connected.'));

express.get('/', (_, res) => {
    res.send('cidget server v0.1.0');
});

express.post('/azure-devops/build', (req, res) => {
    emit('azure-devops-build', req, res);
});

express.post('/azure-devops/release', (req, res) => {
    emit('azure-devops-release', req, res);
});

express.post('/github/push', (req, res) => {
    emit('github-push', req, res);
});

express.post('/github/pull_request', (req, res) => {
    emit('github-pull-request', req, res);
});

function emit(event, req, res) {
    socket.emit(event, req.body);
    res.sendStatus(200);
}
