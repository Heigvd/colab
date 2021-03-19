/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { WsUpdateMessage, WsDeleteMessage, WsInitMessage, entityIs } from 'colab-rest-client';
import { dispatch } from '../store';
import * as ProjectActions from '../store/project';
import * as WsActions from '../store/websocket';

const onUpdate = (event: WsUpdateMessage) => {
  console.log('Update: ', event);
  for (const item of event.payload) {
    if (entityIs<'Project'>(item, 'Project')) {
      dispatch(ProjectActions.updateProject(item));
    }
  }
};

const onDelete = (event: WsDeleteMessage) => {
  console.log('Delete: ', event);

  for (const item of event.items) {
    switch (item['type']) {
      case 'Project':
        dispatch(ProjectActions.removeProject(item.id));
        break;
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

  let resolveSessionId: (value: string | PromiseLike<string>) => void;

  const p = new Promise<string>(resolve => {
    resolveSessionId = resolve;
  });

  connection.onmessage = messageEvent => {
    const message = JSON.parse(messageEvent.data);
    if (entityIs(message, 'WsInitMessage')) {
      dispatch(WsActions.setSessionId((message as WsInitMessage).sessionId));
      resolveSessionId((message as WsInitMessage).sessionId);
    } else if (entityIs(message, 'WsUpdateMessage')) {
      onUpdate(message);
    } else if (entityIs(message, 'WsDeleteMessage')) {
      onDelete(message);
    }
  };

  return {
    getSessionId: p,
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
