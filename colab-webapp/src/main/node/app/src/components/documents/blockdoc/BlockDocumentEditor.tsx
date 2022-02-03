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
import Flex from '../../common/Flex';
import InlineLoading from '../../common/InlineLoading';
import { CreateBlockButton } from './CreateBlockButton';

export interface BlockDocProps {
  doc: BlockDocument;
  allowEdition?: boolean;
}

export function BlockDocumentEditor({ doc, allowEdition }: BlockDocProps): JSX.Element {
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
      dispatch(API.getDocumentBlocksIds(doc));
    }
  }, [doc, blockIds, dispatch]);

  return (
    <Flex direction="column" align='stretch'>
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
        blockIds.map(id => <BlockEditorWrapper key={id} blockId={id} allowEdition={allowEdition} />)
      )}
      {allowEdition ? <CreateBlockButton doc={doc} /> : null}
    </Flex>
  );
}
