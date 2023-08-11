/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
  entityIs,
  WsChannelUpdate,
  WsPing,
  WsPong,
  WsSessionIdentifier,
  WsSignOutMessage,
  WsUpdateMessage,
} from 'colab-rest-client';
import { getApplicationPath, initSocketId, processClosedHttpSessions } from '../API/api';
import { checkUnreachable } from '../helper';
import { getLogger } from '../logger';
import * as AdminActions from '../store/slice/adminSlice';
import { addNotification } from '../store/slice/notificationSlice';
import { storeDispatch } from '../store/store';
import { processMessage } from './wsThunkActions';

const logger = getLogger('WebSockets');
logger.setLevel(3);

// Turning monkey on will provocate ws failures
export const monkeyWebsocket = false;

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

const path = getApplicationPath();

const ping: WsPing = {
  '@class': 'WsPing',
};

const pingJson = JSON.stringify(ping);

const pong: WsPong = {
  '@class': 'WsPong',
};

const pongJson = JSON.stringify(pong);

interface MappedMessages {
  WsChannelUpdate: WsChannelUpdate[];
  WsSessionIdentifier: WsSessionIdentifier[];
  WsSignOutMessage: WsSignOutMessage[];
  WsUpdateMessage: WsUpdateMessage[];
}

function createConnection(onCloseCb: () => void) {
  logger.info('Init Websocket Connection');
  const protocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  const wsPath = `${path}/ws`;
  const connection = new WebSocket(`${protocol}:///${window.location.host}${wsPath}`);
  logger.info('Init Ws Done');

  if (monkeyWebsocket) {
    setTimeout(() => {
      logger.warn('Close connection');
      connection.close();
    }, 30000);
  }

  let pingId: ReturnType<typeof setInterval> | null = setInterval(() => {
    logger.trace('Ping');
    connection.send(pingJson);
  }, 1000 * 30);

  const clearPing = () => {
    if (pingId != null) {
      clearInterval(pingId);
      pingId = null;
    }
  };

  connection.onclose = event => {
    // reset by peer => reconnect please
    logger.warn('WS Close ', event);
    clearPing();
    onCloseCb();
  };

  connection.onmessage = messageEvent => {
    const parsed = JSON.parse(messageEvent.data);

    const messages = Array.isArray(parsed) ? parsed : [parsed];

    const sorted = messages.reduce<MappedMessages>(
      (acc, message) => {
        if (entityIs(message, 'WsMessage')) {
          if (entityIs(message, 'WsSessionIdentifier')) {
            acc.WsSessionIdentifier.push(message);
          } else if (entityIs(message, 'WsUpdateMessage')) {
            acc.WsUpdateMessage.push(message);
          } else if (entityIs(message, 'WsChannelUpdate')) {
            acc.WsChannelUpdate.push(message);
          } else if (entityIs(message, 'WsPing')) {
            logger.trace('Receive Ping -> send Pong');
            connection.send(pongJson);
          } else if (entityIs(message, 'WsPong')) {
            logger.trace('Receive Pong');
          } else if (entityIs(message, 'WsSignOutMessage')) {
            acc.WsSignOutMessage.push(message);
          } else {
            //If next line is erroneous, it means a type of WsMessage is not handled
            checkUnreachable(message);
          }
        } else {
          storeDispatch(
            addNotification({
              status: 'OPEN',
              type: 'ERROR',
              message: `Unhandled message type: ${message['@class']}`,
            }),
          );
        }

        return acc;
      },
      {
        WsChannelUpdate: [],
        WsSessionIdentifier: [],
        WsSignOutMessage: [],
        WsUpdateMessage: [],
      },
    );

    if (sorted.WsChannelUpdate.length > 0) {
      storeDispatch(AdminActions.channelUpdate(sorted.WsChannelUpdate));
    }

    if (sorted.WsUpdateMessage.length > 0) {
      storeDispatch(processMessage(sorted.WsUpdateMessage));
    }

    if (sorted.WsSessionIdentifier.length > 0) {
      logger.info('WS session identifier message');
      if (sorted.WsSessionIdentifier.length === 1) {
        storeDispatch(initSocketId(sorted.WsSessionIdentifier[0]!));
      } else {
        storeDispatch(
          addNotification({
            status: 'OPEN',
            type: 'ERROR',
            message: 'Multiple Session Identifier',
          }),
        );
      }
    }

    if (sorted.WsSignOutMessage.length > 0) {
      logger.info('WS sign out message');
      storeDispatch(processClosedHttpSessions(sorted.WsSignOutMessage));
    }
  };
}

/**
 * Init websocket connection
 */
export function init(): void {
  // re-init connection to server if the current connection closed
  // it occurs when server is restarting
  const reinit = () => {
    storeDispatch(initSocketId(null));
    setTimeout(() => {
      createConnection(reinit);
    }, 200);
  };

  return createConnection(reinit);
}
