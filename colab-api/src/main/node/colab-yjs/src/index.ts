/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { MongodbPersistence } from './mongo/y-mongodb.js';
import { setPersistence, setupWSConnection } from './server/utils.js';
import logger from './utils/logger.js';
import { authorizeWithPayara, getDocName, onSocketError } from './utils/utils.js';

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  logger.level = 'debug';
}

// Server params
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 4321;
// Payara params
const payaraHost = process.env.AUTHHOST || 'http://127.0.0.1:3004/';
// Mongo params
const mongoHost = process.env.DBHOST || 'mongodb://localhost:27019/colablexical';
const mongoCollection = 'documents';

const mongoHostHttp = mongoHost.replace('mongodb', 'http');

// MongoDriver
const mongoDriver = new MongodbPersistence(mongoHost, {
  collectionName: mongoCollection,
  flushSize: 100,
  multipleCollections: false,
});

setPersistence({
  provider: mongoDriver,
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mongoDriver.getYDoc(docName);
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);
    const diff = Y.encodeStateAsUpdate(ydoc, persistedStateVector);

    if (diff.reduce((previousValue, currentValue) => previousValue + currentValue, 0) > 0)
      mongoDriver.storeUpdate(docName, diff);

    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

    ydoc.on('update', async update => {
      mongoDriver.storeUpdate(docName, update);
    });

    persistedYdoc.destroy();
  },
  writeState: async (docName, ydoc) => {
    await mongoDriver.flushDocument(docName);
  },
});

// Express
const app = express();
const httpServer = http.createServer(app);
httpServer.listen(port);

const wss = new WebSocketServer({ noServer: true });

// HTTP Routes
app.get('/', (request: Request, response: Response) => {
  logger.debug('[Server Request] /');
  response.send('Hello Websocks!');
});

app.get('/healthz', async (request: Request, response: Response) => {
  try {
    const payaraResponse = await fetch(payaraHost, {
      method: 'GET',
    });
    if (payaraResponse.status >= 400) throw new Error('Payara-Server Error');

    const mongoResponse = await fetch(mongoHostHttp, {
      method: 'GET',
    });
    if (mongoResponse.status >= 400) throw new Error('MongoDb Connection Error');

    response.status(200).send('Server is healthy');
  } catch (errorMessage) {
    logger.error(errorMessage);
  }
});

app.delete('/delete', async (request: Request, response: Response) => {
  try {
    const docName = getDocName(request.url);
    await mongoDriver.clearDocument(docName);

    response.status(200).send(`Document ${docName} deleted`);
  } catch (error) {
    logger.error(error);
  }
});

// WebSocket Service
httpServer.on('upgrade', async (request, socket, head) => {
  if (!(await authorizeWithPayara(request, payaraHost))) return;

  wss.handleUpgrade(request, socket, head, async (ws: WebSocket) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', setupWSConnection);
wss.on('error', onSocketError);
