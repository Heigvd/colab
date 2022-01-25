/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useDocumentsOfResource } from '../../selectors/documentSelector';
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

  const targetResourceId = resourceAndRef.targetResource.id;
  const { documents, status } = useDocumentsOfResource(targetResourceId);

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED' && targetResourceId != null) {
      dispatch(API.getDocumentsOfResource(targetResourceId));
    }
  }, [status, targetResourceId, dispatch]);

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else if (documents == null || documents.length < 1) {
    return <div>no document at disposal</div>;
  }

  // TODO improve the iteration UX :-)

  return (
    <div>
      {documents.map(doc =>
        <div key={doc.id}>
          <Flex>
            <IconButton icon={faArrowLeft} title="Back" onClick={onClose} />
            <div>
              {entityIs(doc, 'Document') ? (
                resourceAndRef.targetResource.title || i18n.resource.untitled
              ) : (
                <InlineLoading />
              )}
            </div>
          </Flex>

          <div>
            {entityIs(doc, 'Document') ? (
              resourceAndRef.isDirectResource ? (
                <DocumentEditorDisplay document={doc} />
              ) : (
                <>
                  <div>!!! Not a direct resource : readonly </div>
                  <DocumentEditorDisplay document={doc} allowEdition={false} />
                </>
              )
            ) : (
              <InlineLoading />
            )}
          </div>
        </div>)
      }
    </div>
  );

}
