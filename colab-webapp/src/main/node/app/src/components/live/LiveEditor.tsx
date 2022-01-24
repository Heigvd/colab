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
import Flex from '../common/Flex';
import Toggler from '../common/Form/Toggler';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import Tips from '../common/Tips';
import WithToolbar from '../common/WithToolbar';
import { space_S } from '../styling/style';
import ChangeTree from './ChangeTree';
import { useLiveBlock } from './LiveTextEditor';

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
        <MarkdownViewer md={currentValue} />
      </div>
    );
  }

  if (!allowEdition) {
    return <MarkdownViewer md={currentValue} />;
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
          onClick={() => setState({ ...state, status: 'EDIT' })}
        >
          <WithToolbar
            toolbarPosition="TOP_RIGHT"
            toolbarClassName=""
            offsetY={-1}
            toolbar={
              <IconButton title="Click to edit" icon={faPen} iconColor="var(--disabledGrey)" />
            }
          >
            <MarkdownViewer md={currentValue} />
          </WithToolbar>
        </Flex>
      );
    } else if (state.status === 'EDIT') {
      return (
        <Flex direction="column" align='stretch' className={css({backgroundColor: 'var(--hoverBgColor)', padding: space_S})}>
          <Flex justify='space-between'>
            <Flex align='center'>
              <Tips tipsType="TODO">Lot of work... custom WYSIWYG editor with live capabilities</Tips>
              <Toggler label="Show Tree" value={showTree} onChange={setShowTree} />
              <Toggler label="WYSIWYG" value={wysiwyg} onChange={setWysiwyg} />
            </Flex>
            <IconButton
              title="close editor"
              onClick={() => setState({ ...state, status: 'VIEW' })}
              icon={faTimes}
            />
          </Flex>
          <Flex>
            {wysiwyg ? (
              <WysiwygEditor className={css({alignItems: 'stretch'})} value={currentValue} onChange={onChange} />
            ) : (
              <>
                <CleverTextarea className={css({minHeight: '100px', flexGrow: 1})} value={currentValue} onChange={onChange} />
              </>
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
