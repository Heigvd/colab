/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Change } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { removeAllItems } from '../../helper';
import * as LiveHelper from '../../LiveHelper';
import { useChanges } from '../../selectors/changeSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';

function truncateRevision(revisionTag: string) {
  return '...' + revisionTag.substring(revisionTag.indexOf('::') - 3);
}

type DivRefType = Record<string, Element>;

const defs = (
  <defs>
    <marker orient="auto" refY="0.0" refX="0.0" id="triangleStart" style={{ overflow: 'visible' }}>
      <path id="triangle_start_path" d="M 8.5,5 L 0,0 L 8.5,-5 L 8.5,5 z " />
    </marker>
    <marker orient="auto" refY="0.0" refX="0.0" id="triangleEnd" style={{ overflow: 'visible' }}>
      <path id="triangle_end_path" d="M 0,0.0 L -8,5.0 L -8,-5.0 L 0,0.0 z " />
    </marker>
  </defs>
);

const pathStyle = css({
  stroke: 'black',
  strokeWidth: '1px',
  markerEnd: ' url(#triangleEnd)',
});

function Arrow({ id, divRefs }: { id: string; divRefs: DivRefType }): JSX.Element {
  return (
    <svg
      ref={ref => {
        if (ref != null) {
          divRefs[id] = ref;
        } else {
          delete divRefs[id];
        }
      }}
      className={css({
        position: 'absolute',
        width: '100px',
        height: '100px',
        overflow: 'visible',
      })}
    >
      {defs}
      <path className={pathStyle} d="M 0 0 100 100" />
    </svg>
  );
}

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
        <div>
          {change.basedOn.map(dep => (
            <Arrow key={dep} id={`${change.revision}-${dep}`} divRefs={divRefs} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
}

export interface ChangeTreeProps {
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
}: ChangeTreeProps): JSX.Element {
  const divRefs = React.useRef<DivRefType>({});

  const toProcess = [...changes];

  const processed: string[] = [];

  const queue: string[][] = [[revision]];

  const lines: JSX.Element[] = [];

  const processedValue = LiveHelper.process(value, revision, changes);

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

  React.useLayoutEffect(() => {
    changes.forEach(change => {
      const refFrom = divRefs.current[change.revision];
      change.basedOn.forEach(dep => {
        const depId = change.revision + '-' + dep;
        const refRoot = divRefs.current['root'];
        const deltaX = refRoot ? refRoot.getBoundingClientRect().left : 0;
        const deltaY = refRoot ? refRoot.getBoundingClientRect().top : 0;

        const refTo = divRefs.current[dep];
        const refArrow = divRefs.current[depId];
        if (refArrow != null) {
          const path = refArrow.children[1];
          if (path != null) {
            if (refFrom != null && refTo != null) {
              let newPath = 'M ';
              const fromBbox = refFrom.getBoundingClientRect();
              const toBbox = refTo.getBoundingClientRect();
              const fromX = fromBbox.x + fromBbox.width / 2 - deltaX;
              const fromY = fromBbox.top - deltaY;

              const toX = toBbox.x + toBbox.width / 2 - deltaX;
              const toY = toBbox.bottom - deltaY;

              const arrowBox = [Math.abs(fromX - toX), Math.abs(fromY - toY)];
              const arrowX = Math.min(fromX, toX);
              //const arrowY = Math.min(fromY, toY);

              refArrow.setAttribute(
                'style',
                `top: ${toY}px; left: ${arrowX}px; width: ${arrowBox[0]}px; height: ${arrowBox[1]}px`,
              );

              if (fromX <= toX && fromY > toY) {
                newPath = `M 0 ${fromY - toY} ${toX - fromX} 0`;
              } else if (fromX > toX && fromY > toY) {
                newPath = `M ${fromX - toX} ${fromY - toY} 0 0`;
              }

              path.setAttribute('d', newPath);
            } else {
              path.setAttribute('style', 'display: none;');
            }
          }
        }
      });
    });
  }, [changes]);

  return (
    <div>
      <h4>Tree</h4>
      {onDelete ? <IconButton icon={faTrash} onClick={onDelete} /> : null}
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
      <h4>Orphans</h4>
      {toProcess.map(change => {
        <ChangeDisplay key={change.revision} change={change} divRefs={divRefs.current} />;
      })}
      <h4>Result</h4>
      <div>
        "{processedValue.value}" basedOn {processedValue.revision.map(truncateRevision)}
      </div>
    </div>
  );
}

export default function ChangeTree({ atClass, atId, value, revision }: Props): JSX.Element {
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
