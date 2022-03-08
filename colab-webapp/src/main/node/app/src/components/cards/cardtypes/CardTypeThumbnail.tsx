/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import Flex from '../../common/Flex';
import Thumbnail from '../../common/Thumbnail';
import { useBlock } from '../../live/LiveTextEditor';
import { borderRadius, cardShadow, space_S } from '../../styling/style';

interface Props {
  highlighted: boolean;
  cardType: CardType;
  onClick: (id: number) => void;
}

interface EmptyCardTypeProps {
  highlighted: boolean;
  onClick: (id: number) => void;
}

const defaultStyle = css({
  border: '4px solid transparent',
  cursor: 'pointer',
  boxShadow: cardShadow,
  borderRadius: borderRadius,
  '&:hover': {
    backgroundColor: 'var(--primaryColorContrastShade)',
  },
});

const selected = cx(
  defaultStyle,
  css({
    border: '4px solid var(--primaryColor)',
    boxShadow: '0 0 10px 1px rgba(0, 0, 0, 0)',
  }),
);

const tagStyle = css({
  borderRadius: borderRadius,
  padding: space_S,
  marginRight: space_S,
  border: '1px solid var(--darkGray)',
  color: 'var(--darkGray)',
  fontSize: '0.8em',
});

export default function CardTypeThumbnail({ cardType, highlighted, onClick }: Props): JSX.Element {
  const purpose = useBlock(cardType.purposeId);

  if (cardType.id == null) {
    return <i>CardType without id is invalid...</i>;
  } else {
    return (
      <Thumbnail
        onClick={() => {
          if (cardType.id != null) {
            onClick(cardType.id);
          }
        }}
        className={highlighted ? selected : defaultStyle}
      >
        <div title={purpose?.textData || ''}>
          <div>
            <h3>{cardType.title}</h3>
          </div>
          <Flex grow={1} align="flex-end">
            {cardType.tags.map(tag => {
              return (
                <div key={tag} className={tagStyle}>
                  {tag}
                </div>
              );
            })}
          </Flex>
        </div>
      </Thumbnail>
    );
  }
}

export function EmptyCardTypeThumbnail({ highlighted, onClick }: EmptyCardTypeProps): JSX.Element {
  return (
    <Thumbnail
      onClick={() => {
        onClick(0);
      }}
      className={highlighted ? selected : defaultStyle}
    >
      <Flex title={'Blank card type'} align="center">
        <FontAwesomeIcon icon={faFile} size="2x" />
        <div className={css({ paddingLeft: space_S })}>{'Blank card type'}</div>
      </Flex>
    </Thumbnail>
  );
}
