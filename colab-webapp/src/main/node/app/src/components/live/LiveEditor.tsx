/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
import { space_S } from '../styling/style';
import ChangeTree from './ChangeTree';
import { useLiveBlock } from './LiveTextEditor';

const shrink = css({
  flexGrow: 0,
  flexShrink: 1,
});

export type EditState = {
  status: 'VIEW' | 'EDIT';
};

interface Props {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
  allowEdition?: boolean;
  editingStatus: EditState;
  closeEditing?: () => void;
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
  editingStatus,
  closeEditing,
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
        <MarkdownViewer md={currentValue} />
      </ErrorBoundary>
    );
  } else {
    if (editingStatus.status === 'VIEW') {
      return (
        <Flex 
        //onClick={()=>logger.info(editingStatus)}
          //() => setState({ ...state, status: 'EDIT' })}
        >
          <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
            <MarkdownViewer md={currentValue} />
          </ErrorBoundary>
        </Flex>
      );
    } else if (editingStatus.status === 'EDIT') {
      return (
        <Flex
          direction="column"
          align="stretch"
          className={css({ backgroundColor: 'var(--hoverBgColor)', padding: space_S })}
        >
          <Flex justify="space-between">
            <Flex align="center">
              <Tips tipsType="TODO">
                TODO: add more styling options (headings level, lists, ...
              </Tips>
              <Toggler label="Show Tree" value={showTree} onChange={setShowTree} />
              <Toggler label="WYSIWYG" value={wysiwyg} onChange={setWysiwyg} />
            </Flex>
            <IconButton
              title="close editor"
              onClick={closeEditing}
              icon={faTimes}
            />
            
          </Flex>
          <Flex>
            {wysiwyg ? (
              <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                <WysiwygEditor
                  className={css({ alignItems: 'stretch' })}
                  value={currentValue}
                  onChange={onChange}
                />
              </ErrorBoundary>
            ) : (
              <Flex grow={1} align="stretch">
                <CleverTextarea
                  className={css({ minHeight: '100px', flexGrow: 1, flexBasis: '1px' })}
                  value={currentValue}
                  onChange={onChange}
                />
                <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                  <MarkdownViewer
                    className={css({ padding: '3px', flexGrow: 1, flexBasis: '1px' })}
                    md={currentValue}
                  />
                </ErrorBoundary>
              </Flex>
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
