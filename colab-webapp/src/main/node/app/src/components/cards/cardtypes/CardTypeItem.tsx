/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheck, faEllipsisV, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { useAppDispatch } from '../../../store/hooks';
import ConfirmDeleteModal from '../../common/ConfirmDeleteModal';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import {
  borderRadius,
  cardShadow,
  lightIconButtonStyle,
  space_M,
  space_S,
} from '../../styling/style';

interface DisplayProps {
  cardType: CardType;
}

const style = css({
  width: 'max-content',
  borderRadius: borderRadius,
  margin: '10px',
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
  alignSelf: 'flex-start',
});

export default function CardTypeItem({ cardType }: DisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //const allTags = useCardTypeTags();
  //const options = allTags.map(tag => ({ label: tag, value: tag }));

  return (
    <>
      <div className={style}>
        <Flex justify="space-between">
          <h3>{cardType.title || 'Untitled type'}</h3>
          <DropDownMenu
            icon={faEllipsisV}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
            entries={[
              {
                value: 'Edit type',
                label: <><FontAwesomeIcon icon={faPen} /> Edit Type</>,
                action: () => navigate(`./edit/${cardType.id}`),
              },
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
                        Are you <strong>sure</strong> you want to delete the whole project? This
                        will delete all cards inside.
                      </p>
                    }
                    onConfirm={() => dispatch(API.deleteCardType(cardType))}
                    confirmButtonLabel="Delete type"
                  />
                ),
              },
              {
                value: 'Deprecated',
                label: <>{cardType.deprecated && <FontAwesomeIcon icon={faCheck} />} Deprecated</>,
                action: () =>
                  dispatch(API.updateCardType({ ...cardType, deprecated: !cardType.deprecated })),
              },
              {
                value: 'Published',
                label: <>{cardType.published && <FontAwesomeIcon icon={faCheck} />} Published</>,
                action: () => dispatch(API.updateCardType({ ...cardType, published: !cardType.published })),
              },
            ]}
            onSelect={val => {
              val.action != null ? val.action() : navigate(val.value);
            }}
          />
        </Flex>

        {/* TODO get the purpose from its ID */}
        <p>{cardType.purposeId && cardType.purposeId.toString()}</p>
        <p>Resources: NUMBER OF RESOURCES</p>
        <Flex>
          {cardType.tags.map(tag => {
            return (
              <div key={tag} className={tagStyle}>
                {tag}
              </div>
            );
          })}
        </Flex>
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
      </div>
    </>
  );
}
