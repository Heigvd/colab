/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
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
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import ConfirmDeleteModal from '../../common/ConfirmDeleteModal';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import { DocTextDisplay } from '../../documents/DocTextItem';
import {
  borderRadius,
  cardShadow,
  lightIconButtonStyle,
  lightItalicText,
  space_M,
  space_S,
} from '../../styling/style';
import CardTypeRelativesSummary from './summary/CardTypeRelativesSummary';
import { TagsDisplay } from './tags/TagsDisplay';

const style = css({
  width: '280px',
  borderRadius: borderRadius,
  padding: space_M,
  background: 'var(--bgColor)',
  boxShadow: cardShadow,
});

const tagStyle = css({
  borderRadius: '13px',
  padding: space_S + ' ' + space_M,
  marginRight: space_S,
  backgroundColor: 'var(--lightGray)',
  fontSize: '0.8em',
});

interface CardTypeItemProps {
  cardType: CardType;
  usage: 'currentProject' | 'available' | 'global';
}

export default function CardTypeItem({ cardType, usage }: CardTypeItemProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const editedProject = useProjectBeingEdited().project;
  const editedProjectId = editedProject?.id;

  return (
    <Flex direction="column" align="stretch" className={style}>
      <Flex justify="space-between">
        <h3>{cardType.title || 'card type'}</h3>
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
            ...(usage === 'available' && editedProject && cardType.projectId !== editedProjectId
              ? [
                  {
                    value: 'Use this type in the project',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faMapPin} /> Use in project
                      </>
                    ),
                    action: () =>
                      dispatch(API.addCardTypeToProject({ cardType, project: editedProject })),
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
                        API.removeCardTypeRefFromProject({ cardType, project: editedProject }),
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
      </Flex>
      <Flex grow={1}>
        <p className={lightItalicText}>
          <DocTextDisplay id={cardType.purposeId} />
        </p>
      </Flex>
      <Flex>
        <CardTypeRelativesSummary cardType={cardType} />
      </Flex>
      <Flex>
        <TagsDisplay tags={cardType.tags} className={tagStyle} />
      </Flex>
    </Flex>
  );
}
