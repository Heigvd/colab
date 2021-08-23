/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractCardType,
  AccessControl,
  Account,
  Block,
  Card,
  CardContent,
  Change,
  Document,
  entityIs,
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
import getLogger from '../logger';
import { ColabError } from '../store/error';

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
  projects: Updates<Project>;
  members: Updates<TeamMember>;
  roles: Updates<TeamRole>;
  cards: Updates<Card>;
  acl: Updates<AccessControl>;
  contents: Updates<CardContent>;
  types: Updates<AbstractCardType>;
  documents: Updates<Document>;
  blocks: Updates<Block>;
  stickynotelinks: Updates<StickyNoteLink>;
  users: Updates<User>;
  accounts: Updates<Account>;
  changes: Updates<Change>;
  errors: ColabError[];
}

function createBag(): EntityBag {
  return {
    projects: { updated: [], deleted: [] },
    members: { updated: [], deleted: [] },
    roles: { updated: [], deleted: [] },
    cards: { updated: [], deleted: [] },
    acl: { updated: [], deleted: [] },
    contents: { updated: [], deleted: [] },
    types: { updated: [], deleted: [] },
    documents: { updated: [], deleted: [] },
    blocks: { updated: [], deleted: [] },
    stickynotelinks: { updated: [], deleted: [] },
    users: { updated: [], deleted: [] },
    accounts: { updated: [], deleted: [] },
    changes: { updated: [], deleted: [] },
    errors: [],
  };
}

export const processMessage = createAsyncThunk(
  'websocket/processUpdate',
  async (event: WsUpdateMessage) => {
    const bag = createBag();
    logger.info('Delete: ', event.deleted);
    for (const item of event.deleted) {
      if (indexEntryIs(item, 'Project')) {
        bag.projects.deleted.push(item);
      } else if (indexEntryIs(item, 'TeamMember')) {
        bag.members.deleted.push(item);
      } else if (indexEntryIs(item, 'TeamRole')) {
        bag.roles.deleted.push(item);
      } else if (indexEntryIs(item, 'AccessControl')) {
        bag.acl.deleted.push(item);
      } else if (indexEntryIs(item, 'Card')) {
        bag.cards.deleted.push(item);
      } else if (indexEntryIs(item, 'AbstractCardType')) {
        bag.types.deleted.push(item);
      } else if (indexEntryIs(item, 'Document')) {
        bag.documents.deleted.push(item);
      } else if (indexEntryIs(item, 'Block')) {
        bag.blocks.deleted.push(item);
      } else if (indexEntryIs(item, 'CardContent')) {
        bag.contents.deleted.push(item);
      } else if (indexEntryIs(item, 'StickyNoteLink')) {
        bag.contents.deleted.push(item);
      } else if (indexEntryIs(item, 'User')) {
        bag.users.deleted.push(item);
      } else if (indexEntryIs(item, 'Account')) {
        bag.accounts.deleted.push(item);
      } else if (indexEntryIs(item, 'Change')) {
        bag.changes.deleted.push(item);
      } else {
        bag.errors.push({
          status: 'OPEN',
          error: `Unhandled deleted entity: ${item.type}#${item.id}`,
        });
      }
    }

    logger.info('Update: ', event.updated);
    for (const item of event.updated) {
      if (entityIs(item, 'Project')) {
        bag.projects.updated.push(item);
      } else if (entityIs(item, 'TeamMember')) {
        bag.members.updated.push(item);
      } else if (entityIs(item, 'TeamRole')) {
        bag.roles.updated.push(item);
      } else if (entityIs(item, 'AccessControl')) {
        bag.acl.updated.push(item);
      } else if (entityIs(item, 'Card')) {
        bag.cards.updated.push(item);
      } else if (entityIs(item, 'CardContent')) {
        bag.contents.updated.push(item);
      } else if (entityIs(item, 'AbstractCardType')) {
        bag.types.updated.push(item);
      } else if (entityIs(item, 'Document')) {
        bag.documents.updated.push(item);
      } else if (entityIs(item, 'Block')) {
        bag.blocks.updated.push(item);
      } else if (entityIs(item, 'StickyNoteLink')) {
        bag.stickynotelinks.updated.push(item);
      } else if (entityIs(item, 'User')) {
        bag.users.updated.push(item);
      } else if (entityIs(item, 'Account')) {
        bag.accounts.updated.push(item);
      } else if (entityIs(item, 'Change')) {
        bag.changes.updated.push(item);
      } else {
        //If next line is erroneous, it means a type of WsMessage is not handled
        checkUnreachable(item);
      }
    }

    return bag;
  },
);
