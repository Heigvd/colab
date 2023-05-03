import dotenv from 'dotenv';
import http from 'http';
import fetch from 'node-fetch';
import WebSocket, { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { MongodbPersistence } from './mongo/y-mongodb.js';
import { setPersistence, setupWSConnection } from './server/utils.js';
import logger from './utils/logger.js';
import { getQueryParams, onSocketError } from './utils/utils.js';

dotenv.config();

// Server params
const host = 'localhost';
const port = process.env.PORT || 4321;
// Backend params
const authHost = process.env.AUTHHOST || 'http://127.0.0.1:3004/';
// DB params
const dbHost = process.env.DBHOST || 'mongodb://localhost:27019/colablexical';
const dbcollection = 'documents';
const mdb = new MongodbPersistence(dbHost, {
  collectionName: dbcollection,
  flushSize: 100,
  multipleCollections: false,
});

const server = http.createServer(async (req, res) => {
  req.on('error', err => {
    console.error(err);
    res.statusCode = 400;
    res.end('400: Bad Request');
  });

  if (req.url === '/healthz' && req.method === 'GET') {
    let authHealthz, dbHealthz;
    try {
      logger.info(`[server]: Healthz check with ${authHost}`);
      const authRes = await fetch(authHost, { method: 'GET' });
      authHealthz = authRes.status < 400;

      // Replace mongodb protocol with http
      const dbHostHttp = dbHost.replace('mongodb', 'http');
      logger.info(`[server]: Healthz check with ${dbHostHttp}`);
      const dbRes = await fetch(dbHostHttp, { method: 'GET' });
      dbHealthz = dbRes.status < 400;
    } catch (err) {
      logger.error(`[server]: Healthz error ${err}`);
    }

    if (authHealthz && dbHealthz) {
      logger.info(`[server]: Websocks is healthy`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Alive');
      return;
    } else {
      logger.info(`[server]: Websocks is sick`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Dead');
      return;
    }
  }

  // Default route
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello Websocks!');
  res.end();
});
const wss = new WebSocketServer({ noServer: true });

setPersistence({
  provider: mdb,
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);

    const diff = Y.encodeStateAsUpdate(ydoc, persistedStateVector);

    if (diff.reduce((previousValue, currentValue) => previousValue + currentValue, 0) > 0)
      mdb.storeUpdate(docName, diff);

    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

    ydoc.on('update', async update => {
      mdb.storeUpdate(docName, update);
      logger.debug(`[ws]: Write on doc /${docName}`);
    });

    persistedYdoc.destroy();
  },
  writeState: async (docName, ydoc) => {
    await mdb.flushDocument(docName);
  },
});

const authorizeRequest = async (request: http.IncomingMessage): Promise<boolean> => {
  if (request.url == undefined) {
    logger.error('[auth]: Request undefined');
    return false;
  }
  const params = getQueryParams(request.url);
  const cookie = request.headers.cookie;

  if (cookie == undefined) {
    logger.error('[auth]: Cookie undefined');
    return false;
  } else if (params?.kind === undefined || params?.ownerId === undefined) {
    logger.error('[auth]: params undefined');
    return false;
  } else {
    const url =
      params.kind === 'DeliverableOfCardContent'
        ? `${authHost}api/cardContents/${params.ownerId}/assertReadWrite`
        : `${authHost}api/resources/${params.ownerId}/assertReadWrite`;

    try {
      const authRes = await fetch(url, {
        method: 'GET',
        headers: {
          Cookie: cookie,
        },
      });
      logger.info(`[auth]: Authorizing ${url}`);
      return authRes.status < 400;
    } catch (err) {
      logger.error(err);
      logger.error('[auth]: Authorization error');
      return false;
    }
  }
};

server.on('upgrade', async (request, socket, head) => {
  if (await authorizeRequest(request)) {
    const handleAuth = async (ws: WebSocket) => {
      logger.debug('[auth]: Authorization approved');
      logger.debug(`[server]: Total connections: ${wss.clients.size}`);
      wss.emit('connection', ws, request);
    };

    wss.handleUpgrade(request, socket, head, handleAuth);
  } else {
    logger.error('[auth]: Authorisation denied');
    socket.write('HTTP/1.1 401 Unauthorized\r\n');
    socket.end();
    socket.destroy();
    return;
  }
});

wss.on('connection', setupWSConnection);
wss.on('error', onSocketError);

server.listen(port, () => {
  logger.info(`[server]: Websocks running at '${host}' on port ${port}`);
});
