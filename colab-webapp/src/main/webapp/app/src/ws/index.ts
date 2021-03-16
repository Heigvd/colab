/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { Project, WsUpdateMessage, WsDeleteMessage, WsInitMessage } from 'colab-rest-client';
import { dispatch, ACTIONS } from '../store';

const onUpdate = (event: WsUpdateMessage) => {
  console.log('Update: ', event);
  for (const item of event.payload) {
    switch (item['@class']) {
      case 'Project':
        dispatch(ACTIONS.updateProject((item as unknown) as Project));
        break;
    }
  }
};

const onDelete = (event: WsDeleteMessage) => {
  console.log('Delete: ', event);

  for (const item of event.items) {
    switch (item['type']) {
      case 'Project':
        dispatch(ACTIONS.removeProject(item.id));
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
    if ('@class' in message) {
      switch (message['@class']) {
        case 'WsDeleteMessage':
          onDelete(message);
          break;
        case 'WsUpdateMessage':
          onUpdate(message);
          break;
        case 'WsInitMessage':
          dispatch(ACTIONS.initWsSessionId((message as WsInitMessage).sessionId));
          resolveSessionId((message as WsInitMessage).sessionId);
          break;
      }
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
