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
import { lightIconButtonStyle, paddingAroundStyle, space_M, space_S, workInProgressStyle } from '../styling/style';
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

  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={paddingAroundStyle([2, 3, 4], space_M)}
    >
      <Flex direction="column">
        <IconButton
          icon={faArrowLeft}
          title="Back"
          onClick={onClose}
          className={cx(lightIconButtonStyle, css({ paddingBottom: space_S }))}
        />
        <div>
          <h2>{resourceAndRef.targetResource.title || i18n.resource.untitled}</h2>
        </div>
      </Flex>
      {
        documents
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .map(document =>
            <div className={workInProgressStyle}>
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
          )}
      {/* TODO sandra work in progress */}
      {/* <DocumentCreatorButton
        creationContext={{ kind: CreationContextKind.Resource, resourceId: resourceAndRef.cardResourceRef.id }}
        docType='TextDataBlock' title='add a block' />
      <DocumentCreatorButton
        creationContext={{ kind: CreationContextKind.Resource, resourceId: resourceAndRef.cardResourceRef.id }}
        docType='DocumentFile' title='add a file' />
      <DocumentCreatorButton
        creationContext={{ kind: CreationContextKind.Resource, resourceId: resourceAndRef.cardResourceRef.id }}
        docType='ExternalLink' title='add a link' /> */}
    </Flex>
  );
}