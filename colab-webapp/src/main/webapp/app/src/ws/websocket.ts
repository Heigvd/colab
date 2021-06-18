/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {
  WsUpdateMessage,
  WsChannelUpdate,
  entityIs,
  IndexEntry,
  TypeMap,
  WsDeleteChangeMessage,
  WsUpdateChangeMessage,
} from 'colab-rest-client';
import { dispatch } from '../store/store';
import * as AdminActions from '../store/admin';
import * as ErrorActions from '../store/error';
import * as BlockActions from '../store/block';
import * as ChangeActions from '../store/change';
import * as ProjectActions from '../store/project';
import * as DocumentActions from '../store/document';
import * as CardActions from '../store/card';
import * as CardTypeActions from '../store/cardtype';
import * as UserActions from '../store/user';
import { initSocketId } from '../API/api';
import logger from '../logger';

/**
 * Does the given index entry represent the given type ?
 */
const indexEntryIs = <T extends keyof TypeMap>(entry: IndexEntry, klass: T) => {
  return entityIs({ '@class': entry.type, id: entry.id }, klass);
};

const onUpdate = (event: WsUpdateMessage) => {
  logger.info('Delete: ', event.deleted);
  for (const item of event.deleted) {
    if (indexEntryIs(item, 'Project')) {
      dispatch(ProjectActions.removeProject(item.id));
    } else if (indexEntryIs(item, 'TeamMember')) {
      dispatch(ProjectActions.removeTeamMember(item.id));
    } else if (indexEntryIs(item, 'Card')) {
      dispatch(CardActions.removeCard(item.id));
    } else if (indexEntryIs(item, 'AbstractCardType')) {
      dispatch(CardTypeActions.removeCardType(item.id));
    } else if (indexEntryIs(item, 'Document')) {
      dispatch(DocumentActions.removeDocument(item.id));
    } else if (indexEntryIs(item, 'Block')) {
      dispatch(BlockActions.removeBlock(item.id));
    } else if (indexEntryIs(item, 'CardContent')) {
      dispatch(CardActions.removeContent(item.id));
    } else if (indexEntryIs(item, 'User')) {
      dispatch(UserActions.removeUser(item.id));
    } else if (indexEntryIs(item, 'Account')) {
      dispatch(UserActions.removeAccount(item.id));
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: `Unhandled deleted entity: ${item.type}#${item.id}`,
        }),
      );
    }
  }

  logger.info('Update: ', event.updated);
  for (const item of event.updated) {
    if (entityIs(item, 'Project')) {
      dispatch(ProjectActions.updateProject(item));
    } else if (entityIs(item, 'TeamMember')) {
      dispatch(ProjectActions.updateTeamMember(item));
    } else if (entityIs(item, 'Card')) {
      dispatch(CardActions.updateCard(item));
    } else if (entityIs(item, 'CardContent')) {
      dispatch(CardActions.updateContent(item));
    } else if (entityIs(item, 'AbstractCardType')) {
      dispatch(CardTypeActions.updateCardType(item));
    } else if (entityIs(item, 'Document')) {
      dispatch(DocumentActions.updateDocument(item));
    } else if (entityIs(item, 'Block')) {
      dispatch(BlockActions.updateBlock(item));
    } else if (entityIs(item, 'User')) {
      dispatch(UserActions.updateUser(item));
    } else if (entityIs(item, 'Account')) {
      dispatch(UserActions.updateAccount(item));
    } else {
      //If next line is erroneous, it means a type of WsMessage is not handled
      checkUnreachable(item);
      //      dispatch(
      //        ErrorActions.addError({
      //          status: 'OPEN',
      //          error: `Unhandled udpated entity: ${item['@class']}#${item.id}`,
      //        }),
      //      );
    }
  }
};

const onChannelUpdate = (message: WsChannelUpdate) => {
  dispatch(AdminActions.channelUpdate(message));
};

function onLiveUpdate(message: WsUpdateChangeMessage) {
  if (message.payload != null) {
    dispatch(ChangeActions.updateChanges(message.payload));
  }
}

function onLiveDelete(message: WsDeleteChangeMessage) {
  if (message.payload != null) {
    dispatch(ChangeActions.deleteChanges(message.payload));
  }
}

//export function send(channel: string, payload: {}) {
//  connection.send(JSON.stringify({
//    channel,
//    payload
//  }));
//}

function checkUnreachable(x: never) {
  logger.error(x);
}

function createConnection(onCloseCb: () => void) {
  logger.info('Init Websocket Connection');
  const protocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  const connection = new WebSocket(`${protocol}:///${window.location.host}/ws`);
  logger.info('Init Ws Done');

  connection.onclose = () => {
    // reset by peer => reconnect please
    logger.info('WS reset by peer');
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
      } else if (entityIs(message, 'WsUpdateChangeMessage')) {
        onLiveUpdate(message);
      } else if (entityIs(message, 'WsDeleteChangeMessage')) {
        onLiveDelete(message);
      } else {
        //If next line is erroneous, it means a type of WsMessage is not handled
        checkUnreachable(message);
      }
    } else {
      dispatch(
        ErrorActions.addError({
          status: 'OPEN',
          error: `Unhandled message type: ${message['@class']}`,
        }),
      );
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
    dispatch(initSocketId(null));
    setTimeout(() => {
      createConnection(reinit);
    }, 500);
  };

  return createConnection(reinit);
}
