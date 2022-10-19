/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faBoxArchive,
  faCog,
  faEllipsisV,
  //faGlasses,
  faInfoCircle,
  faTurnDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import { updateDocumentText } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
//import { FeaturePreview } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
//import OpenCloseModal from '../common/layout/OpenCloseModal';
import { DocTextWrapper } from '../documents/DocTextItem';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCTX,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';
import {
  lightIconButtonStyle,
  localTitleStyle,
  paddingAroundStyle,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import {
  //getTheDirectResource,
  ResourceAndRef,
  useResourceAccessLevelForCurrentUser,
} from './resourcesCommonType';
import ResourceSettings from './ResourceSettings';
//import ResourceScope from './summary/ResourceScope';
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

  const { project } = useProjectBeingEdited();
  // const rootCard = useProjectRootCard(project);

  const [selectedDocId, setSelectedDocId] = React.useState<number | undefined | null>(undefined);
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
  //const couldWriteButNotDirect = accesLevel === 'WRITE' && (readOnly || !resource.isDirectResource);

  // const toggleForceCb = React.useCallback(() => {
  //   setForce(current => !current);
  // }, []);

  const canEdit =
    !readOnly &&
    ((project && project.type === 'PROJECT' && resource.isDirectResource) ||
      (project && project.type === 'MODEL' && accesLevel === 'WRITE'));

  const effectiveReadOnly = !canEdit; // !forceWrite && (readOnly || !resource.isDirectResource);

  //const category = getTheDirectResource(resource).category;

  const { text: teaser } = useAndLoadTextOfDocument(targetResource.teaserId);

  const alwaysShowTeaser = effectiveReadOnly && teaser;
  const alwaysHideTeaser = effectiveReadOnly && !teaser;

  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ overflow: 'auto' })}>
      <Flex direction="column" align="normal" className={paddingAroundStyle([1, 2, 4], space_M)}>
        <Flex
          justify="space-between"
          align="center"
          grow={1}
          className={css({ marginBottom: space_S })}
        >
          <IconButton
            icon={faArrowLeft}
            title={i18n.modules.resource.backList}
            onClick={goBackToList}
            className={lightIconButtonStyle}
          />
          <Flex wrap="nowrap" align="center">
            {(!resource.isDirectResource || resource.targetResource.abstractCardTypeId != null) &&
            <div className={css({fontSize: '0.7em', color: 'var(--lightGray)', border: '1px solid var(--lightGray)', borderRadius: '10px', padding: '3px'})}>Read only</div>}
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
            {resource.targetResource.published && <FontAwesomeIcon icon={faTurnDown} title={i18n.common.published} size='xs' color='var(--darkGray)' />}
            <DiscreetInput
              value={targetResource.title || ''}
              placeholder={i18n.modules.resource.untitled}
              readOnly={effectiveReadOnly}
              onChange={newValue =>
                dispatch(API.updateResource({ ...targetResource, title: newValue }))
              }
              inputDisplayClassName={localTitleStyle}
            />
          </Flex>
          {/* {(couldWriteButNotDirect || resource.isDirectResource) && (
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
                collapsedChildren={<FontAwesomeIcon icon={faGlasses} />}
              >
                {close => <ResourceScope onCancel={close} resource={resource} />}
              </OpenCloseModal>
            </FeaturePreview>
          )} */}
          {/* {!targetResource.published &&
            (targetResource.abstractCardTypeId != null ||
              (targetResource.cardId != null &&
                entityIs(rootCard, 'Card') &&
                targetResource.cardId === rootCard.id)) && (
              <FontAwesomeIcon
                icon={faPersonDigging}
                title={i18n.modules.resource.unpublishedInfoType}
              />
            )} */}
          {/* {canForce && !forceWrite && (
            <ConfirmIconButton
              icon={faPen}
              title={i18n.modules.resource.info.forceTooltip}
              onConfirm={toggleForceCb}
            />
          )} */}

          {/* {canForce && forceWrite && <span onClick={toggleForceCb}>done</span>} */}
          {/* {effectiveReadOnly && !teaser ? (
            <ResourceSettingsModal resource={resource} isButton />
          ) : ( */}
          {readOnly ? (
            <div></div>
          ) : (
            <DropDownMenu
              icon={faEllipsisV}
              valueComp={{ value: '', label: '' }}
              buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
              entries={[
                ...(!effectiveReadOnly
                  ? [
                      {
                        value: 'settings',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}{' '}
                          </>
                        ),
                        action: () => setShowSettings(true),
                      },
                    ]
                  : []),
                ...(!readOnly && resource.isDirectResource && resource.targetResource.id // TODO see conditions
                  ? [
                      {
                        value: 'publishStatus',
                        label: (
                          <>
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
                            <FontAwesomeIcon icon={faInfoCircle} />{' '}
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
                            <FontAwesomeIcon icon={faBoxArchive} /> {i18n.common.remove}
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
        <div>
          {showSettings && (
            <ResourceSettingsModal resource={resource} onClose={() => setShowSettings(false)} />
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
                  inputDisplayClassName={cx(textSmall, css({ marginTop: space_S }))}
                />
              )}
            </DocTextWrapper>
          )}
        </div>
      </Flex>

      {targetResource.id && (
        <DocEditorCTX.Provider
          value={{
            selectedDocId,
            setSelectedDocId,
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
          <div className={cx(paddingAroundStyle([2, 4], space_M), css({ overflow: 'auto' }))}>
            <DocumentList
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
              readOnly={effectiveReadOnly}
            />
          </div>
        </DocEditorCTX.Provider>
      )}
    </Flex>
  );
}

interface ResourceSettingsModalProps {
  resource: ResourceAndRef;
  onClose: () => void;
}

function ResourceSettingsModal({ resource, onClose }: ResourceSettingsModalProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Modal title={i18n.modules.content.documentSettings} showCloseButton onClose={onClose}>
      {() => <ResourceSettings resource={resource} />}
    </Modal>
  );
}
