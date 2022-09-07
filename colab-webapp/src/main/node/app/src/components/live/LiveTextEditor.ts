/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Change, entityIs, TextDataBlock } from 'colab-rest-client';
import { throttle } from 'lodash';
import * as React from 'react';
import * as API from '../../API/api';
import * as LiveHelper from '../../LiveHelper';
import { getLogger } from '../../logger';
import { useChanges } from '../../selectors/changeSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

//import {ToastClsMarkdownEditor} from '../blocks/markdown/ToastClsMarkdownEditor';

const logger = getLogger('LiveChanges');

export interface LiveBlockState {
  status: 'DISCONNECTED' | 'UNSET' | 'LOADING' | 'READY';
  currentValue: string;
  onChange: (value: string) => void;
}

interface Props {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
}

function applyChanges(value: string, revision: string, changes: Change[]) {
  try {
    return LiveHelper.process(value, revision, changes);
  } catch {
    return null;
  }
}

function findCounterValue(initialRevision: string, liveSession: string, changes: Change[]): number {
  let minChange = 0;
  if (initialRevision.startsWith(liveSession)) {
    minChange = +initialRevision.replace(liveSession + '::', '');
  }
  return changes
    .filter(ch => ch.liveSession === liveSession)
    .map(ch => +ch.revision.replace(liveSession + '::', ''))
    .reduce((max, current) => (current > max ? current : max), minChange);
}

//                                  socketId    channelId count
const subscriptionCounters: Record<string, Record<string, number>> = {};

export function useBlock(blockId: number | null | undefined): TextDataBlock | null | undefined {
  // blockId =>  number of subscriptions
  const dispatch = useAppDispatch();
  const webSocketId = useAppSelector(state => state.websockets.sessionId);
  const socketIdRef = React.useRef<string | null>(null);
  // maintain socketId up to date
  socketIdRef.current = webSocketId || null;

  React.useEffect(() => {
    if (blockId != null && webSocketId != null) {
      const channelId = `block_${blockId}`;
      const currentChannels = subscriptionCounters[webSocketId] || {};
      subscriptionCounters[webSocketId] = currentChannels;

      const count = currentChannels[channelId] || 0;
      if (!count) {
        // subscribe
        currentChannels[channelId] = 1;
        dispatch(API.subscribeToBlockChannel(blockId));
      } else {
        currentChannels[channelId] = count + 1;
      }

      return () => {
        // make sure socketId did not change
        // There is no need to unsubscribe from previous session as this session do no longer exist
        if (socketIdRef.current === webSocketId) {
          // socketId did not change
          const currentChannels = subscriptionCounters[webSocketId];
          if (currentChannels) {
            const count = currentChannels[channelId];
            if (count === 1) {
              currentChannels[channelId] = 0;
              dispatch(API.unsubscribeFromBlockChannel(blockId));
            } else if (count ?? 0 > 1) {
              currentChannels[channelId] = count! - 1;
            } else {
              logger.error('Already unsubscribed !');
            }
          }
        }
      };
    }
  }, [blockId, dispatch, webSocketId]);

  return useAppSelector(state => {
    if (blockId) {
      // for the moment, the only block we have is a document
      // make it more wisely when there will be something else
      const doc = state.document.documents[blockId];
      if (entityIs(doc, 'TextDataBlock')) {
        return doc;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  });
}

export function useLiveBlock({ atClass, atId, value, revision }: Props): LiveBlockState {
  const liveSession = useAppSelector(state => state.websockets.sessionId);
  const changesState = useChanges(atClass, atId);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (changesState.status === 'UNSET') {
      dispatch(API.getBlockPendingChanges(atId));
    }
  }, [changesState.status, atId, dispatch]);

  const changes = changesState.changes;

  // initial saved value is
  const valueRef = React.useRef<{
    /**
     * Root revision
     */
    initialRevision: string;
    /**
     * The current base text is the one to compute changes angainst
     */
    baseValue: string;
    /**
     * Base revision number
     */
    baseRevision: string[];
    /**
     * Current version of the text
     */
    currentValue: string;
    /**
     * already sent to the server, maybe not yet in props.changes
     */
    localChanges: Change[];
    revCounter: number;
  }>({
    initialRevision: revision,
    baseValue: value, // was serverValue.value
    currentValue: value, // was serverValue.value
    baseRevision: [revision],
    localChanges: [],
    revCounter: 0,
  });

  if (valueRef.current.initialRevision !== revision) {
    // start new changetree
    logger.info('Revision changed');
    valueRef.current.initialRevision = revision;
    valueRef.current.baseRevision = [revision];
    valueRef.current.currentValue = value;
    valueRef.current.localChanges = [];
  }

  /**
   * Memoize the throttle method
   */
  const throttledOnChange = React.useMemo(() => {
    logger.trace('Rebuild a throttle method');
    return throttle(
      (throttledValue: string) => {
        // send change to the server
        const previous = valueRef.current.baseValue;
        const next = throttledValue;
        const count = valueRef.current.revCounter + 1;

        logger.trace('Throttled from', previous, 'to', next);

        // compute change from current base to current version
        const change: Change = {
          '@class': 'Change',
          atClass: atClass,
          atId: atId,
          microchanges: LiveHelper.getMicroChange(previous, next),
          basedOn: valueRef.current.baseRevision,
          liveSession: liveSession || '',
          revision: liveSession + '::' + count,
        };
        logger.trace(' => µChanges: ', change.microchanges);

        if (change.microchanges.length > 0) {
          valueRef.current.revCounter = count;
          valueRef.current.localChanges.push(change);
          valueRef.current.baseValue = throttledValue;
          valueRef.current.baseRevision = [change.revision];

          logger.trace('Send change', change);
          //onChange(change);
          dispatch(API.patchBlock({ id: atId, change: change }));
        }
      },
      1000,
      { trailing: true },
    );
  }, [liveSession, atClass, atId, dispatch]);

  const onChange = React.useCallback(
    (value: string) => {
      logger.trace('editor onChange: ', value);
      valueRef.current.currentValue = value;
      throttledOnChange(value);
    },
    [throttledOnChange],
  );

  /* make sure to set myCounter to a correct value*/
  React.useEffect(() => {
    if (liveSession != null && valueRef.current.revCounter === 0) {
      const counter = findCounterValue(valueRef.current.initialRevision, liveSession, changes);
      valueRef.current.revCounter = counter;
    }
  }, [changes, liveSession]);

  // --- COMPUTATION -------------------------------------------------------------------------------

  logger.trace('LiveSession: ', liveSession, ' ::', valueRef.current.revCounter);
  logger.trace('Value: ', value);
  logger.trace('ServerChanges ', changes);
  logger.trace('LocalChange: ', valueRef.current.localChanges);

  // µchanges + local µchange (those already sent to the server but not yet received)
  const effectiveChanges = LiveHelper.merge(changes, valueRef.current.localChanges);

  if (effectiveChanges.duplicates && effectiveChanges.duplicates.length > 0) {
    // When local changes are received back, the stand in both changes and localChanges
    // if there is duplicates, we can saflety removed them from localChanges
    valueRef.current.localChanges = valueRef.current.localChanges.filter(
      c => !effectiveChanges.duplicates.find(dc => c.revision === dc.revision),
    );
  }
  logger.trace('CleanLocalChange: ', valueRef.current.localChanges);

  // value based on changes known by the server
  const serverValue = applyChanges(value, revision, changes);
  if (serverValue != null) {
    logger.trace('ServerValue ' + serverValue.revision + ' -> ' + serverValue.value);
    logger.trace(
      'SavedValue: ' + valueRef.current.baseRevision + ' -> ' + valueRef.current.baseValue,
    );
    logger.trace('CurrentValue: ' + valueRef.current.currentValue);
    /*
     * baseValue = ServerValue + local Microchanges
     */
    const computedBaseValue = applyChanges(value, revision, effectiveChanges.changes);

    if (computedBaseValue != null) {
      logger.trace('Local value: ' + computedBaseValue.value + ' @' + computedBaseValue.revision);

      //      if (effectiveChanges.changes.length === 0) {
      //        logger.trace('Restart new change tree, starting @', revision);
      //        valueRef.current.baseRevision = revision;
      //      }

      if (computedBaseValue.value !== valueRef.current.baseValue) {
        // The base just changed

        logger.trace('currentSavedValue: ', valueRef.current.baseValue);
        logger.trace('currentValue: ', valueRef.current.currentValue);

        // is there any pending changes from the previous base ?
        const diff = LiveHelper.getMicroChange(
          valueRef.current.baseValue,
          valueRef.current.currentValue,
        );

        if (diff.length > 0) {
          // some pending change exists
          const currentChange: Change[] = [
            ...effectiveChanges.changes,
            {
              '@class': 'Change',
              atClass: atClass,
              atId: atId,
              microchanges: diff,
              basedOn: valueRef.current.baseRevision,
              liveSession: 'internal',
              revision: 'internal.temp',
            },
          ];

          // apply pending change on new base to get up-to-date current value
          const newCurrentValue = applyChanges(value, revision, currentChange);
          if (newCurrentValue != null) {
            logger.trace('Current currentValue: ', valueRef.current.currentValue);
            logger.trace(
              'New currentValue: ',
              newCurrentValue.value,
              ' #@',
              newCurrentValue.revision,
            );

            valueRef.current.currentValue = newCurrentValue.value;
          }
        } else {
          logger.trace('Effect branch2 nothing to do: ', computedBaseValue.value);
          valueRef.current.currentValue = computedBaseValue.value;
        }

        // switch to new base
        valueRef.current.baseRevision = computedBaseValue.revision;
        valueRef.current.baseValue = computedBaseValue.value;
        throttledOnChange.cancel();
        throttledOnChange(valueRef.current.currentValue);
      }
    }
  }

  return {
    status: !liveSession ? 'DISCONNECTED' : changesState.status,
    onChange: onChange,
    currentValue: valueRef.current.currentValue,
  };
}
