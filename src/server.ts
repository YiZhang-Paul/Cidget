import * as config from 'config';
import { Request, Response } from 'express';

import { logger } from './core/service/io/logger/logger';

const express = require('express');
const bodyParser = require('body-parser');
const port = config.get<any>('cidget').server.port;
const server = express();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.listen(port, () => logger.log(`listening on port ${port}.`));

server.post('/', (req: Request, res: Response) => {
    logger.log(req);
    res.sendStatus(200);
});
