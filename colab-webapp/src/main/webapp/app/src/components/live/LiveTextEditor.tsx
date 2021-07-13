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
import { faPen, faProjectDiagram, faTimes } from '@fortawesome/free-solid-svg-icons';
import InlineLoading from '../common/InlineLoading';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import { css } from '@emotion/css';
import ChangeTree from './ChangeTree';
import CleverTextarea from '../common/CleverTextarea';
//import ToastFnMarkdownEditor from '../blocks/markdown/ToastFnMarkdownEditor';
import OpenClose from '../common/OpenClose';
import WithToolbar from '../common/WithToolbar';
//import {ToastClsMarkdownEditor} from '../blocks/markdown/ToastClsMarkdownEditor';

const shrink = css({
  flexGrow: 0,
  flexShrink: 1,
});

const grow = css({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: '1px',
});

type State = {
  status: 'VIEW' | 'EDIT';
};

interface Props {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
  onChange: (change: Change) => void;
}

function applyChanges(value: string, revision: string, changes: Change[]) {
  try {
    return LiveHelper.process(value, revision, changes);
  } catch {
    return null;
  }
}

function findCounterValue(liveSession: string, changes: Change[]): number {
  return changes
    .filter(ch => ch.liveSession === liveSession)
    .map(ch => +ch.revision.replace(liveSession + '::', ''))
    .reduce((max, current) => (current > max ? current : max), 0);
}

export default function LiveTextEditor({
  atClass,
  atId,
  value,
  revision,
  onChange,
}: Props): JSX.Element {
  const liveSession = useAppSelector(state => state.websockets.sessionId);
  const changesState = useChanges(atClass, atId);
  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<State>({
    status: 'VIEW',
  });

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
    baseRevision: string;
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
    baseRevision: revision,
    localChanges: [],
    revCounter: 0,
  });

  if (valueRef.current.initialRevision !== revision) {
    // start new changetree
    logger.info('Revision changed');
    valueRef.current.initialRevision = revision;
    valueRef.current.baseRevision = revision;
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
          valueRef.current.baseRevision = change.revision;

          logger.trace('Send change', change);
          onChange(change);
        }
      },
      500,
      { trailing: true },
    );
  }, [valueRef, liveSession, onChange, atClass, atId]);

  const onInternalChange = React.useCallback(
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
      const counter = findCounterValue(liveSession, changes);
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

  // value based on changes knonw by the server
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

      if (effectiveChanges.changes.length === 0) {
        logger.trace('Restart new change tree, starting @', revision);
        valueRef.current.baseRevision = revision;
      }

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

  if (changesState.status != 'READY') {
    return <InlineLoading />;
  }

  if (!liveSession) {
    return (
      <div>
        <div>
          <i>disconnected...</i>
        </div>
        <MarkdownViewer md={valueRef.current.currentValue} />
      </div>
    );
  }

  if (state.status === 'VIEW') {
    return (
      <WithToolbar
        toolbarPosition="TOP_RIGHT"
        toolbarClassName=""
        offsetY={-1}
        toolbar={
          <IconButton
            title="Click to edit"
            onClick={() => setState({ ...state, status: 'EDIT' })}
            icon={faPen}
          />
        }
      >
        <MarkdownViewer md={valueRef.current.currentValue} />
      </WithToolbar>
    );
  } else if (state.status === 'EDIT') {
    return (
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
        })}
      >
        {/*<ToastClsMarkdownEditor value={valueRef.current.current} onChange={onInternalChange} />*/}
        <CleverTextarea
          className={grow}
          value={valueRef.current.currentValue}
          onChange={onInternalChange}
        />
        <MarkdownViewer className={grow} md={valueRef.current.currentValue} />
        <div className={shrink}>
          <OpenClose collaspedChildren={<IconButton icon={faProjectDiagram} />}>
            {() => <ChangeTree atClass={atClass} atId={atId} revision={revision} />}
          </OpenClose>
        </div>
        <IconButton
          title="close editor"
          className={shrink}
          onClick={() => setState({ ...state, status: 'VIEW' })}
          icon={faTimes}
        />
      </div>
    );
  }
  return <div>not yet implemented</div>;
}
