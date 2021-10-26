/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {css} from '@emotion/css';
import {faPen, faProjectDiagram, faTimes} from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {useAppSelector} from '../../store/hooks';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import CleverTextarea from '../common/CleverTextarea';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
//import ToastFnMarkdownEditor from '../blocks/markdown/ToastFnMarkdownEditor';
import OpenClose from '../common/OpenClose';
import WithToolbar from '../common/WithToolbar';
import ChangeTree from './ChangeTree';
import {useLiveBlock} from './LiveTextEditor';

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
  allowEdition?: boolean;
}

export default function LiveEditor({
  atClass,
  atId,
  value,
  revision,
  allowEdition,
}: Props): JSX.Element {
  const liveSession = useAppSelector(state => state.websockets.sessionId);

  const {currentValue, onChange, status} = useLiveBlock({
    atClass: atClass,
    atId: atId,
    value: value,
    revision: revision
  });

  const [state, setState] = React.useState<State>({
    status: 'VIEW',
  });

  if (status != 'READY') {
    return <InlineLoading />;
  }

  if (!liveSession) {
    return (
      <div>
        <div>
          <i>disconnected...</i>
        </div>
        <MarkdownViewer md={currentValue} />
      </div>
    );
  }

  if (!allowEdition) {
    return <MarkdownViewer md={currentValue} />
  } else {
    if (state.status === 'VIEW') {
      return (
        <WithToolbar
          toolbarPosition="TOP_RIGHT"
          toolbarClassName=""
          offsetY={-1}
          toolbar={
            <IconButton
              title="Click to edit"
              onClick={() => setState({...state, status: 'EDIT'})}
              icon={faPen}
            />
          }
        >
          <MarkdownViewer md={currentValue} />
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
            value={currentValue}
            onChange={onChange}
          />
          <MarkdownViewer className={grow} md={currentValue} />
          <div className={shrink}>
            <OpenClose collapsedChildren={<IconButton icon={faProjectDiagram} />}>
              {() => <ChangeTree atClass={atClass} atId={atId} value={value} revision={revision} />}
            </OpenClose>
          </div>
          <IconButton
            title="close editor"
            className={shrink}
            onClick={() => setState({...state, status: 'VIEW'})}
            icon={faTimes}
          />
        </div>
      );
    }
  }
  return <div>not yet implemented</div>;
}
