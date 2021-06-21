/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { throttle } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import * as LiveHelper from '../../LiveHelper';
import { Change } from 'colab-rest-client';
import { useChanges } from '../../selectors/changeSelector';
import logger from '../../logger';
import IconButton from '../common/IconButton';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import InlineLoading from '../common/InlineLoading';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import { css } from '@emotion/css';
import ChangeTree from './ChangeTree';
import { ToastClsMarkdownEditor } from '../blocks/markdown/ToastClsMarkdownEditor';

type State = {
  status: 'SET' | 'EDITING';
};

interface Props {
  atClass: string;
  atId: number;
  value: string;
  onChange: (change: Change) => void;
}

function applyChanges(value: string, changes: Change[]) {
  try {
    return LiveHelper.process(value, changes);
  } catch {
    return { value: 'n/a', revision: 'n/a' };
  }
}

function findCounterValue(liveSession: string, changes: Change[]): number {
  return changes
    .filter(ch => ch.liveSession === liveSession)
    .map(ch => +ch.revision.replace(liveSession + '::', ''))
    .reduce((max, current) => (current > max ? current : max), 0);
}

export default function LiveTextEditor({ atClass, atId, value, onChange }: Props): JSX.Element {
  const liveSession = useAppSelector(state => state.websockets.sessionId);
  const changesState = useChanges(atClass, atId);
  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<State>({
    status: 'SET',
  });

  React.useEffect(() => {
    if (changesState.status === 'UNSET') {
      dispatch(API.getBlockPendingChanges(atId));
    }
  }, [changesState.status, atId, dispatch]);

  const changes = changesState.changes;

  // value based on changes knonw by the server
  const serverValue = applyChanges(value, changes);
  logger.info('ServerValue ' + serverValue.revision + ' -> ' + serverValue.value);

  // initial saved value is
  const valueRef = React.useRef<{
    /**
     * The current base text is the one to compute changes angainst
     */
    base: string;
    /**
     * Base revision number
     */
    revision: string;
    /**
     * Current version of the text
     */
    current: string;
    /**
     * already sent to the server, maybe not yet in props.changes
     */
    localChanges: Change[];
    revCounter: number;
  }>({
    base: serverValue.value,
    current: serverValue.value,
    revision: '0',
    localChanges: [],
    revCounter: 0,
  });

  logger.info('LiveSession: ', liveSession, ' ::', valueRef.current.revCounter);
  logger.info('SavedValue: ' + valueRef.current.revision + ' -> ' + valueRef.current.base);
  logger.info('CurrentValue: ' + valueRef.current.current);
  logger.info('SavedChanges ', changes);
  logger.info('LocalChange: ', valueRef.current.localChanges);

  // µchanges + local µchange (those already sent to the server but not yet received)
  const effectiveChanges = LiveHelper.merge(changes, valueRef.current.localChanges);

  if (effectiveChanges.duplicates && effectiveChanges.duplicates.length > 0) {
    // When local changes are received back, the stand in both changes and localChanges
    // if there is duplicates, we can saflety removed them from localChanges
    valueRef.current.localChanges = valueRef.current.localChanges.filter(
      c => !effectiveChanges.duplicates.find(dc => c.revision === dc.revision),
    );
  }

  /*
   * baseValue = ServerValue + local Microchanges
   */
  const computedBaseValue = applyChanges(value, effectiveChanges.changes);
  valueRef.current.revision = computedBaseValue.revision;

  logger.info('Local value: ' + computedBaseValue.value + ' @' + computedBaseValue.revision);

  /* make sure to set myCounter to a correct value*/
  React.useEffect(() => {
    if (liveSession != null && valueRef.current.revCounter === 0) {
      const counter = findCounterValue(liveSession, changes);
      valueRef.current.revCounter = counter + 1;
    }
  }, [changes, liveSession]);

  if (computedBaseValue.value !== valueRef.current.base) {
    // The base just changed

    logger.info('currentSavedValue: ', valueRef.current.base);
    logger.info('currentValue: ', valueRef.current.current);

    // is there any pending changes from the previous base ?
    const diff = LiveHelper.getMicroChange(valueRef.current.base, valueRef.current.current);

    if (diff.length > 0) {
      // some pending change exists
      const currentChange = [
        ...effectiveChanges.changes,
        {
          atClass: atClass,
          atId: atId,
          microchanges: diff,
          basedOn: valueRef.current.revision,
          liveSession: 'internal',
          revision: 'internal.temp',
        },
      ];

      // apply pending change on new base to get up-to-date current value
      const newCurrentValue = LiveHelper.process(value, currentChange);

      logger.info('Current currentValue: ', valueRef.current.current);
      logger.info('New currentValue: ', newCurrentValue.value, ' #@', newCurrentValue.revision);

      valueRef.current.current = newCurrentValue.value;
    } else {
      logger.info('Effect branch2 nothing to do: ', computedBaseValue.value);
      valueRef.current.current = computedBaseValue.value;
    }

    // switch to new base
    valueRef.current.base = computedBaseValue.value;
  }

  /**
   * Memoize the throttle method
   */
  const throttledOnChange = React.useMemo(() => {
    logger.info('Rebuild a throttle method');
    return throttle(
      (value: string) => {
        // send change to the server
        const previous = valueRef.current.base;
        const next = value;
        const count = valueRef.current.revCounter + 1;

        logger.info('Throttled from', previous, 'to', next);

        // compute change from current base to current version
        const change: Change = {
          atClass: atClass,
          atId: atId,
          microchanges: LiveHelper.getMicroChange(previous, next),
          basedOn: valueRef.current.revision,
          liveSession: liveSession || '',
          revision: liveSession + '::' + count,
        };
        logger.trace(' => µChanges: ', change.microchanges);

        if (change.microchanges.length > 0) {
          valueRef.current.base = value;
          valueRef.current.revCounter = count;
          valueRef.current.localChanges.push(change);
          valueRef.current.revision = change.revision;

          logger.info('Send change');
          onChange(change);
        }
      },
      500,
      { trailing: true },
    );
  }, [valueRef, liveSession, onChange, atClass, atId]);

  const onInternalChange = React.useCallback(
    (value: string) => {
      logger.info('editor onChange: ', value);
      valueRef.current.current = value;
      throttledOnChange(value);
    },
    [throttledOnChange],
  );

  if (changesState.status != 'READY') {
    return <InlineLoading />;
  }

  if (!liveSession) {
    return (
      <div>
        <div>
          <i>disconnected...</i>
        </div>
        <MarkdownViewer md={serverValue.value} />
      </div>
    );
  }

  if (state.status === 'SET') {
    return (
      <div>
        <IconButton
          title="Click to edit"
          onClick={() => setState({ ...state, status: 'EDITING' })}
          icon={faPen}
        />
        <MarkdownViewer md={valueRef.current.current} />
      </div>
    );
  } else if (state.status === 'EDITING') {
    return (
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          '& > *': {
            flexGrow: 1,
          },
        })}
      >
        <ToastClsMarkdownEditor value={valueRef.current.current} onChange={onInternalChange} />
        <MarkdownViewer md={valueRef.current.current} />
        <ChangeTree atClass={atClass} atId={atId} />
      </div>
    );
  }
  return <div>not yet implemented</div>;
}
