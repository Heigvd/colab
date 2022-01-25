/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {css} from '@emotion/css';
import {faPen, faTimes} from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {useAppSelector} from '../../store/hooks';
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
import {space_S} from '../styling/style';
import ChangeTree from './ChangeTree';
import {useLiveBlock} from './LiveTextEditor';

const shrink = css({
  flexGrow: 0,
  flexShrink: 1,
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

function Unsupported({md}: {md: string}) {
  return (
    <div>
      <div className={css({margin: '5px', padding: '5px', border: '1px solid red'})}>
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

  const {currentValue, onChange, status} = useLiveBlock({
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
        <Flex
          className={css({
            border: '1px solid rgb(240, 240, 240)',
            margin: '3px 0',
            padding: space_S,
            '&:hover': {
              backgroundColor: 'var(--hoverBgColor)',
              border: '1px solid transparent',
              cursor: 'pointer',
            },
          })}
          onClick={() => setState({...state, status: 'EDIT'})}
        >
          <WithToolbar
            toolbarPosition="TOP_RIGHT"
            toolbarClassName=""
            offsetY={-1}
            toolbar={
              <IconButton title="Click to edit" icon={faPen} iconColor="var(--darkGray)" />
            }
          >
            <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
              <MarkdownViewer md={currentValue} />
            </ErrorBoundary>
          </WithToolbar>
        </Flex>
      );
    } else if (state.status === 'EDIT') {
      return (
        <Flex direction="column" align='stretch' className={css({backgroundColor: 'var(--hoverBgColor)', padding: space_S})}>
          <Flex justify='space-between'>
            <Flex align='center'>
              <Tips tipsType="TODO">TODO: add more styling options (headings level, lists, ...</Tips>
              <Toggler label="Show Tree" value={showTree} onChange={setShowTree} />
              <Toggler label="WYSIWYG" value={wysiwyg} onChange={setWysiwyg} />
            </Flex>
            <IconButton
              title="close editor"
              onClick={() => setState({...state, status: 'VIEW'})}
              icon={faTimes}
            />
          </Flex>
          <Flex>
            {wysiwyg ? (
              <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                <WysiwygEditor className={css({alignItems: 'stretch'})} value={currentValue} onChange={onChange} />
              </ErrorBoundary>
            ) : (
              <Flex grow={1} align="stretch">
                <CleverTextarea className={css({minHeight: '100px', flexGrow: 1, flexBasis: "1px"})} value={currentValue} onChange={onChange} />
                <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                  <MarkdownViewer className={css({padding: "3px", flexGrow: 1, flexBasis: "1px"})} md={currentValue} />
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
