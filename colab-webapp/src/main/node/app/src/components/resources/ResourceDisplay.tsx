/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faBroom,
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
import CardEditorToolbox from '../cards/CardEditorToolbox';
import IconButton from '../common/element/IconButton';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
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

  const [showTeaser, setShowTeaser] = React.useState(true);
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
                        value: 'Toggle teaser',
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
                        value: 'Toggle toolbox',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faTools} />{' '}
                            {`${openToolbox ? i18n.common.close : i18n.common.open} toolbox`}
                          </>
                        ),
                        action: () => setOpenToolbox(openToolbox => !openToolbox),
                      },
                    ]
                  : []),

                ...(!effectiveReadOnly
                  ? [
                      {
                        value: 'Settings',
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
                            <FontAwesomeIcon icon={faBroom} /> Remove
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
                      ? 'There is no teaser'
                      : 'There is no teaser for the moment. Feel free to fill it.'
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
        <>
          {!effectiveReadOnly && (
            <CardEditorToolbox
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
        </>
      )}
    </Flex>
  );
}

interface ResourceSettingsModalProps {
  resource: ResourceAndRef;
  isButton?: boolean;
}

function ResourceSettingsModal({ resource, isButton }: ResourceSettingsModalProps): JSX.Element {
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
            <IconButton icon={faCog} className={lightIconButtonStyle} title="Settings" />
          ) : (
            <div className={modalEntryStyle}>
              <FontAwesomeIcon icon={faCog} />
              Settings
            </div>
          )}
        </>
      }
    >
      {() => <ResourceSettings resource={resource} />}
    </OpenCloseModal>
  );
}
