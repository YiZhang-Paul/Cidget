import socketClient from 'socket.io-client';

import { logger } from './core/service/io/logger/logger';

const socket = socketClient('http://localhost:8888');
socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));
socket.on('data', logger.log);
