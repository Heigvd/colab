/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';

import { Change } from 'colab-rest-client';
import { useChanges } from '../../selectors/changeSelector';
import InlineLoading from '../common/InlineLoading';
import { css } from '@emotion/css';
import IconButton from '../common/IconButton';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { removeAllItems } from '../../helper';

function ChangeDisplay({
  change,
  verbosity = 'AVERAGE',
}: {
  change: Change;
  verbosity?: 'SMALL' | 'AVERAGE' | 'FULL';
}): JSX.Element {
  const rev = change.basedOn.startsWith(change.liveSession)
    ? change.basedOn.replace(change.liveSession, '')
    : change.basedOn;

  return (
    <div>
      {change.revision}
      {verbosity !== 'SMALL' ? ` on ${rev}` : null}
      {verbosity === 'FULL'
        ? change.microchanges.map((mu, i) => {
            return (
              <span key={i}>
                {mu.t === 'I' ? ` insert '${mu.v}'@${mu.o}` : ` delete ${mu.l}@${mu.o}`}{' '}
              </span>
            );
          })
        : null}
    </div>
  );
}

interface Props {
  atClass: string;
  atId: number;
  revision: string;
}

interface Tree {
  revision: string;
  comp: JSX.Element;
  children: Tree[];
}

const border = css({
  border: '1px solid lightgrey',
});

function TreeDisplay({ tree }: { tree: Tree }): JSX.Element {
  return (
    <div className={css({ marginLeft: '2px' })}>
      <div className={border}>{tree.comp}</div>
      <div
        className={css({
          display: 'flex',
          borderTop: '2px solid hotpink',
        })}
      >
        {tree.children.map(child => (
          <TreeDisplay key={child.revision} tree={child} />
        ))}
      </div>
    </div>
  );
}

export interface ChangeTreeProps {
  changes: Change[];
  revision: string;
  onDelete?: () => void;
  verbosity?: 'SMALL' | 'AVERAGE' | 'FULL';
}

export function ChangeTreeRaw({
  changes,
  revision,
  onDelete,
  verbosity = 'AVERAGE',
}: ChangeTreeProps): JSX.Element {
  const [treeState, setTree] = React.useState<{ tree: Tree; orphans: Change[] }>();

  React.useEffect(() => {
    const toProcess = [...changes];

    const treeMap: { [rev: string]: Tree } = {};
    treeMap[revision] = { revision: revision, comp: <span>{revision}</span>, children: [] };

    const queue: string[] = [revision];

    while (queue.length > 0) {
      // process children of current revision
      const currentRev = queue.shift()!;
      const children = toProcess.filter(ch => ch.basedOn === currentRev);
      const currentTree = treeMap[currentRev]!;

      children.forEach(child => {
        queue.push(child.revision);
        treeMap[child.revision] = {
          revision: child.revision,
          comp: <ChangeDisplay change={child} verbosity={verbosity} />,
          children: [],
        };
        currentTree.children.push(treeMap[child.revision]!);
      });
      //
      removeAllItems(toProcess, children);
    }

    setTree({ tree: treeMap[revision]!, orphans: toProcess });
  }, [changes, revision]);

  if (treeState != null) {
    return (
      <div>
        <h4>Tree</h4>
        {onDelete ? <IconButton icon={faTrash} onClick={onDelete} /> : null}
        <TreeDisplay tree={treeState.tree} />
        <h4>Orphans</h4>
        {treeState.orphans.map(change => (
          <ChangeDisplay key={change.revision} change={change} verbosity={verbosity} />
        ))}
      </div>
    );
  } else {
    return <InlineLoading />;
  }
}

export default function ChangeTree({ atClass, atId, revision }: Props): JSX.Element {
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
    return <ChangeTreeRaw changes={changesState.changes} revision={revision} onDelete={deleteCb} />;
  } else {
    return <InlineLoading />;
  }
}
