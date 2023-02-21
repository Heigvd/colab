/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import { updateDocumentText } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
import { FeaturePreview } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { DocTextWrapper } from '../documents/DocTextItem';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCtx,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';
import {
  lightIconButtonStyle,
  oneLineEllipsisStyle,
  space_sm,
  text_sm,
} from '../styling/style';
import ResourceCategorySelector from './ResourceCategorySelector';
import {
  //getTheDirectResource,
  ResourceAndRef,
  useResourceAccessLevelForCurrentUser,
} from './resourcesCommonType';
import ResourceScope from './summary/ResourceScope';
//import TargetResourceSummary from './summary/TargetResourceSummary';

export interface ResourceDisplayProps {
  resource: ResourceAndRef;
  readOnly: boolean;
  goBackToList: () => void;
}

export function ResourceDisplay({
  resource,
  readOnly,
  goBackToList,
}: ResourceDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  // const rootCard = useProjectRootCard(project);

  const [selectedDocId, setSelectedDocId] = React.useState<number | null>(null);
  const [lastCreatedDocId, setLastCreatedDocId] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState(defaultDocEditorContext.editMode);
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setMarkDownMode] = React.useState(false);
  const [editToolbar, setEditToolbar] = React.useState(defaultDocEditorContext.editToolbar);

  const TXToptions = {
    showTree: showTree,
    setShowTree: setShowTree,
    markDownMode: markDownMode,
    setMarkDownMode: setMarkDownMode,
  };

  const [showTeaser, setShowTeaser] = React.useState(false);

  const targetResource = resource.targetResource;

  // get the effective access level on targetResource
  const accesLevel = useResourceAccessLevelForCurrentUser(resource.targetResource);

  // const [forceWrite, setForce] = React.useState(false);

  // acces level from current point of view is readonly, but user has a write acces on the
  // target resource
  // const couldWriteButNotDirect = accesLevel === 'WRITE' && (readOnly || !resource.isDirectResource);

  // const toggleForceCb = React.useCallback(() => {
  //   setForce(current => !current);
  // }, []);

  const effectiveReadOnly = readOnly || accesLevel !== 'WRITE'; // !forceWrite && (readOnly || !resource.isDirectResource);

  //const category = getTheDirectResource(resource).category;

  const { text: teaser } = useAndLoadTextOfDocument(targetResource.teaserId);

  const alwaysShowTeaser = effectiveReadOnly && teaser;
  const alwaysHideTeaser = effectiveReadOnly && !teaser;

  const [showCategorySelector, setShowCategorySelector] = React.useState(false);

  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ overflow: 'auto' })}>
      <Flex direction="column" align="normal">
        <Flex
          justify="space-between"
          align="center"
          grow={1}
          className={css({ marginBottom: space_sm })}
        >
          <Flex wrap="nowrap" align="center" className={css({ maxWidth: '80%' })}>
            {/* <TargetResourceSummary resource={resource} showText="tooltip" /> */}
            {/* {category && (
              <>
                <DiscreetInput
                  value={category}
                  readOnly={effectiveReadOnly}
                  onChange={newValue =>
                    dispatch(
                      API.changeResourceCategory({
                        resourceOrRef: API.getResourceToEdit(resource),
                        categoryName: newValue || '',
                      }),
                    )
                  }
                />
                {' / '}
              </>
            )} */}
            {resource.targetResource.published && resource.isDirectResource && (
               <Icon
                icon={'subdirectory_arrow_right'}
                title={i18n.common.published}
                opsz="xs"
                color="var(--secondary-main)"
              />
            )}
            <DiscreetInput
              value={targetResource.title || ''}
              placeholder={i18n.modules.resource.untitled}
              readOnly={effectiveReadOnly}
              onChange={newValue =>
                dispatch(API.updateResource({ ...targetResource, title: newValue }))
              }
              inputDisplayClassName={cx(
                oneLineEllipsisStyle,
                css({ textOverflow: 'ellipsis' }),
              )}
              title={targetResource.title || ''}
            />
            {(!(
              resource.isDirectResource ||
              resource.targetResource.cardId != null ||
              resource.targetResource.cardContentId != null
            ) ||
              resource.targetResource.abstractCardTypeId != null) && (
              <div
                className={css({
                  fontSize: '0.7em',
                  color: 'var(--divider-main)',
                  border: '1px solid var(--divider-main)',
                  borderRadius: '10px',
                  padding: '3px',
                })}
              >
                Read only
              </div>
            )}
          </Flex>
          {/* {(couldWriteButNotDirect || resource.isDirectResource) && ( */}
          <Flex align="center" wrap="nowrap">
            <FeaturePreview>
              <OpenCloseModal
                modalClassName={css({
                  minWidth: '50vw',
                  minHeight: '50vh',
                  maxWidth: '80vw',
                  maxHeight: '80vh',
                })}
                modalBodyClassName={css({
                  padding: 0,
                  alignItems: 'stretch',
                })}
                title=""
                collapsedChildren={ <Icon icon={'trolley'} />}
              >
                {close => <ResourceScope onCancel={close} resource={resource} />}
              </OpenCloseModal>
            </FeaturePreview>
            {/* )} */}
            {/* {!targetResource.published &&
            (targetResource.abstractCardTypeId != null ||
              (targetResource.cardId != null &&
                entityIs(rootCard, 'Card') &&
                targetResource.cardId === rootCard.id)) && (
               <Icon
                icon={faPersonDigging}
                title={i18n.modules.resource.unpublishedInfoType}
              />
            )} */}
            {/* {canForce && !forceWrite && (
            <ConfirmIconButton
              icon={'edit'}
              title={i18n.modules.resource.info.forceTooltip}
              onConfirm={toggleForceCb}
            />
          )} */}

            {/* {canForce && forceWrite && <span onClick={toggleForceCb}>done</span>} */}
            {/* {effectiveReadOnly && !teaser ? (
            <ResourceCategoryModal resource={resource} isButton />
          ) : ( */}
            {readOnly ? (
              <div></div>
            ) : (
              <DropDownMenu
                icon={'more_vert'}
                valueComp={{ value: '', label: '' }}
                buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_sm }))}
                entries={[
                  ...(!effectiveReadOnly && resource.isDirectResource
                    ? [
                        {
                          value: 'categorySelector',
                          label: (
                            <>
                               <Icon icon={'settings'} /> {i18n.modules.resource.category}
                            </>
                          ),
                          action: () => setShowCategorySelector(true),
                        },
                      ]
                    : []),
                  ...(!readOnly && resource.isDirectResource && resource.targetResource.id // TODO see conditions
                    ? [
                        {
                          value: 'publishStatus',
                          label: (
                            <>
                               <Icon icon={'subdirectory_arrow_right'} />
                              {resource.targetResource.published
                                ? i18n.modules.resource.actions.makePrivate
                                : i18n.modules.resource.actions.shareWithChildren}
                            </>
                          ),
                          action: () => {
                            if (resource.targetResource.id) {
                              if (resource.targetResource.published) {
                                dispatch(API.unpublishResource(resource.targetResource.id));
                              } else {
                                dispatch(API.publishResource(resource.targetResource.id));
                              }
                            }
                          },
                        },
                      ]
                    : []),
                  ...(!alwaysShowTeaser && !alwaysHideTeaser
                    ? [
                        {
                          value: 'teaser',
                          label: (
                            <>
                               <Icon icon={'info'} />
                              {`${
                                showTeaser
                                  ? i18n.modules.resource.hideTeaser
                                  : i18n.modules.resource.showTeaser
                              }`}
                            </>
                          ),
                          action: () => setShowTeaser(showTeaser => !showTeaser),
                        },
                      ]
                    : []),

                  ...(!readOnly
                    ? [
                        {
                          value: 'remove',
                          label: (
                            <>
                               <Icon icon={'inventory_2'} /> {i18n.common.remove}
                            </>
                          ),
                          action: () => {
                            dispatch(API.removeAccessToResource(resource));
                            goBackToList();
                          },
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </Flex>
        </Flex>
        <div>
          {showCategorySelector && (
            <ResourceCategoryModal
              resource={resource}
              onClose={() => setShowCategorySelector(false)}
            />
          )}
          {(alwaysShowTeaser || showTeaser) && !alwaysHideTeaser && (
            <DocTextWrapper id={targetResource.teaserId}>
              {text => (
                <DiscreetTextArea
                  value={text || ''}
                  placeholder={
                    effectiveReadOnly
                      ? i18n.modules.resource.noTeaser
                      : i18n.modules.resource.noTeaserForNow
                  }
                  readOnly={effectiveReadOnly}
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
                  inputDisplayClassName={cx(text_sm, css({ marginTop: space_sm }))}
                />
              )}
            </DocTextWrapper>
          )}
        </div>
      </Flex>

      {targetResource.id && (
        <DocEditorCtx.Provider
          value={{
            selectedDocId,
            setSelectedDocId,
            lastCreatedId: lastCreatedDocId,
            setLastCreatedId: setLastCreatedDocId,
            editMode,
            setEditMode,
            editToolbar,
            setEditToolbar,
            TXToptions,
          }}
        >
          {!effectiveReadOnly && (
            <DocEditorToolbox
              open={true}
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
            />
          )}
          <div className={css({ overflow: 'auto' })}>
            <DocumentList
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
              readOnly={effectiveReadOnly}
            />
          </div>
        </DocEditorCtx.Provider>
      )}
    </Flex>
  );
}

interface ResourceCategoryModalProps {
  resource: ResourceAndRef;
  onClose: () => void;
}

export function ResourceCategoryModal({
  resource,
  onClose,
}: ResourceCategoryModalProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Modal title={i18n.modules.resource.category} showCloseButton onClose={onClose}>
      {() => <ResourceCategorySelector resource={resource} />}
    </Modal>
  );
}
