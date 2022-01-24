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

  // note : quick and dirty changed to be compatible with an array of docs... 
  // but only the case of exactly 1 doc is handled !!!

  const targetResourceId = resourceAndRef.targetResource.id;
  const docs = useDocumentsOfResource(targetResourceId);

  React.useEffect(() => {
    if (targetResourceId != null && (!docs || docs.length < 1)) {
      dispatch(API.getDocumentsOfResource(targetResourceId));
    }
  }, [targetResourceId, docs, dispatch]);

  if (docs == null || docs[0] == null) {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <Flex>
          <IconButton icon={faArrowLeft} title="Back" onClick={onClose} />
          <div>
            {entityIs(docs[0], 'Document') ? (
              resourceAndRef.targetResource.title || i18n.resource.untitled
            ) : (
              <InlineLoading />
            )}
          </div>
        </Flex>

        <div>
          {entityIs(docs[0], 'Document') ? (
            resourceAndRef.isDirectResource ? (
              <DocumentEditorDisplay document={docs[0]} />
            ) : (
              <>
                <div>!!! Not a direct resource : readonly </div>
                <DocumentEditorDisplay document={docs[0]} allowEdition={false} />
              </>
            )
          ) : (
            <InlineLoading />
          )}
        </div>
      </div>
    );
  }
}
