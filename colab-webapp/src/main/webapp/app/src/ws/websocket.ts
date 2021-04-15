/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {WsUpdateMessage, entityIs, IndexEntry, TypeMap} from 'colab-rest-client';
import {dispatch} from '../store/store';
import * as ProjectActions from '../store/project';
import * as CardActions from '../store/card';
import {initSocketId} from '../API/api';

/**
 * Does the given index entry represent the given type ?
 */
const indexEntryIs = <T extends keyof TypeMap>(entry: IndexEntry, klass: T) => {
  return entityIs({'@class': entry.type, id: entry.id}, klass);
}

const onUpdate = (event: WsUpdateMessage) => {
  console.log('Delete: ', event.deleted);
  for (const item of event.deleted) {
    if (indexEntryIs(item, 'Project')) {
      dispatch(ProjectActions.removeProject(item.id));
    } else if (indexEntryIs(item, 'Card')) {
      dispatch(CardActions.removeCard(item.id));
    }
  }

  console.log('Update: ', event.updated);
  for (const item of event.updated) {
    if (entityIs(item, 'Project')) {
      dispatch(ProjectActions.updateProject(item));
    } else if (entityIs(item, 'Card')) {
      dispatch(CardActions.updateCard(item));
    }
  }
};

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

function createConnection(onCloseCb: () => void) {
  console.log('Init Websocket Connection');
  const connection = new WebSocket('ws:///' + window.location.host + '/ws');
  console.log('Init Ws Done');

  connection.onclose = () => {
    // reset by peer => reconnect please
    console.log('WS reset by peer');
    onCloseCb();
  };

  connection.onmessage = messageEvent => {
    const message = JSON.parse(messageEvent.data);
    if (entityIs(message, 'WsSessionIdentifier')) {
      dispatch(initSocketId(message));
    } else if (entityIs(message, 'WsUpdateMessage')) {
      onUpdate(message);
    }
  };
}

/**
 * Init websocket connection
 */
export function init() {
  // re-init connection to server if the current connection closed
  // it occurs when server is restarting
  const reinit = () => {
    setTimeout(() => {
      createConnection(reinit);
    }, 500);
  };

  return createConnection(reinit);
}
