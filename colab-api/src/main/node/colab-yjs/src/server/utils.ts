/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as Y from 'yjs';

import { decoding, encoding, map } from 'lib0';

import lodash from 'lodash';
const { debounce } = lodash;

import { getDocNameFromUrl } from '../utils/utils.js';
import { callbackHandler, isCallbackSet } from './callback.js';
import logger from '../utils/logger.js';

const CALLBACK_DEBOUNCE_WAIT = Number(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = Number(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000;

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0';
const persistenceDir = process.env.YPERSISTENCE;

interface Persistence {
  provider: any;
  bindState: (arg0: string, arg1: WSSharedDoc) => void;
  writeState: (arg0: string, arg1: WSSharedDoc) => Promise<any>;
}

let persistence: Persistence | null = null;
if (typeof persistenceDir === 'string') {
  // @ts-ignore
  const LeveldbPersistence = require('y-leveldb').LeveldbPersistence;
  const ldb = new LeveldbPersistence(persistenceDir);
  persistence = {
    provider: ldb,
    bindState: async (docName: string, ydoc: WSSharedDoc) => {
      const persistedYdoc = await ldb.getYDoc(docName);
      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      ldb.storeUpdate(docName, newUpdates);
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      ydoc.on('update', update => {
        ldb.storeUpdate(docName, update);
      });
    },
    writeState: async (docName: string, ydoc: WSSharedDoc) => {},
  };
}

export const setPersistence = (persistence_: Persistence) => {
  persistence = persistence_;
};

export const getPersistence = () => persistence;

export const docs: Map<string, WSSharedDoc> = new Map();
// exporting docs so that others can use it

const messageSync = 0;
const messageAwareness = 1;
// const messageAuth = 2

const updateHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeUpdate(encoder, update);
  const message = encoding.toUint8Array(encoder);
  doc.conns.forEach((_, conn) => send(doc, conn, message));
};

interface Changes {
  added: number[];
  updated: number[];
  removed: number[];
}

export class WSSharedDoc extends Y.Doc {
  name: string;
  conns: Map<Object, Set<number>>;
  awareness: awarenessProtocol.Awareness;

  constructor(name: string) {
    super({ gc: gcEnabled });
    this.name = name;

    this.conns = new Map<Object, Set<number>>();

    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);

    const awarenessChangeHandler = ({ added, updated, removed }: Changes, conn: Object | null) => {
      const changedClients = added.concat(updated, removed);
      if (conn !== null) {
        const connControlledIDs = this.conns.get(conn);
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => {
            connControlledIDs.add(clientID);
          });
          removed.forEach(clientID => {
            connControlledIDs.delete(clientID);
          });
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
      );
      const buff = encoding.toUint8Array(encoder);
      this.conns.forEach((_, c) => {
        send(this, c, buff);
      });
    };
    this.awareness.on('update', awarenessChangeHandler);
    this.on('update', updateHandler);
    if (isCallbackSet) {
      this.on(
        'update',
        debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
          maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
        }),
      );
    }
  }
}

// Gets a Y.Doc by name, whether in memory or on disk
export const getYDoc = (docname: string, gc = true) =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname);
    doc.gc = gc;
    if (persistence !== null) {
      persistence.bindState(docname, doc);
    }
    docs.set(docname, doc);
    return doc;
  });

const messageListener = (conn: any, doc: WSSharedDoc, message: Uint8Array) => {
  try {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

        // If the `encoder` only contains the type of reply message and no
        // message, there is no need to send the message. When `encoder` only
        // contains the type of reply, its length is 1.
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder));
        }
        break;
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn,
        );
        break;
      }
    }
  } catch (err) {
    console.error(err);
    doc.emit('error', [err]);
  }
};

const closeConn = (doc: WSSharedDoc, conn: any) => {
  if (doc.conns.has(conn)) {
    // @ts-ignore
    const controlledIds: Set<number> = doc.conns.get(conn);
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy();
      });
      docs.delete(doc.name);
    }
  }
  conn.close();
};

const send = (doc: WSSharedDoc, conn: any, m: Uint8Array) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn);
  }
  try {
    conn.send(m, (err: Error) => {
      err != null && closeConn(doc, conn);
    });
  } catch (e) {
    closeConn(doc, conn);
  }
};

const pingTimeout = 1000;

export const setupWSConnection = (
  conn: any,
  req: any,
  { docName = getDocNameFromUrl(req.url!), gc = true }: any = {},
) => {
  conn.binaryType = 'arraybuffer';
  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc);
  doc.conns.set(conn, new Set());
  // listen and reply to events
  logger.debug('connection on docName: ' + docName)

  conn.on('message', (message: ArrayBuffer) => messageListener(conn, doc, new Uint8Array(message)));
  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn);
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        closeConn(doc, conn);
        clearInterval(pingInterval);
      }
    }
  }, pingTimeout);
  conn.on('close', () => {
    closeConn(doc, conn);
    clearInterval(pingInterval);
  });
  conn.on('pong', () => {
    pongReceived = true;
  });
  // put the following in a variables in a block so the interval handlers don't keep it in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(doc, conn, encoding.toUint8Array(encoder));
    const awarenessStates = doc.awareness.getStates();
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())),
      );
      send(doc, conn, encoding.toUint8Array(encoder));
    }
  }
};
