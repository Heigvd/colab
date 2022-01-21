/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import { DocumentEditorDisplay } from '../documents/DocumentEditorDisplay';
import { ResourceAndRef } from './ResourceCommonType';

export interface ResourceDisplayProps {
  resourceAndRef: ResourceAndRef;
  onClose: () => void;
}

export function ResourceDisplay({ resourceAndRef, onClose }: ResourceDisplayProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const docId = resourceAndRef.targetResource.documentId;
  const document = useDocument(docId);

  React.useEffect(() => {
    if (docId != null && document == null) {
      dispatch(API.getDocument(docId));
    }
  }, [docId, document, dispatch]);

  return (
    <div>
      <Flex>
        <IconButton icon={faArrowLeft} title="Back" onClick={onClose} />
        <div>
          {entityIs(document, 'Document') ? (
            resourceAndRef.targetResource.title || i18n.resource.untitled
          ) : (
            <InlineLoading />
          )}
        </div>
      </Flex>

      <div>
        {entityIs(document, 'Document') ? (
          resourceAndRef.isDirectResource ? (
            <DocumentEditorDisplay document={document} />
          ) : (
            <>
              <div>!!! Not a direct resource : readonly </div>
              <DocumentEditorDisplay document={document} allowEdition={false} />
            </>
          )
        ) : (
          <InlineLoading />
        )}
      </div>
    </div>
  );
}
