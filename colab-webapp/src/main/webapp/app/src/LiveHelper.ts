/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { Change, MicroChange } from 'colab-rest-client';
import * as Diff from 'diff';
//import {removeAllItems} from "./helper";
import logger from './logger';

//export const mapChangesByObject = (changes: Change[]): ChangeState => {
//  return changes.reduce<ChangeState>(
//    (acc, cur) => {
//      if (cur.atClass != null && cur.atId != null) {
//        acc[cur.atClass] = acc[cur.atClass] || {};
//        const classState = acc[cur.atClass]!;
//
//        classState[cur.atId] = classState[cur.atId] || {
//          status: 'UNSET',
//          changes: []
//        }
//        const chState = classState[cur.atId]!
//
//        chState.changes.push(cur);
//      }
//      return acc;
//    }, {});
//};

/**
 * compute µchanges between previous and current.
 * µChange indexes correspond to those of the previous version.
 */
export const getMicroChange = (previous: string, current: string): MicroChange[] => {
  logger.trace('Previous:', previous);
  logger.trace('New:', current);

  const diff = Diff.diffChars(previous, current);

  logger.trace('Diff: ', diff);
  let currentOffset = 0;
  const changes: MicroChange[] = [];

  for (const current of diff) {
    if (current.added) {
      changes.push({
        t: 'I',
        o: currentOffset,
        v: current.value,
      });
      //currentOffset += current.count || 0;
    } else if (current.removed) {
      changes.push({
        t: 'D',
        o: currentOffset,
        l: current.count || 0,
      });
      currentOffset += current.count || 0;
    } else {
      currentOffset += current.count || 0;
    }
  }

  logger.trace('Changeset: ', changes);
  return changes;
};

export interface ChangesWithOffset {
  changes: MicroChange[];
  offset: number;
}

export const getMicroChangeReduce = (previous: string, current: string): MicroChange[] => {
  logger.trace('Previous:', previous);
  logger.trace('New:', current);

  const diff = Diff.diffChars(previous, current);

  logger.trace('Diff: ', diff);

  const reduction = diff.reduce<ChangesWithOffset>(
    (acc, current) => {
      logger.trace('Acc: ', acc);
      logger.trace('Cur: ', current);
      const newOffset = acc.offset + (current.count || 0);
      logger.trace('NewOffset: ', newOffset);
      if (current.added) {
        const nAcc: ChangesWithOffset = {
          changes: [
            ...acc.changes,
            {
              t: 'I',
              o: acc.offset,
              v: current.value,
            },
          ],
          offset: newOffset,
        };
        logger.trace('NewAcc: ', nAcc);
        return nAcc;
      } else if (current.removed) {
        const nAcc: ChangesWithOffset = {
          changes: [
            ...acc.changes,
            {
              t: 'D',
              o: acc.offset,
              l: current.count || 0,
            },
          ],
          offset: newOffset,
        };
        logger.trace('NewAcc: ', nAcc);
        return nAcc;
      }
      const nAcc = {
        ...acc,
        offset: newOffset,
      };
      logger.trace('NewAcc: ', nAcc);
      return nAcc;
    },
    { changes: [], offset: 0 },
  );

  logger.trace('Changeset: ', reduction);

  return reduction.changes;
};

/**
 * Apply one microchange to buffer
 */
function applyChange(buffer: string, mu: MicroChange): string {
  if (mu.t === 'D' && mu.l != null) {
    return buffer.substring(0, mu.o) + buffer.substring(mu.o + mu.l);
  } else if (mu.t === 'I' && mu.v != null) {
    return buffer.substring(0, mu.o) + mu.v + buffer.substring(mu.o);
  } else {
    logger.error('Invalid change: ', mu);
    return buffer;
  }
}

interface Offsets {
  [index: number]: number;
}

function modifyOffsets(offsets: Offsets, index: number, value: number) {
  let currentOffset = offsets[index] || 0;
  currentOffset += value;
  offsets[index] = currentOffset;

  const modified: Offsets = {};

  for (const sKey in offsets) {
    const key = +sKey;
    if (key > index && key < index + value) {
      logger.error('Conflict');
    }
    if (key > index) {
      // current offset if after the new offset
      // shoudl be moves
      const oValue = offsets[key];
      if (oValue != null) {
        const newKey = key + value;
        let newValue = oValue;
        const newOffset = offsets[newKey];
        if (newOffset) {
          newValue = newOffset + newValue;
        }
        modified[key] = 0;
        modified[newKey] = newValue;
      }
    }
  }

  for (const sKey in modified) {
    const key = +sKey;
    const current = modified[key];
    if (current != null) {
      offsets[key] = current;
    }
  }
}

function computeOffsets(change: Change): Offsets {
  const offsets: Offsets = {};

  for (let i = change.microchanges.length - 1; i >= 0; i--) {
    const mu = change.microchanges[i]!;
    if (mu.t === 'D') {
      if (mu.l != null) {
        modifyOffsets(offsets, mu.o + mu.l, -mu.l);
      }
    } else {
      if (mu.v != null) {
        modifyOffsets(offsets, mu.o, mu.v.length);
      }
    }
  }
  return offsets;
}

function shift(change: Change, offsets: Offsets, _forward: boolean) {
  //const way = forward ? 1 : -1; //TODO
  for (let i = 0; i < change.microchanges.length; i++) {
    const mu = change.microchanges[i]!;

    for (const key in offsets) {
      const offsetIndex = +key;
      const offsetValue = offsets[offsetIndex]!;
      const muStart = mu.o;

      if (offsetValue > 0 && mu.t === 'I') {
        if (mu.o >= offsetIndex) {
          mu.o += offsetValue;
        }
      } else if (offsetValue < 0 && mu.t === 'D') {
        const deleteFromIndex = offsetIndex + offsetValue;
        const deleteToIndex = offsetIndex;
        const muEnd = muStart + mu.l!;

        // tree major cases
        if (muEnd < deleteFromIndex) {
          // nothind to do
        } else if (muStart > deleteToIndex) {
          mu.o += offsetValue;
        } else {
          // deletions overlap
          if (muStart <= deleteFromIndex && muEnd >= deleteToIndex) {
            // mu wraps offset
            // off          |---|
            // mu       |---------|
            // new mu   |---     -|
            mu.l! += offsetValue;
          } else if (muStart >= deleteFromIndex && muEnd <= deleteToIndex) {
            // offset wraps mu => mu is useless
            // off       |---------|
            // mu          |---|
            // new mu    canceled
            change.microchanges.splice(i, 1);
            i--;
          } else if (muStart <= deleteFromIndex && muEnd <= deleteToIndex) {
            // partial overlap
            // off       |-----|
            // mu     |-----|
            // new mu |--|
            mu.l = deleteFromIndex - muStart;
          } else if (muStart >= deleteFromIndex && muEnd >= deleteToIndex) {
            // partial overlap
            // off    |-----|
            // mu        |-----|
            // new mu       |--| shifted at offsetStart
            mu.l = muEnd - deleteToIndex;
            mu.o = deleteFromIndex;
          } else {
            logger.error('Unhandled case offset{}:{}, mu:{}', offsetIndex, offsetValue, mu);
          }
        }
      } else if (offsetValue < 0 && mu.t === 'I') {
        // offset is deletion, mu is addition
        const deleteFromIndex = offsetIndex + offsetValue;
        const deleteToIndex = offsetIndex;
        if (muStart >= deleteToIndex) {
          // off    |-----|
          // mu               |+++++|
          // just shift to the left
          mu.o += offsetValue;
        } else if (muStart > deleteFromIndex) {
          // off         |-----|
          // mu            |+|
          // mu var1     |+|
          mu.o = deleteFromIndex;
        } else {
          // off         |-----|
          // mu     |+|
          // nothing to do
        }
      } else if (offsetValue > 0 && mu.t === 'D') {
        // offset is addition, mu is deletion
        const muEnd = muStart + mu.l!;

        if (muEnd < offsetIndex) {
          // off         |+|
          // mus  |---|
          // nothing to do
        } else if (muStart > offsetIndex) {
          // off   |+|
          // mu         |---|
          // new mu : shift
          mu.o += offsetValue;
        } else {
          // off        |+|
          // mu      |--------|
          // new v1  |--|  |--|
          const totalLength = mu.l!;
          mu.l = offsetIndex - muStart;
          const newMu: MicroChange = {
            t: 'D',
            o: offsetIndex + offsetValue,
            l: totalLength - mu.l,
          };
          change.microchanges.splice(i + 1, 0, newMu);
          i++;
        }
      }
    }
  }
}

function propagateOffsets(changes: Change[], parent: Change, offsets: Offsets, forward: boolean) {
  const children = changes.filter(
    ch => ch.basedOn === parent.revision && ch.liveSession === parent.liveSession,
  );

  for (const child of children) {
    shift(child, offsets, forward);
    propagateOffsets(changes, child, offsets, forward);
  }
}

function rebase(allChanges: Change[], newBase: Change, change: Change) {
  if (newBase.basedOn === change.basedOn) {
    // Rebase siebling
    const offsets = computeOffsets(newBase);

    logger.trace('Rebase Sieblings: ', change, ' on ', newBase, ' with offset ', offsets);

    change.basedOn = newBase.revision;
    shift(change, offsets, true);
    propagateOffsets(allChanges, change, offsets, true);

    logger.trace('Rebase done: ', change, ' on ', newBase, ' with offset ', offsets);
  } else if (newBase.basedOn === change.revision) {
    logger.trace('Inverse hierachy : ', change, ' on ', newBase);
    const offsets = computeOffsets(newBase);

    newBase.basedOn = change.basedOn;
    change.basedOn = newBase.revision;

    shift(newBase, offsets, false);
    const newBaseOffsets = computeOffsets(newBase);
    shift(change, newBaseOffsets, true);
  } else {
    logger.error('Changes must be sieblings or newBase must be a child of change');
  }
}

/**
 * Apply all µchanges to content
 */
export const process = (
  content: string,
  changeset: Change[],
): {
  value: string;
  revision: string;
} => {
  let buffer = content;

  let currentRevision: string = '0';
  // clone changset so they are mutable
  const changes = changeset.map(c => ({
    ...c,
    microchanges: c.microchanges.map(mu => ({ ...mu })),
  }));

  logger.trace('Changes to apply: ', changes);
  while (changes.length > 0) {
    // fetch all changes based on the current revision
    const children = changes.filter(change => change.basedOn === currentRevision);
    if (children.length > 0) {
      // apply first child
      const change = children.shift()!;
      changes.splice(changes.indexOf(change), 1);

      const muChanges = [...change.microchanges];
      muChanges.reverse();

      logger.trace('Buffer: ', buffer);
      for (const mu of muChanges) {
        buffer = applyChange(buffer, mu);
      }
      logger.trace('Buffer: ', buffer);

      // rebase sieblings
      children.reverse();
      for (const child of children) {
        changes.splice(changes.indexOf(child), 1);
        rebase(changes, change, child);
        changes.unshift(child);
      }

      currentRevision = change.revision;
      logger.trace('Current revision is ', currentRevision);
    } else {
      logger.error('Changes: ', changes);
      throw new Error('Inconsistent changset: missing ' + currentRevision + ' children');
    }
  }

  return {
    value: buffer,
    revision: currentRevision,
  };
};

/**
 * merge ch1 within ch2
 * returns changes which contains set of unique changes
 *         and set of duplicates, which contains ch2 changes which
 *         previously exists in ch1
 *
 */
export const merge = (
  ch1: Change[],
  ch2: Change[],
): { changes: Change[]; duplicates: Change[] } => {
  return ch2.reduce<{
    changes: Change[];
    duplicates: Change[];
  }>(
    (acc, cur) => {
      if (acc.changes.find(c => c.revision === cur.revision)) {
        return {
          changes: acc.changes,
          duplicates: [...acc.duplicates, cur],
        };
      } else {
        return {
          changes: [...acc.changes, cur],
          duplicates: acc.duplicates,
        };
      }
    },
    { changes: [...ch1], duplicates: [] },
  );
};
