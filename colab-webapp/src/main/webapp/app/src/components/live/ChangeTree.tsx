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
  showBasedOn = false,
}: {
  change: Change;
  showBasedOn?: boolean;
}): JSX.Element {
  const rev = change.basedOn.startsWith(change.liveSession)
    ? change.basedOn.replace(change.liveSession, '')
    : change.basedOn;

  return (
    <div>
      {change.revision}
      {showBasedOn ? ` on ${rev}` : null}
    </div>
  );
}

interface Props {
  atClass: string;
  atId: number;
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

export default function ChangeTree({ atClass, atId }: Props): JSX.Element {
  const changesState = useChanges(atClass, atId);
  const dispatch = useAppDispatch();

  const [treeState, setTree] = React.useState<{ tree: Tree; orphans: Change[] }>();

  React.useEffect(() => {
    if (changesState.status === 'UNSET') {
      dispatch(API.getBlockPendingChanges(atId));
    }
  }, [changesState.status, atId, dispatch]);

  React.useEffect(() => {
    const toProcess = [...changesState.changes];

    const treeMap: { [rev: string]: Tree } = {};
    treeMap['0'] = { revision: '0', comp: <span>root</span>, children: [] };

    const queue: string[] = ['0'];

    while (queue.length > 0) {
      // process children of current revision
      const currentRev = queue.shift()!;
      const children = toProcess.filter(ch => ch.basedOn === currentRev);
      const currentTree = treeMap[currentRev]!;

      children.forEach(child => {
        queue.push(child.revision);
        treeMap[child.revision] = {
          revision: child.revision,
          comp: <ChangeDisplay change={child} showBasedOn />,
          children: [],
        };
        currentTree.children.push(treeMap[child.revision]!);
      });
      //
      removeAllItems(toProcess, children);
    }

    setTree({ tree: treeMap['0'], orphans: toProcess });
  }, [changesState.changes]);

  const deleteCb = React.useCallback(() => {
    dispatch(API.deletePendingChanges(atId));
  }, [dispatch, atId]);

  if (treeState != null) {
    return (
      <div>
        <h4>Tree</h4>
        <IconButton icon={faTrash} onClick={deleteCb} />
        <TreeDisplay tree={treeState.tree} />
        <h4>Orphans</h4>
        {treeState.orphans.map(change => (
          <ChangeDisplay key={change.revision} change={change} showBasedOn />
        ))}
      </div>
    );
  } else {
    return <InlineLoading />;
  }
}
