/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import '@jsplumb/connector-bezier';
import '@jsplumb/connector-flowchart';
import { Change } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { removeAllItems } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import * as LiveHelper from '../../LiveHelper';
import { useChanges } from '../../selectors/changeSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';

function truncateRevision(revisionTag: string) {
  return '...' + revisionTag.substring(revisionTag.indexOf('::') - 3);
}

type DivRefType = Record<string, Element>;

function ChangeDisplay({
  change,
  divRefs,
  displayDeps = false,
  displayChanges = false,
}: {
  change: Change;
  divRefs: DivRefType;
  displayDeps?: boolean;
  displayChanges?: boolean;
}): JSX.Element {
  //  const rev = change.basedOn.startsWith(change.liveSession)
  //    ? change.basedOn.replace(change.liveSession, '')
  //    : change.basedOn;

  const rev = change.basedOn.map(truncateRevision).join(' & ');

  return (
    <div className={css({ padding: '5px', margin: '5px' })}>
      <div
        ref={ref => {
          if (ref != null) {
            divRefs[change.revision] = ref;
          } else {
            delete divRefs[change.revision];
          }
        }}
        className={css({ padding: '5px', margin: '5px' })}
      >
        [{truncateRevision(change.revision)}]{displayDeps ? ` on ${truncateRevision(rev)}` : null}
        {displayChanges
          ? change.microchanges.map((mu, i) => {
              return (
                <span key={i}>
                  {mu.t === 'I' ? ` insert '${mu.v}'@${mu.o}` : ` delete ${mu.l}@${mu.o}`}{' '}
                </span>
              );
            })
          : null}
      </div>
    </div>
  );
}

interface ChangeTreeProps {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
}

export interface ChangeTreeRawProps {
  value: string;
  changes: Change[];
  revision: string;
  onDelete?: () => void;
}

export function ChangeTreeRaw({
  value,
  changes,
  revision,
  onDelete,
}: ChangeTreeRawProps): JSX.Element {
  const i18n = useTranslations();
  const divRefs = React.useRef<DivRefType>({});

  const toProcess = [...changes];

  const processed: string[] = [];

  const queue: string[][] = [[revision]];

  const lines: JSX.Element[] = [];

  const processedValue = LiveHelper.process(value, revision, changes);
  const [plumb, setPlumb] = React.useState<BrowserJsPlumbInstance | undefined>(undefined);

  React.useEffect(() => {
    const plumb = newInstance({
      container: divRefs.current['root'],
      connector: { type: 'Straight', options: { stub: 10 } },
      paintStyle: { strokeWidth: 1, stroke: 'black' },
      anchor: 'AutoDefault',
      endpoints: [
        { type: 'Dot', options: { radius: 2 } },
        { type: 'Blank', options: {} },
      ],
      connectionOverlays: [
        {
          type: 'Arrow',
          options: { location: 1, width: 10, length: 5 },
        },
      ],
    });

    setPlumb(plumb);

    () => {
      //clean
      plumb.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (plumb != undefined) {
      // redraw everything
      plumb.connections.forEach(c => plumb.deleteConnection(c));
      changes.map(change => {
        change.basedOn.map(link => {
          plumb.connect({
            source: divRefs.current[change.revision],
            target: divRefs.current[link],
          });
        });
      });
    }
  }, [plumb, changes]);

  while (queue.length > 0) {
    const currentRevisions = queue.shift()!;
    // children which depend on at least one currentRevision
    processed.push(...currentRevisions);
    const children = toProcess.filter(change =>
      currentRevisions.find(rev => change.basedOn.find(parent => parent === rev)),
    );
    // keep only children with processed parents
    const toDisplay = children.filter(child =>
      child.basedOn.reduce<boolean>((acc, cur) => {
        if (!acc) {
          return false;
        } else {
          return processed.indexOf(cur) >= 0;
        }
      }, true),
    );

    if (toDisplay.length) {
      removeAllItems(toProcess, toDisplay);

      const toQueue = toDisplay.reduce<string[]>((acc, cur) => {
        if (acc.indexOf(cur.revision) === -1) {
          acc.push(cur.revision);
        }
        return acc;
      }, []);

      queue.push(toQueue);

      //  divref={refs[child.revision]}
      lines.push(
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
          })}
        >
          {toDisplay.map(child => (
            <ChangeDisplay
              divRefs={divRefs.current}
              key={child.revision}
              change={child}
              displayChanges
            />
          ))}
        </div>,
      );
    }
  }

  return (
    <div>
      <h4>{i18n.modules.content.tree}</h4>
      {onDelete ? (
        <IconButton icon={faTrash} title={i18n.common.delete} onClick={onDelete} />
      ) : null}
      <div
        ref={ref => {
          if (ref != null) {
            divRefs.current['root'] = ref;
          } else {
            delete divRefs.current['root'];
          }
        }}
        className={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        })}
      >
        {lines.map((line, i) => (
          <div key={i} className={css({ width: 'max-content' })}>
            {line}
          </div>
        ))}
      </div>
      <h4>{i18n.modules.content.orphans}</h4>
      <>
        {toProcess.map(change => {
          <ChangeDisplay key={change.revision} change={change} divRefs={divRefs.current} />;
        })}
      </>
      <h4>{i18n.modules.content.result}</h4>
      <div>
        "{processedValue.value}" basedOn {processedValue.revision.map(truncateRevision)}
      </div>
    </div>
  );
}

export default function ChangeTree({
  atClass,
  atId,
  value,
  revision,
}: ChangeTreeProps): JSX.Element {
  const changesState = useChanges(atClass, atId);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (changesState.status === 'UNSET') {
      dispatch(API.getBlockPendingChanges(atId));
    }
  }, [changesState.status, atId, dispatch]);

  const deleteCb = React.useCallback(() => {
    dispatch(API.deletePendingChanges(atId));
  }, [dispatch, atId]);

  if (changesState.status === 'READY') {
    return (
      <ChangeTreeRaw
        value={value}
        changes={changesState.changes}
        revision={revision}
        onDelete={deleteCb}
      />
    );
  } else {
    return <InlineLoading />;
  }
}
