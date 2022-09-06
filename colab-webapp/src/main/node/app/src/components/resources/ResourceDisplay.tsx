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
  faInfoCircle,
  faTools,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import { updateDocumentText } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
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
import { ResourceAndRef } from './resourcesCommonType';
import ResourceSettings from './ResourceSettings';
import TargetResourceSummary from './summary/TargetResourceSummary';

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
  const [openToolbox, setOpenToolbox] = React.useState(true);

  const targetResource = resource.targetResource;

  const effectiveReadOnly = readOnly || !resource.isDirectResource;

  const { text: teaser } = useAndLoadTextOfDocument(targetResource.teaserId);

  const alwaysShowTeaser = effectiveReadOnly && teaser;
  const alwaysHideTeaser = effectiveReadOnly && !teaser;

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
            title="Back to the list"
            onClick={goBackToList}
            className={lightIconButtonStyle}
          />
          <Flex wrap="nowrap" align="center">
            <TargetResourceSummary
              resource={targetResource}
              iconClassName={css({ color: 'var(--lightGray)' })}
            />
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
                ...(!alwaysShowTeaser && !alwaysHideTeaser
                  ? [
                      {
                        value: 'teaser',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faInfoCircle} />{' '}
                            {`${showTeaser ? i18n.common.hide : i18n.common.show} teaser`}
                          </>
                        ),
                        action: () => setShowTeaser(showTeaser => !showTeaser),
                      },
                    ]
                  : []),

                ...(!effectiveReadOnly
                  ? [
                      {
                        value: 'toolbox',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faTools} />{' '}
                            {`${openToolbox ? i18n.common.hide : i18n.common.show} toolbox`}
                          </>
                        ),
                        action: () => setOpenToolbox(openToolbox => !openToolbox),
                      },
                    ]
                  : []),

                ...(!effectiveReadOnly
                  ? [
                      {
                        value: 'settings',
                        label: <ResourceSettingsModal resource={resource} />,
                        modal: true,
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
              open={openToolbox}
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
            />
          )}
          <div className={cx(paddingAroundStyle([2, 4], space_M), css({ overflow: 'auto' }))}>
            <DocumentList
              docOwnership={{ kind: 'PartOfResource', ownerId: targetResource.id }}
              allowEdition={!effectiveReadOnly}
            />
          </div>
        </DocEditorCTX.Provider>
      )}
    </Flex>
  );
}

interface ResourceSettingsModalProps {
  resource: ResourceAndRef;
  isButton?: boolean;
}

function ResourceSettingsModal({ resource, isButton }: ResourceSettingsModalProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <OpenCloseModal
      title="Document settings"
      showCloseButton
      className={css({
        '&:hover': { textDecoration: 'none' },
        display: 'flex',
        alignItems: 'center',
      })}
      collapsedChildren={
        <>
          {isButton ? (
            <IconButton
              icon={faCog}
              className={lightIconButtonStyle}
              title={i18n.common.settings}
            />
          ) : (
            <div className={modalEntryStyle}>
              <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}
            </div>
          )}
        </>
      }
    >
      {() => <ResourceSettings resource={resource} />}
    </OpenCloseModal>
  );
}
