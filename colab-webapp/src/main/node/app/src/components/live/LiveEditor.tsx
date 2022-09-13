/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import WysiwygEditor, { TXTFormatToolbarProps } from '../blocks/markdown/WysiwygEditor';
import Button from '../common/element/Button';
import CleverTextarea from '../common/element/CleverTextarea';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import ErrorBoundary from '../common/toplevel/ErrorBoundary';
import { space_S } from '../styling/style';
import ChangeTree from './ChangeTree';
import { useLiveBlock } from './LiveTextEditor';

const shrink = css({
  flexGrow: 0,
  flexShrink: 1,
});

export type EditState = 'VIEW' | 'EDIT';

interface LiveEditorProps {
  atClass: string;
  atId: number;
  value: string;
  healthy: boolean;
  revision: string;
  readOnly?: boolean;
  editingStatus?: boolean;
  showTree?: boolean;
  markDownEditor?: boolean;
  className?: string;
  selected?: boolean;
  flyingToolBar?: boolean;
  toolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
}

const unsupportedText =
  'Your browser does not support to display this text in its pretty form. Our technicians are on the case.';

const unhealthyText = (
  <>
    <p>Some updates could not be taken into account and will be lost.</p>
    <p>Click on the "rollback" button to restore the previous version</p>
  </>
);

function Disclaimer({ children, md }: { children?: React.ReactNode; md: string }) {
  return (
    <div>
      <div className={css({ margin: '5px', padding: '5px', border: '1px solid red' })}>
        <em>{children || unsupportedText}</em>
      </div>
      <pre>{md}</pre>
    </div>
  );
}

export default function LiveEditor({
  atClass,
  atId,
  value,
  healthy,
  revision,
  readOnly,
  editingStatus,
  showTree,
  markDownEditor,
  className,
  selected,
  flyingToolBar,
  toolBar,
}: LiveEditorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const liveSession = useAppSelector(state => state.websockets.sessionId);

  const { currentValue, onChange, status } = useLiveBlock({
    atClass: atClass,
    atId: atId,
    value: value,
    revision: revision,
  });

  if (status === 'DISCONNECTED' || status === 'UNSET' || status === 'LOADING') {
    return <InlineLoading />;
  }

  if (!liveSession) {
    return (
      <div>
        <div>
          <em>disconnected...</em>
        </div>
        <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
          <MarkdownViewer md={currentValue} />
        </ErrorBoundary>
      </div>
    );
  }

  if (readOnly) {
    return (
      <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
        <MarkdownViewer md={currentValue} />
      </ErrorBoundary>
    );
  } else if (!healthy) {
    return (
      <Flex direction="column">
        <Disclaimer md="">{unhealthyText}</Disclaimer>
        <Button
          title="Restore previous version"
          icon={faRotateLeft}
          onClick={() => {
            dispatch(API.deletePendingChanges(atId));
          }}
        >
          Restore previous version
        </Button>
        <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
          <MarkdownViewer md={currentValue} />
        </ErrorBoundary>
      </Flex>
    );
  } else if (status === 'ERROR') {
    return (
      <Flex direction="column">
        <Disclaimer md="">{unhealthyText}</Disclaimer>
        <Button
          title="Restore previous version"
          icon={faRotateLeft}
          onClick={() => {
            dispatch(API.deletePendingChanges(atId));
          }}
        >
          Restore previous version
        </Button>
        <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
          <MarkdownViewer md={currentValue} />
        </ErrorBoundary>
      </Flex>
    );
  } else {
    if (!editingStatus) {
      return (
        <Flex className={className}>
          <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
            <MarkdownViewer md={currentValue} />
          </ErrorBoundary>
        </Flex>
      );
    } else if (editingStatus) {
      return (
        <Flex direction="column" align="stretch" className={className}>
          <Flex>
            {markDownEditor ? (
              <Flex grow={1} align="stretch">
                <CleverTextarea
                  className={css({
                    minHeight: '50px',
                    flexGrow: 1,
                    flexBasis: '1px',
                    padding: space_S,
                  })}
                  value={currentValue}
                  onChange={onChange}
                />
                <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
                  <MarkdownViewer
                    className={css({ padding: space_S, flexGrow: 1, flexBasis: '1px' })}
                    md={currentValue}
                  />
                </ErrorBoundary>
              </Flex>
            ) : (
              <ErrorBoundary fallback={<Disclaimer md={currentValue} />}>
                <WysiwygEditor
                  className={css({ alignItems: 'stretch' })}
                  value={currentValue}
                  docToTouchId={atClass === 'TextDataBlock' ? atId : undefined}
                  onChange={onChange}
                  selected={selected}
                  flyingToolBar={flyingToolBar}
                  ToolBar={toolBar}
                />
              </ErrorBoundary>
            )}
            {showTree ? (
              <div className={shrink}>
                <ChangeTree atClass={atClass} atId={atId} value={value} revision={revision} />
              </div>
            ) : null}
          </Flex>
        </Flex>
      );
    }
  }
  return <div>not yet implemented</div>;
}
