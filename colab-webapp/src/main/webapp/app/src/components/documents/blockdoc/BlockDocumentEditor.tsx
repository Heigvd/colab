/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';
import { BlockDocument } from 'colab-rest-client';
import AutoSaveInput from '../../common/AutoSaveInput';
import { useAppDispatch, useAppSelector, shallowEqual } from '../../../store/hooks';
import InlineLoading from '../../common/InlineLoading';
import { BlockEditorWrapper } from '../../blocks/BlockEditorWrapper';
import { CreateBlockButton } from './CreateBlockButton';

export interface BlockDocProps {
  doc: BlockDocument;
}

export function BlockDocumentEditor({ doc }: BlockDocProps): JSX.Element {
  const dispatch = useAppDispatch();

  const blockIds = useAppSelector(state => {
    if (doc.id) {
      return state.block.documents[doc.id];
    }
    return null;
  }, shallowEqual);

  React.useEffect(() => {
    if (blockIds === undefined) {
      dispatch(API.getDocumentBlocks(doc));
    }
  }, [doc, blockIds, dispatch]);

  return (
    <div>
      <AutoSaveInput
        placeholder="unnamed"
        value={doc.title || ''}
        onChange={newValue => dispatch(API.updateDocument({ ...doc, title: newValue }))}
      />
      <AutoSaveInput
        inputType="TEXTAREA"
        placeholder="no teaser"
        value={doc.teaser || ''}
        onChange={newValue => dispatch(API.updateDocument({ ...doc, teaser: newValue }))}
      />
      {blockIds == null ? (
        <InlineLoading />
      ) : (
        blockIds.map(id => <BlockEditorWrapper key={id} blockId={id} />)
      )}
      <CreateBlockButton doc={doc} />
    </div>
  );
}
