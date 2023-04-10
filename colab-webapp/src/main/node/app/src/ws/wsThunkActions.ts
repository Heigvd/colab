/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractCardType,
  AbstractResource,
  Account,
  ActivityFlowLink,
  Assignment,
  Card,
  CardContent,
  Change,
  CopyParam,
  Document,
  entityIs,
  HttpSession,
  IndexEntry,
  InstanceMaker,
  Project,
  StickyNoteLink,
  TeamMember,
  TeamRole,
  TypeMap,
  User,
  UserPresence,
  WsUpdateMessage,
} from 'colab-rest-client';
import { assertUnreachable } from '../helper';
import { getLogger } from '../logger';
import { ColabNotification } from '../store/slice/notificationSlice';

const logger = getLogger('WebSockets');

/**
 * Does the given index entry represent the given type ?
 */
const indexEntryIs = <T extends keyof TypeMap>(entry: IndexEntry, klass: T) => {
  return entityIs({ '@class': entry.type, id: entry.id }, klass);
};

interface Updates<T> {
  upserted: T[];
  deleted: IndexEntry[];
}

interface EntityBag {
  accounts: Updates<Account>;
  activityFlowLinks: Updates<ActivityFlowLink>;
  assignments: Updates<Assignment>;
  cards: Updates<Card>;
  cardTypes: Updates<AbstractCardType>;
  changes: Updates<Change>;
  contents: Updates<CardContent>;
  copyParam: Updates<CopyParam>;
  documents: Updates<Document>;
  httpSessions: Updates<HttpSession>;
  instanceMakers: Updates<InstanceMaker>;
  presences: Updates<UserPresence>;
  projects: Updates<Project>;
  resources: Updates<AbstractResource>;
  stickynotelinks: Updates<StickyNoteLink>;
  teamMembers: Updates<TeamMember>;
  teamRoles: Updates<TeamRole>;
  users: Updates<User>;
  notifications: ColabNotification[];
}

function createBag(): EntityBag {
  return {
    accounts: { upserted: [], deleted: [] },
    activityFlowLinks: { upserted: [], deleted: [] },
    assignments: { upserted: [], deleted: [] },
    cards: { upserted: [], deleted: [] },
    cardTypes: { upserted: [], deleted: [] },
    changes: { upserted: [], deleted: [] },
    contents: { upserted: [], deleted: [] },
    copyParam: { upserted: [], deleted: [] },
    documents: { upserted: [], deleted: [] },
    httpSessions: { upserted: [], deleted: [] },
    instanceMakers: { upserted: [], deleted: [] },
    presences: { upserted: [], deleted: [] },
    projects: { upserted: [], deleted: [] },
    resources: { upserted: [], deleted: [] },
    stickynotelinks: { upserted: [], deleted: [] },
    teamMembers: { upserted: [], deleted: [] },
    teamRoles: { upserted: [], deleted: [] },
    users: { upserted: [], deleted: [] },
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
        } else if (indexEntryIs(item, 'ActivityFlowLink')) {
          bag.activityFlowLinks.deleted.push(item);
        } else if (indexEntryIs(item, 'Assignment')) {
          bag.assignments.deleted.push(item);
        } else if (indexEntryIs(item, 'Card')) {
          bag.cards.deleted.push(item);
        } else if (indexEntryIs(item, 'AbstractCardType')) {
          bag.cardTypes.deleted.push(item);
        } else if (indexEntryIs(item, 'Change')) {
          bag.changes.deleted.push(item);
        } else if (indexEntryIs(item, 'CardContent')) {
          bag.contents.deleted.push(item);
        } else if (indexEntryIs(item, 'CopyParam')) {
          bag.copyParam.deleted.push(item);
        } else if (indexEntryIs(item, 'Document')) {
          bag.documents.deleted.push(item);
        } else if (indexEntryIs(item, 'HttpSession')) {
          bag.httpSessions.deleted.push(item);
        } else if (indexEntryIs(item, 'InstanceMaker')) {
          bag.instanceMakers.deleted.push(item);
        } else if (indexEntryIs(item, 'Project')) {
          bag.projects.deleted.push(item);
        } else if (indexEntryIs(item, 'AbstractResource')) {
          bag.resources.deleted.push(item);
        } else if (indexEntryIs(item, 'StickyNoteLink')) {
          bag.stickynotelinks.deleted.push(item);
        } else if (indexEntryIs(item, 'TeamMember')) {
          bag.teamMembers.deleted.push(item);
        } else if (indexEntryIs(item, 'TeamRole')) {
          bag.teamRoles.deleted.push(item);
        } else if (indexEntryIs(item, 'User')) {
          bag.users.deleted.push(item);
        } else if (indexEntryIs(item, 'UserPresence')) {
          bag.presences.deleted.push(item);
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
          bag.accounts.upserted.push(item);
        } else if (entityIs(item, 'ActivityFlowLink')) {
          bag.activityFlowLinks.upserted.push(item);
        } else if (entityIs(item, 'Assignment')) {
          bag.assignments.upserted.push(item);
        } else if (entityIs(item, 'Card')) {
          bag.cards.upserted.push(item);
        } else if (entityIs(item, 'AbstractCardType')) {
          bag.cardTypes.upserted.push(item);
        } else if (entityIs(item, 'Change')) {
          bag.changes.upserted.push(item);
        } else if (entityIs(item, 'CardContent')) {
          bag.contents.upserted.push(item);
        } else if (entityIs(item, 'CopyParam')) {
          bag.copyParam.upserted.push(item);
        } else if (entityIs(item, 'Document')) {
          bag.documents.upserted.push(item);
        } else if (entityIs(item, 'HttpSession')) {
          bag.httpSessions.upserted.push(item);
        } else if (entityIs(item, 'InstanceMaker')) {
          bag.instanceMakers.upserted.push(item);
        } else if (entityIs(item, 'Project')) {
          bag.projects.upserted.push(item);
        } else if (entityIs(item, 'AbstractResource')) {
          bag.resources.upserted.push(item);
        } else if (entityIs(item, 'StickyNoteLink')) {
          bag.stickynotelinks.upserted.push(item);
        } else if (entityIs(item, 'TeamMember')) {
          bag.teamMembers.upserted.push(item);
        } else if (entityIs(item, 'TeamRole')) {
          bag.teamRoles.upserted.push(item);
        } else if (entityIs(item, 'User')) {
          bag.users.upserted.push(item);
        } else if (entityIs(item, 'UserPresence')) {
          bag.presences.upserted.push(item);
        } else {
          //If next line is erroneous, it means a type of entity is not handled
          assertUnreachable(item);
        }
      }
    });

    return bag;
  },
);
