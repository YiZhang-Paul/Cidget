const express = require('express')();
const server = require('http').createServer(express);
const socket = require('socket.io')(server);
const bodyParser = require('body-parser');

const port = 8888;
express.use(bodyParser.json({ limit: '50mb' }));
express.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
server.listen(port, () => console.log(`listening on port ${port}.`));
socket.on('connection', () => console.log('socket connected.'));

express.get('/', (_, res) => {
    res.send('cidget server v0.1.0');
});

express.post('/outlook/mail', (req, res) => {
    const { validationToken } = req.query;

    if (validationToken) {
        return res.status(200).send(validationToken);
    }
    emit('outlook-mail', req, res);
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

express.post('/github/pull_request/review', (req, res) => {
    emit('github-pull-request-review', req, res);
});

express.post('/github/pull_request/check', (req, res) => {
    emit('github-pull-request-check', req, res);
});

function emit(event, req, res) {
    socket.emit(event, req.body);
    res.sendStatus(200);
}
