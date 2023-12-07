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
import {
  authorizeWithPayara,
  getDocName,
  getDocNameFromUrl,
  getQueryParams,
  onSocketError,
} from './utils/utils.js';

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
      logger.debug('update on docName: ' + docName);
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
  } catch (err) {
    logger.error(err);
  }
});

app.delete('/delete', async (request: Request, response: Response) => {
  try {
    const docName = getDocNameFromUrl(request.url);
    await mongoDriver.clearDocument(docName);

    response.status(200).send(`Document ${docName} deleted`);
  } catch (err) {
    logger.error(err);
  }
});

app.post('/duplicate', async (request: Request, response: Response) => {
  // TODO check read access about originalDoc
  // TODO check read write access about newDoc
  // if (!(await authorizeWithPayara(request, payaraHost))) {
  //   response.status(403).send('Forbidden');
  // }

  try {
    const params = getQueryParams(request.url);
    const newDocName = getDocNameFromUrl(request.url);
    const originalDocName = getDocName(params.toDuplicateKind, params.toDuplicateId);

    logger.debug('duplicate ' + originalDocName + ' to ' + newDocName);

    const newDoc = await mongoDriver.getYDoc(newDocName);
    const persistedYdoc = await mongoDriver.getYDoc(originalDocName);
    const diff = Y.encodeStateAsUpdate(persistedYdoc);

    if (diff.reduce((previousValue, currentValue) => previousValue + currentValue, 0) > 0) {
      mongoDriver.storeUpdate(newDocName, diff);
    }

    persistedYdoc.destroy();
    newDoc.destroy();

    response.status(200).send('Duplicated');
  } catch (err) {
    logger.error(err);
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
