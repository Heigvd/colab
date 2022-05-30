/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import {
  faEllipsisV,
  faExchangeAlt,
  faMapPin,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { useAndLoadTextOfDocument } from '../../../selectors/documentSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import ConfirmDeleteModal from '../../common/ConfirmDeleteModal';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import ResourcesListSummary from '../../resources/summary/ResourcesListSummary';
import {
  borderRadius,
  lightIconButtonStyle,
  lightItalicText,
  multiLineEllipsis,
  oneLineEllipsis,
  space_M,
  space_S,
  textSmall,
} from '../../styling/style';
import { TagsDisplay } from './tags/TagsDisplay';

const tagStyle = css({
  borderRadius: borderRadius,
  padding: '3px ' + space_S,
  marginRight: space_S,
  border: '1px solid var(--darkGray)',
  color: 'var(--darkGray)',
  fontSize: '0.8em',
  whiteSpace: 'nowrap',
});

interface CardTypeThumbnailProps {
  cardType?: CardType | null;
  editable?: boolean;
  usage: 'currentProject' | 'available' | 'global';
}

// TODO : make functional Flex/div

export default function CardTypeThumbnail({
  cardType,
  editable = false,
  usage,
}: CardTypeThumbnailProps): JSX.Element {
  const isEmpty = cardType === null || cardType === undefined;
  const { text: purpose } = useAndLoadTextOfDocument(cardType ? cardType.purposeId : null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const editedProject = useProjectBeingEdited().project;
  const editedProjectId = editedProject?.id;
  return (
    <>
      {/* <Thumbnail
        onClick={() => {
          if (cardType.cardTypeId != null) {
            onClick(cardType.cardTypeId);
          }
        }}
        className={cx(defaultStyle, highlighted && selected)}
        
      > */}
      {isEmpty ? (
        <Flex title={'Blank card type'} align="center" justify="center" grow={1}>
          <FontAwesomeIcon icon={faFile} size="3x" />
          <div className={css({ paddingLeft: space_M })}>
            <h3>{'Blank card type'}</h3>
          </div>
        </Flex>
      ) : (
        <>
          <Flex direction="column" align="stretch" grow={1}>
            <Flex justify="space-between">
              <Flex direction="column" grow={1} align='stretch'>
                <Flex justify={editable ? 'flex-start' : 'space-between'}>
                  <h3 className={oneLineEllipsis}>{cardType.title}</h3>
                  <div className={cx(lightItalicText, textSmall, css({ whiteSpace: 'nowrap', marginLeft: space_M }))}>
                    <ResourcesListSummary
                      kind={'CardType'}
                      accessLevel={'READ'}
                      cardTypeId={cardType.ownId}
                    />
                  </div>
                </Flex>
                <p
                  className={cx(
                    lightItalicText,
                    textSmall,
                    multiLineEllipsis,
                    css({ maxWidth: '100%' }),
                  )}
                >
                  {purpose}
                </p>
              </Flex>
              {editable && (
                <DropDownMenu
                  icon={faEllipsisV}
                  valueComp={{ value: '', label: '' }}
                  buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
                  entries={[
                    ...((usage === 'currentProject' && cardType.projectId === editedProjectId) ||
                    usage === 'global'
                      ? [
                          {
                            value: 'Edit type',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faPen} /> Edit Type
                              </>
                            ),
                            action: () => navigate(`./edit/${cardType.ownId}`),
                          },
                        ]
                      : []),
                    ...(usage === 'available' &&
                    editedProject &&
                    cardType.projectId !== editedProjectId
                      ? [
                          {
                            value: 'Use this type in the project',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faMapPin} /> Use in project
                              </>
                            ),
                            action: () =>
                              dispatch(
                                API.addCardTypeToProject({ cardType, project: editedProject }),
                              ),
                          },
                        ]
                      : []),
                    .../*!readOnly &&*/
                    (usage === 'currentProject' &&
                    editedProject &&
                    cardType.projectId === editedProjectId &&
                    cardType.kind === 'referenced'
                      ? [
                          {
                            value: 'Remove this type from the project',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faExchangeAlt} /> Remove from project
                              </>
                            ),
                            action: () =>
                              dispatch(
                                API.removeCardTypeRefFromProject({
                                  cardType,
                                  project: editedProject,
                                }),
                              ),
                          },
                        ]
                      : []),
                    .../*!readOnly &&*/
                    (cardType.kind === 'own' &&
                    ((usage === 'currentProject' && cardType.projectId === editedProjectId) ||
                      usage === 'global')
                      ? [
                          {
                            value: 'Delete type',
                            label: (
                              <ConfirmDeleteModal
                                buttonLabel={
                                  <>
                                    <FontAwesomeIcon icon={faTrash} /> Delete type
                                  </>
                                }
                                message={
                                  <p>
                                    Are you <strong>sure</strong> you want to delete this card type?
                                  </p>
                                }
                                onConfirm={() => dispatch(API.deleteCardType(cardType))}
                                confirmButtonLabel="Delete type"
                              />
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              )}
            </Flex>
            <TagsDisplay tags={cardType.tags} className={tagStyle} />
          </Flex>
        </>
      )}
    </>
  );
}
