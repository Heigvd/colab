/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import WysiwygEditor from '../blocks/markdown/WysiwygEditor';
import CleverTextarea from '../common/CleverTextarea';
import ErrorBoundary from '../common/ErrorBoundary';
import Flex from '../common/Flex';
import Toggler from '../common/Form/Toggler';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import Tips from '../common/Tips';
import WithToolbar from '../common/WithToolbar';
import ChangeTree from './ChangeTree';
import { useLiveBlock } from './LiveTextEditor';

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

function Unsupported({ md }: { md: string }) {
  return (
    <div>
      <div className={css({ margin: '5px', padding: '5px', border: '1px solid red' })}>
        <em>
          Your browser does not support to display this text in its pretty form. Our technicians are
          on the case.
        </em>
      </div>
      <pre>{md}</pre>
    </div>
  );
}

export default function LiveEditor({
  atClass,
  atId,
  value,
  revision,
  allowEdition,
}: Props): JSX.Element {
  const liveSession = useAppSelector(state => state.websockets.sessionId);

  const { currentValue, onChange, status } = useLiveBlock({
    atClass: atClass,
    atId: atId,
    value: value,
    revision: revision,
  });

  const [wysiwyg, setWysiwyg] = React.useState(false);
  const [showTree, setShowTree] = React.useState(false);

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
        <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
          <MarkdownViewer md={currentValue} />
        </ErrorBoundary>
      </div>
    );
  }

  if (!allowEdition) {
    return (
      <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
        <MarkdownViewer md={currentValue} />;
      </ErrorBoundary>
    );
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
              onClick={() => setState({ ...state, status: 'EDIT' })}
              icon={faPen}
            />
          }
        >
          <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
            <MarkdownViewer md={currentValue} />
          </ErrorBoundary>
        </WithToolbar>
      );
    } else if (state.status === 'EDIT') {
      return (
        <Flex direction="column">
          <Flex>
            <Tips tipsType="TODO">TODO: add more styling options (headings level, lists, ...</Tips>
            <Toggler label="Show Tree" value={showTree} onChange={setShowTree} />
            <Toggler label="WYSIWYG" value={wysiwyg} onChange={setWysiwyg} />
          </Flex>
          <Flex>
            {wysiwyg ? (
              <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                <WysiwygEditor className={grow} value={currentValue} onChange={onChange} />
              </ErrorBoundary>
            ) : (
              <>
                <CleverTextarea className={grow} value={currentValue} onChange={onChange} />
                <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                  <MarkdownViewer className={grow} md={currentValue} />
                </ErrorBoundary>
              </>
            )}
            {showTree ? (
              <div className={shrink}>
                <ChangeTree atClass={atClass} atId={atId} value={value} revision={revision} />
              </div>
            ) : null}
          </Flex>
          <IconButton
            title="close editor"
            className={shrink}
            onClick={() => setState({ ...state, status: 'VIEW' })}
            icon={faTimes}
          />
        </Flex>
      );
    }
  }
  return <div>not yet implemented</div>;
}
