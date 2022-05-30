/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faCircleInfo,
  faCog,
  faSlash,
  faTools,
  faTrash,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { updateDocumentText } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import CardEditorToolbox from '../cards/CardEditorToolbox';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineInputNew from '../common/InlineInputNew';
import OpenCloseModal from '../common/OpenCloseModal';
import { DocTextWrapper } from '../documents/DocTextItem';
import DocumentList from '../documents/DocumentList';
import {
  lightIconButtonStyle,
  localTitleStyle,
  paddingAroundStyle,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import { ResourceAndRef } from './ResourceCommonType';
import { ResourceSettings } from './ResourceMiniDisplay';
import TargetResourceSummary from './summary/TargetResourceSummary';

export interface ResourceDisplayProps {
  resource: ResourceAndRef;
  goBackToList: () => void;
}

export function ResourceDisplay({ resource, goBackToList }: ResourceDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [showTeaser, setShowTeaser] = React.useState(false);
  const [openToolbox, setOpenToolbox] = React.useState(true);

  const targetResource = resource.targetResource;
  const readOnly = !resource.isDirectResource;

  const { text: teaser } = useAndLoadTextOfDocument(targetResource.teaserId);

  return (
    <Flex align="stretch" direction="column" grow={1}>
      <Flex direction="column" align="normal" className={paddingAroundStyle([1, 2, 4], space_M)}>
        <Flex
          justify="space-between"
          align="center"
          grow={1}
          className={css({ marginBottom: space_S })}
        >
          <IconButton
            icon={faArrowLeft}
            title="Back"
            onClick={goBackToList}
            className={lightIconButtonStyle}
          />

          <InlineInputNew
            value={targetResource.title || ''}
            placeholder={i18n.resource.untitled}
            readOnly={readOnly}
            onChange={newValue =>
              dispatch(API.updateResource({ ...targetResource, title: newValue }))
            }
            className={localTitleStyle}
          />

          <Flex wrap="nowrap">
            {(!readOnly || teaser) && (
              <IconButton
                icon={faCircleInfo}
                title={showTeaser ? 'Hide teaser' : 'Show teaser'}
                layer={showTeaser ? { layerIcon: faSlash, transform: 'grow-1' } : undefined}
                className={lightIconButtonStyle}
                onClick={() => setShowTeaser(showTeaser => !showTeaser)}
              />
            )}

            {!readOnly && (
              <IconButton
                icon={faTools}
                layer={openToolbox ? { layerIcon: faSlash, transform: 'grow-1' } : undefined}
                title={openToolbox ? 'Hide toolbox' : 'Show toolbox'}
                className={lightIconButtonStyle}
                onClick={() => setOpenToolbox(openToolbox => !openToolbox)}
              />
            )}

            <TargetResourceSummary resource={targetResource} iconClassName={lightIconButtonStyle} />

            <OpenCloseModal
              title="Document settings"
              showCloseButton={true}
              collapsedChildren={
                <IconButton
                  icon={faCog}
                  className={lightIconButtonStyle}
                  title="Document settings"
                />
              }
            >
              {() => (
                <>
                  <ResourceSettings {...resource} />
                  {resource.isDirectResource && (
                    <Destroyer
                      title="Delete this document"
                      icon={faTrashAlt}
                      onDelete={() => {
                        dispatch(API.deleteResource(targetResource));
                      }}
                    />
                  )}
                  {!resource.isDirectResource && resource.cardTypeResourceRef && (
                    <Destroyer
                      title="Refuse at card type level"
                      icon={faTrash}
                      onDelete={() => {
                        dispatch(API.removeAccessToResource(resource.cardTypeResourceRef!));
                      }}
                    />
                  )}
                  {!resource.isDirectResource && resource.cardResourceRef && (
                    <Destroyer
                      title="Refuse at card level"
                      icon={faTrash}
                      onDelete={() => {
                        dispatch(API.removeAccessToResource(resource.cardResourceRef!));
                      }}
                    />
                  )}
                  {!resource.isDirectResource && resource.cardContentResourceRef && (
                    <Destroyer
                      title="Refuse at variant level"
                      icon={faTrash}
                      onDelete={() => {
                        dispatch(API.removeAccessToResource(resource.cardContentResourceRef!));
                      }}
                    />
                  )}
                </>
              )}
            </OpenCloseModal>
          </Flex>
        </Flex>
        <div>
          {showTeaser && (
            <DocTextWrapper id={targetResource.teaserId}>
              {text => (
                <InlineInputNew
                  value={text || ''}
                  placeholder={'Fill the teaser'}
                  readOnly={readOnly}
                  onChange={(newValue: string) => {
                    if (targetResource.teaserId) {
                      dispatch(
                        updateDocumentText({
                          id: targetResource.teaserId,
                          textData: newValue,
                        }),
                      );
                    }
                  }}
                  className={cx(textSmall, css({ marginTop: space_S }))}
                  inputType="textarea"
                />
              )}
            </DocTextWrapper>
          )}
        </div>
      </Flex>

      {targetResource.id && (
        <>
          {!readOnly && (
            <CardEditorToolbox
              open={openToolbox}
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
              //prefixElement={<IconButton icon={faTimes} title={"Close toolbox"} onClick={() => setOpenToolbox(openToolbox => !openToolbox)} />}
            />
          )}
          <div className={cx(paddingAroundStyle([2, 4], space_M), css({ overflow: 'auto' }))}>
            <DocumentList
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
              allowEdition={!readOnly}
            />
          </div>
        </>
      )}
    </Flex>
  );
}
