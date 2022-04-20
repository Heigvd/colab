/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faArrowLeft, faCog, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { updateDocumentText } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineInputNew from '../common/InlineInputNew';
import OpenCloseModal from '../common/OpenCloseModal';
import { DocTextWrapper } from '../documents/DocTextItem';
import DocumentList from '../documents/DocumentList';
import {
  cardTitle,
  lightIconButtonStyle,
  paddingAroundStyle,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import { ResourceAndRef } from './ResourceCommonType';
import { ResourceSettings } from './ResourceMiniDisplay';

export interface ResourceDisplayProps {
  resourceAndRef: ResourceAndRef;
  onClose: () => void;
}

export function ResourceDisplay({ resourceAndRef, onClose }: ResourceDisplayProps): JSX.Element {
  const i18n = useTranslations();

  const targetResourceId = resourceAndRef.targetResource.id;

  const allowEdition = resourceAndRef.isDirectResource;
  const { text: teaser } = useAndLoadTextOfDocument(resourceAndRef.targetResource.teaserId);
  const dispatch = useAppDispatch();
  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={paddingAroundStyle([2, 3, 4], space_M)}
    >
      <Flex direction="column" align="normal">
        <Flex
          justify="space-between"
          align="center"
          grow={1}
          className={css({ marginBottom: space_S })}
        >
          <IconButton
            icon={faArrowLeft}
            title="Back"
            onClick={onClose}
            className={lightIconButtonStyle}
          />
          <OpenCloseModal
            title="Document settings"
            showCloseButton={true}
            collapsedChildren={
              <IconButton icon={faCog} className={lightIconButtonStyle} title="Document settings" />
            }
          >
            {() => (
              <>
                <ResourceSettings {...resourceAndRef} />
                {resourceAndRef.isDirectResource && (
                  <Destroyer
                    title="Delete this document"
                    icon={faTrashAlt}
                    onDelete={() => {
                      dispatch(API.deleteResource(resourceAndRef.targetResource));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardTypeResourceRef && (
                  <Destroyer
                    title="Refuse at card type level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardTypeResourceRef!));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardResourceRef && (
                  <Destroyer
                    title="Refuse at card level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardResourceRef!));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardContentResourceRef && (
                  <Destroyer
                    title="Refuse at variant level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardContentResourceRef!));
                    }}
                  />
                )}
              </>
            )}
          </OpenCloseModal>
        </Flex>
        <div>
          <InlineInputNew
            onChange={newValue =>
              dispatch(API.updateResource({ ...resourceAndRef.targetResource, title: newValue }))
            }
            value={resourceAndRef.targetResource.title || i18n.resource.untitled}
            placeholder={i18n.resource.untitled}
            className={cardTitle}
          />
          {teaser && (
            <DocTextWrapper id={resourceAndRef.targetResource.teaserId}>
              {text => (
                <InlineInputNew
                  placeholder={'Add a teaser'}
                  value={text || 'Add a teaser'}
                  onChange={(newValue: string) => {
                    if (resourceAndRef.targetResource.teaserId) {
                      dispatch(
                        updateDocumentText({
                          id: resourceAndRef.targetResource.teaserId,
                          textData: newValue,
                        }),
                      );
                    }
                  }}
                  className={cx(textSmall, css({ marginTop: space_S }))}
                  inputType='textarea'
                />
              )}
            </DocTextWrapper>
          )}
        </div>
      </Flex>
      {targetResourceId && (
        <DocumentList
          context={{ kind: 'PartOfResource', ownerId: targetResourceId }}
          allowEdition={allowEdition}
        />
      )}
    </Flex>
  );
}
