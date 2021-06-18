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
//import NewMarkdownEditor from "../blocks/markdown/NewMarkdownEditor";
import { ToastClsMarkdownEditor } from '../blocks/markdown/ToastClsMarkdownEditor';

type State = {
  status: 'SET' | 'EDITING';
  currentValue: string;
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

  React.useEffect(() => {
    if (changesState.status === 'UNSET') {
      dispatch(API.getBlockPendingChanges(atId));
    }
  }, [changesState.status, atId, dispatch]);

  const changes = changesState.changes;

  // value based on changes knonw by the server
  const veryValue = applyChanges(value, changes);

  logger.info('VeryValue ' + veryValue.revision + ' -> ' + veryValue.value);

  const [state, setState] = React.useState<State>({
    status: 'SET',
    currentValue: veryValue.value || '',
  });

  // initial saved value is
  const savedValue = React.useRef<{
    content: string;
    revision: string;
    /**
     * already sent to the server, maybe not yet in props.changes
     */
    localChanges: Change[];
    myCounter: number;
  }>({ content: veryValue.value, revision: '0', localChanges: [], myCounter: 0 });

  logger.info('LiveSession: ' + liveSession);
  logger.info('MyCounter: ' + savedValue.current.myCounter);
  logger.info('SavedValue: ' + savedValue.current.revision + ' -> ' + savedValue.current.content);
  logger.info('SavedChanges ', changes);
  logger.info('LocalChange: ', savedValue.current.localChanges);

  const effectiveChanges = LiveHelper.merge(changes, savedValue.current.localChanges);

  if (effectiveChanges.duplicates && effectiveChanges.duplicates.length > 0) {
    // if there is duplicates, we can saflety removed them from localChanges
    savedValue.current.localChanges = savedValue.current.localChanges.filter(
      c => !effectiveChanges.duplicates.find(dc => c.revision === dc.revision),
    );
  }

  const baseValue = applyChanges(value, effectiveChanges.changes);

  logger.info('Base value: ' + baseValue.revision + ' -> ' + baseValue.value);

  /* make sure to set myCounter */
  React.useEffect(() => {
    if (liveSession != null && savedValue.current.myCounter === 0) {
      const counter = findCounterValue(liveSession, changes);
      savedValue.current.myCounter = counter + 1;
    }
  }, [changes, liveSession]);

  // todo: useEffect here!!!!!!
  React.useEffect(() => {
    if (baseValue.value !== savedValue.current.content) {
      // rebase internal values
      const diff = LiveHelper.getMicroChange(savedValue.current.content, state.currentValue);

      if (diff.length > 0) {
        const currentChange = [
          ...effectiveChanges.changes,
          {
            atClass: atClass,
            atId: atId,
            microchanges: diff,
            basedOn: savedValue.current.revision,
            liveSession: 'internal',
            revision: 'internal.temp',
          },
        ];

        const currentValue = LiveHelper.process(value, currentChange);
        logger.info('New currentValue: ' + currentValue.revision + ' -> ' + currentValue.value);

        savedValue.current.content = baseValue.value;
        savedValue.current.revision = baseValue.revision;

        setState(state => ({
          ...state,
          currentValue: currentValue.value,
        }));
      } else {
        savedValue.current.content = baseValue.value;
        savedValue.current.revision = baseValue.revision;

        setState(state => ({
          ...state,
          currentValue: baseValue.value,
        }));
      }
    }
  }, [
    baseValue.value,
    baseValue.revision,
    value,
    effectiveChanges.changes,
    atClass,
    atId,
    state.currentValue,
  ]);

  /**
   * Memoize the throttle method
   */
  const throttledOnChange = React.useMemo(() => {
    logger.info('Rebuild a throttle method');
    return throttle(
      (value: string) => {
        logger.info('Throttled');
        const previous = savedValue.current.content;
        const next = value;
        const count = savedValue.current.myCounter + 1;
        const change: Change = {
          atClass: atClass,
          atId: atId,
          microchanges: LiveHelper.getMicroChange(previous, next),
          basedOn: savedValue.current.revision,
          liveSession: liveSession || '',
          revision: liveSession + '::' + count,
        };
        if (change.microchanges.length > 0) {
          savedValue.current.content = value;
          savedValue.current.myCounter = count;
          savedValue.current.localChanges.push(change);
          savedValue.current.revision = change.revision;

          logger.info('Send change');
          onChange(change);
        }
      },
      500,
      { trailing: true },
    );
  }, [savedValue, liveSession, onChange, atClass, atId]);

  const onInternalChange = React.useCallback(
    (value: string) => {
      throttledOnChange(value);
      setState(state => ({ ...state, currentValue: value }));
    },
    [throttledOnChange],
  );

  const onTextareaInternalChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      throttledOnChange(e.target.value);
      setState(state => ({ ...state, currentValue: e.target.value }));
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
        <MarkdownViewer md={veryValue.value} />
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
        <MarkdownViewer md={state.currentValue} />
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
        <ToastClsMarkdownEditor value={state.currentValue} onChange={onInternalChange} />
        <textarea value={state.currentValue} onChange={onTextareaInternalChange} />
        <MarkdownViewer md={state.currentValue} />
        <ChangeTree atClass={atClass} atId={atId} />
      </div>
    );
  }
  return <div>not yet implemented</div>;
}
