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
import DocTextDisplay from '../../documents/DocTextDisplay';
import ResourceSummary from '../../resources/ResourceSummary';
import {
  borderRadius,
  cardShadow,
  lightIconButtonStyle,
  lightItalicText,
  space_M,
  space_S,
} from '../../styling/style';
import { CardTypeTagsDisplay } from './CardTypeTagItem';

interface DisplayProps {
  cardType: CardType;
  readOnly?: boolean;
  notUsedInProject?: boolean;
}

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
export default function CardTypeItem({
  cardType,
  readOnly,
  notUsedInProject,
}: DisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { project } = useProjectBeingEdited();

  return (
    <>
      <Flex direction="column" align="stretch" className={style}>
        <Flex justify="space-between">
          <h3>{cardType.title || 'card type'}</h3>
          {project && (
            <DropDownMenu
              icon={faEllipsisV}
              valueComp={{ value: '', label: '' }}
              buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
              entries={[
                ...(!readOnly
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
                ...(notUsedInProject
                  ? [
                      {
                        value: 'Use this type in the project',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faMapPin} /> Use in project
                          </>
                        ),
                        // TODO sandra work in progress : not working for global for the moment (access rights problem)
                        action: () => dispatch(API.addCardTypeToProject({ cardType, project })),
                      },
                    ]
                  : [
                      {
                        value: 'Remove this type from the project',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faExchangeAlt} /> Remove from project
                          </>
                        ),
                        action: () =>
                          dispatch(API.removeCardTypeFromProject({ cardType, project })),
                      },
                    ]),
                ...(!readOnly
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
                            onConfirm={() =>
                              dispatch(API.removeCardTypeFromProject({ cardType, project }))
                            }
                            confirmButtonLabel="Delete type"
                          />
                        ),
                      },
                    ]
                  : []),
              ]}
              onSelect={val => {
                val.action != null ? val.action() : navigate(val.value);
              }}
            />
          )}
        </Flex>
        <p className={lightItalicText}>
          <DocTextDisplay id={cardType.purposeId} />
        </p>
        <ResourceSummary kind={'CardType'} accessLevel={'READ'} cardTypeId={cardType.ownId} />
        <CardTypeTagsDisplay tags={cardType.tags} className={tagStyle} />
        {/*         <Button
          icon={cardType.deprecated ? faCheckSquare : faSquare}
          onClick={() =>
            dispatch(API.updateCardType({ ...cardType, deprecated: !cardType.deprecated }))
          }
        >
          Deprecated
        </Button>
        <Button
          icon={cardType.published ? faCheckSquare : faSquare}
          onClick={() =>
            dispatch(API.updateCardType({ ...cardType, published: !cardType.published }))
          }
        >
          Published
        </Button> */}
      </Flex>
    </>
  );
}