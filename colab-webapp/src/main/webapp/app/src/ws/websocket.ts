/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { WsUpdateMessage, WsChannelUpdate, entityIs, IndexEntry, TypeMap } from 'colab-rest-client';
import { dispatch } from '../store/store';
import * as AdminActions from '../store/admin';
import * as ErrorActions from '../store/error';
import * as ProjectActions from '../store/project';
import * as CardActions from '../store/card';
import * as UserActions from '../store/user';
import { initSocketId } from '../API/api';

/**
 * Does the given index entry represent the given type ?
 */
const indexEntryIs = <T extends keyof TypeMap>(entry: IndexEntry, klass: T) => {
  return entityIs({ '@class': entry.type, id: entry.id }, klass);
};

const onUpdate = (event: WsUpdateMessage) => {
  console.log('Delete: ', event.deleted);
  for (const item of event.deleted) {
    if (indexEntryIs(item, 'Project')) {
      dispatch(ProjectActions.removeProject(item.id));
    } else if (indexEntryIs(item, 'Card')) {
      dispatch(CardActions.removeCard(item.id));
    } else if (indexEntryIs(item, 'User')) {
      dispatch(UserActions.removeUser(item.id));
    } else if (indexEntryIs(item, 'TeamMember')) {
      dispatch(ProjectActions.removeTeamMember(item.id));
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: new Error(`Unhandled deleted entity: ${item.type}#${item.id}`),
        }),
      );
    }
  }

  console.log('Update: ', event.updated);
  for (const item of event.updated) {
    if (entityIs(item, 'Project')) {
      dispatch(ProjectActions.updateProject(item));
    } else if (entityIs(item, 'Card')) {
      dispatch(CardActions.updateCard(item));
    } else if (entityIs(item, 'User')) {
      dispatch(UserActions.updateUser(item));
    } else if (entityIs(item, 'TeamMember')) {
      dispatch(ProjectActions.updateTeamMember(item));
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: new Error(`Unhandled udpated entity: ${item['@class']}#${item.id}`),
        }),
      );
    }
  }
};

const onChannelUpdate = (message: WsChannelUpdate) => {
  dispatch(AdminActions.channelUpdate(message));
};

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

function checkUnreachable(x: never) {
  console.error(x);
}

function createConnection(onCloseCb: () => void) {
  console.log('Init Websocket Connection');
  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const connection = new WebSocket(`${protocol}:///${window.location.host}/ws`);
  console.log('Init Ws Done');

  connection.onclose = () => {
    // reset by peer => reconnect please
    console.log('WS reset by peer');
    onCloseCb();
  };

  connection.onmessage = messageEvent => {
    const message = JSON.parse(messageEvent.data);
    if (entityIs(message, 'WsMessage')) {
      if (entityIs(message, 'WsSessionIdentifier')) {
        dispatch(initSocketId(message));
      } else if (entityIs(message, 'WsUpdateMessage')) {
        onUpdate(message);
      } else if (entityIs(message, 'WsChannelUpdate')) {
        onChannelUpdate(message);
      } else {
        //If next line is erroneous, it means a type of WsMessage is not handled
        checkUnreachable(message);
      }
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: new Error(`Unhandled message type: ${message['@class']}`),
        }),
      );
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
    dispatch(initSocketId(null));
    setTimeout(() => {
      createConnection(reinit);
    }, 500);
  };

  return createConnection(reinit);
}
