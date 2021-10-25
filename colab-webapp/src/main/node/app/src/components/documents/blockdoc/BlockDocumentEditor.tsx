/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { BlockDocument } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
//import useTranslations from '../../../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../../store/hooks';
import { BlockEditorWrapper } from '../../blocks/BlockEditorWrapper';
import InlineLoading from '../../common/InlineLoading';
import { CreateBlockButton } from './CreateBlockButton';

export interface BlockDocProps {
  doc: BlockDocument;
}

export function BlockDocumentEditor({ doc }: BlockDocProps): JSX.Element {
  const dispatch = useAppDispatch();
  //const i18n = useTranslations();

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
      {/*<AutoSaveInput
        placeholder={i18n.document.untitled}
        value={doc.title || ''}
        onChange={newValue => dispatch(API.updateDocument({ ...doc, title: newValue }))}
      />
      <AutoSaveInput
        inputType="TEXTAREA"
        placeholder={i18n.document.noTeaser}
        value={doc.teaser || ''}
        onChange={newValue => dispatch(API.updateDocument({ ...doc, teaser: newValue }))}
      />*/}
      {blockIds == null ? (
        <InlineLoading />
      ) : (
        blockIds.map(id => <BlockEditorWrapper key={id} blockId={id} />)
      )}

      <CreateBlockButton doc={doc} />
    </div>
  );
}
