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
import { useAllProjectCardTypes } from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import Button from '../../common/Button';
import ConfirmDeleteModal from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { DocTextDisplay } from '../../documents/DocTextItem';
import {
  borderRadius,
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  multiLineEllipsis,
  oneLineEllipsis,
  space_M,
  space_S,
  textSmall,
} from '../../styling/style';
import CardTypeRelativesSummary from './summary/CardTypeRelativesSummary';
import TargetCardTypeSummary from './summary/TargetCardTypeSummary';
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const editedProject = useProjectBeingEdited().project;
  const editedProjectId = editedProject?.id;
  const cardTypesId = useAllProjectCardTypes();
  const isUsedInProject = (cardTypeID?: number | null) => {
    if (cardTypeID) {
      return cardTypesId.includes(cardTypeID);
    }
  };
  return (
    <>
      {isEmpty ? (
        <Flex title={'Blank card type'} align="center" justify="center" grow={1}>
          <FontAwesomeIcon icon={faFile} size="3x" />
          <div className={css({ paddingLeft: space_M })}>
            <h3>{'Blank card type'}</h3>
          </div>
        </Flex>
      ) : (
        <Flex direction="column" align="stretch" grow={1}>
          <Flex justify="space-between">
            <Flex direction="column" grow={1} align="stretch">
              <Flex justify={editable ? 'flex-start' : 'space-between'} align="center">
                <TargetCardTypeSummary cardType={cardType} />
                <h3 className={oneLineEllipsis}>{cardType.title || 'Card type'}</h3>
                <div
                  className={cx(
                    lightItalicText,
                    textSmall,
                    css({ whiteSpace: 'nowrap', marginLeft: space_M }),
                  )}
                >
                  <CardTypeRelativesSummary cardType={cardType} />
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
                <DocTextDisplay id={cardType.purposeId} />
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
                            <>
                              {!isUsedInProject(cardType.id) ? (
                                <ConfirmDeleteModal
                                  buttonLabel={
                                    <div
                                      className={cx(css({ color: errorColor }), modalEntryStyle)}
                                    >
                                      <FontAwesomeIcon icon={faTrash} /> Delete type
                                    </div>
                                  }
                                  className={css({
                                    '&:hover': { textDecoration: 'none' },
                                    display: 'flex',
                                    alignItems: 'center',
                                  })}
                                  message={
                                    <p>
                                      Are you <strong>sure</strong> you want to delete this card
                                      type?
                                    </p>
                                  }
                                  onConfirm={() => dispatch(API.deleteCardType(cardType))}
                                  confirmButtonLabel="Delete type"
                                />
                              ) : (
                                <OpenCloseModal
                                  title="Cannot delete Card Type"
                                  className={css({
                                    '&:hover': { textDecoration: 'none' },
                                    display: 'flex',
                                    alignItems: 'center',
                                  })}
                                  collapsedChildren={
                                    <div
                                      className={cx(css({ color: errorColor }), modalEntryStyle)}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                      Delete Type
                                    </div>
                                  }
                                  footer={collapse => (
                                    <Flex
                                      justify={'center'}
                                      grow={1}
                                      className={css({ padding: space_M, columnGap: space_S })}
                                    >
                                      <Button onClick={collapse}>OK</Button>
                                    </Flex>
                                  )}
                                >
                                  {() => (
                                    <div>
                                      Impossible to delete this card type. It is used in this
                                      project.
                                    </div>
                                  )}
                                </OpenCloseModal>
                              )}
                            </>
                          ),
                          modal: true,
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </Flex>
          <TagsDisplay tags={cardType.tags} className={tagStyle} />
        </Flex>
      )}
    </>
  );
}
