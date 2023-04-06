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
const authHost = process.env.AUTHHOST || 'http://127.0.0.1:3004/api/docs/';
// DB params
const dbHost = process.env.DBHOST || 'mongodb://localhost:27019/colablexical';
const dbcollection = 'documents';
const mdb = new MongodbPersistence(dbHost, {
  collectionName: dbcollection,
  flushSize: 100,
  multipleCollections: false,
});

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

setPersistence({
  provider: mdb,
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    if (!persistedYdoc) logger.debug(`No persisted doc found for ${docName}`);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    ydoc.on('update', async update => {
      mdb.storeUpdate(docName, update);
      logger.debug(`PERSISTENCE: ${docName}`);
    });
  },
  writeState: async (docName, ydoc) => {},
});

// kind: 'DeliverableOfCardContent' | 'PartOfResource';

const authorizeRequest = async (request: http.IncomingMessage): Promise<boolean> => {
  const params = getQueryParams(request.url!);
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

    logger.debug(url);
    try {
      const authRes = await fetch(url, {
        method: 'GET',
        headers: {
          Cookie: cookie,
        },
      });
      return authRes.status < 400;
    } catch (err) {
      logger.error(err);
      logger.error('[auth]: Authorisation error');
      return false;
    }
  }
};

server.on('upgrade', async (request, socket, head) => {
  if (await authorizeRequest(request)) {
    const handleAuth = async (ws: WebSocket) => {
      logger.debug('[auth]: Authorisation approved');
      logger.debug(`Current connections: ${wss.clients.size}`);
      wss.emit('connection', ws, request);
      logger.debug(`CONNOPENED: ${request.url}`);
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
  logger.info(`Websocks running at '${host}' on port ${port}`);
});
