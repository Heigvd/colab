/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractCardType,
  AbstractResource,
  AccessControl,
  Account,
  ActivityFlowLink,
  Card,
  CardContent,
  Change,
  Document,
  entityIs,
  HttpSession,
  IndexEntry,
  Project,
  StickyNoteLink,
  TeamMember,
  TeamRole,
  TypeMap,
  User,
  WsUpdateMessage,
} from 'colab-rest-client';
import { checkUnreachable } from '../helper';
import { getLogger } from '../logger';
import { ColabNotification } from '../store/notification';

const logger = getLogger('WebSockets');

/**
 * Does the given index entry represent the given type ?
 */
const indexEntryIs = <T extends keyof TypeMap>(entry: IndexEntry, klass: T) => {
  return entityIs({ '@class': entry.type, id: entry.id }, klass);
};

interface Updates<T> {
  updated: T[];
  deleted: IndexEntry[];
}

interface EntityBag {
  accounts: Updates<Account>;
  acl: Updates<AccessControl>;
  activityFlowLinks: Updates<ActivityFlowLink>;
  cards: Updates<Card>;
  cardTypes: Updates<AbstractCardType>;
  changes: Updates<Change>;
  contents: Updates<CardContent>;
  documents: Updates<Document>;
  httpSessions: Updates<HttpSession>;
  members: Updates<TeamMember>;
  projects: Updates<Project>;
  resources: Updates<AbstractResource>;
  roles: Updates<TeamRole>;
  stickynotelinks: Updates<StickyNoteLink>;
  users: Updates<User>;
  notifications: ColabNotification[];
}

function createBag(): EntityBag {
  return {
    accounts: { updated: [], deleted: [] },
    acl: { updated: [], deleted: [] },
    activityFlowLinks: { updated: [], deleted: [] },
    cards: { updated: [], deleted: [] },
    cardTypes: { updated: [], deleted: [] },
    changes: { updated: [], deleted: [] },
    contents: { updated: [], deleted: [] },
    documents: { updated: [], deleted: [] },
    httpSessions: { updated: [], deleted: [] },
    members: { updated: [], deleted: [] },
    projects: { updated: [], deleted: [] },
    resources: { updated: [], deleted: [] },
    roles: { updated: [], deleted: [] },
    stickynotelinks: { updated: [], deleted: [] },
    users: { updated: [], deleted: [] },
    notifications: [],
  };
}

export const processMessage = createAsyncThunk(
  'websocket/processUpdate',
  async (events: WsUpdateMessage[]) => {
    const bag = createBag();
    logger.info('Process ', events.length, ' messages');
    events.forEach((event, i) => {
      logger.info(` Message #${i}`, event);
      for (const item of event.deleted) {
        if (indexEntryIs(item, 'Account')) {
          bag.accounts.deleted.push(item);
        } else if (indexEntryIs(item, 'AccessControl')) {
          bag.acl.deleted.push(item);
        } else if (indexEntryIs(item, 'ActivityFlowLink')) {
          bag.activityFlowLinks.deleted.push(item);
        } else if (indexEntryIs(item, 'Card')) {
          bag.cards.deleted.push(item);
        } else if (indexEntryIs(item, 'AbstractCardType')) {
          bag.cardTypes.deleted.push(item);
        } else if (indexEntryIs(item, 'Change')) {
          bag.changes.deleted.push(item);
        } else if (indexEntryIs(item, 'CardContent')) {
          bag.contents.deleted.push(item);
        } else if (indexEntryIs(item, 'Document')) {
          bag.documents.deleted.push(item);
        } else if (indexEntryIs(item, 'HttpSession')) {
          bag.httpSessions.deleted.push(item);
        } else if (indexEntryIs(item, 'TeamMember')) {
          bag.members.deleted.push(item);
        } else if (indexEntryIs(item, 'TeamRole')) {
          bag.roles.deleted.push(item);
        } else if (indexEntryIs(item, 'Project')) {
          bag.projects.deleted.push(item);
        } else if (indexEntryIs(item, 'AbstractResource')) {
          bag.resources.deleted.push(item);
        } else if (indexEntryIs(item, 'StickyNoteLink')) {
          bag.stickynotelinks.deleted.push(item);
        } else if (indexEntryIs(item, 'User')) {
          bag.users.deleted.push(item);
        } else {
          bag.notifications.push({
            status: 'OPEN',
            type: 'WARN',
            message: `Unhandled deleted entity: ${item.type}#${item.id}`,
          });
        }
      }

      for (const item of event.updated) {
        if (entityIs(item, 'Account')) {
          bag.accounts.updated.push(item);
        } else if (entityIs(item, 'AccessControl')) {
          bag.acl.updated.push(item);
        } else if (entityIs(item, 'ActivityFlowLink')) {
          bag.activityFlowLinks.updated.push(item);
        } else if (entityIs(item, 'Card')) {
          bag.cards.updated.push(item);
        } else if (entityIs(item, 'AbstractCardType')) {
          bag.cardTypes.updated.push(item);
        } else if (entityIs(item, 'Change')) {
          bag.changes.updated.push(item);
        } else if (entityIs(item, 'CardContent')) {
          bag.contents.updated.push(item);
        } else if (entityIs(item, 'Document')) {
          bag.documents.updated.push(item);
        } else if (entityIs(item, 'HttpSession')) {
          bag.httpSessions.updated.push(item);
        } else if (entityIs(item, 'TeamMember')) {
          bag.members.updated.push(item);
        } else if (entityIs(item, 'Project')) {
          bag.projects.updated.push(item);
        } else if (entityIs(item, 'AbstractResource')) {
          bag.resources.updated.push(item);
        } else if (entityIs(item, 'TeamRole')) {
          bag.roles.updated.push(item);
        } else if (entityIs(item, 'StickyNoteLink')) {
          bag.stickynotelinks.updated.push(item);
        } else if (entityIs(item, 'User')) {
          bag.users.updated.push(item);
        } else {
          //If next line is erroneous, it means a type of WsMessage is not handled
          checkUnreachable(item);
        }
      }
    });

    return bag;
  },
);
