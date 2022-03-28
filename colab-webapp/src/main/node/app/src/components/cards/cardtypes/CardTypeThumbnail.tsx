/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useAndLoadTextOfDocument } from '../../../selectors/documentSelector';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import Flex from '../../common/Flex';
import Thumbnail from '../../common/Thumbnail';
import { borderRadius, cardShadow, space_M, space_S } from '../../styling/style';
import { CardTypeTagsDisplay } from './CardTypeTagItem';

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
  const { text: purpose } = useAndLoadTextOfDocument(cardType.purposeId);

  if (cardType.cardTypeId == null) {
    return <i>CardType without id is invalid...</i>;
  } else {
    return (
      <Thumbnail
        onClick={() => {
          if (cardType.cardTypeId != null) {
            onClick(cardType.cardTypeId);
          }
        }}
        className={highlighted ? selected : defaultStyle}
      >
        <div title={purpose || ''}>
          <div>
            <h3>{cardType.title}</h3>
          </div>
          <CardTypeTagsDisplay tags={cardType.tags} className={tagStyle} />
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
      className={cx(
        highlighted ? selected : defaultStyle,
        css({ display: 'flex', alignItems: 'center' }),
      )}
    >
      <Flex title={'Blank card type'} align="center">
        <FontAwesomeIcon icon={faFile} size="2x" />
        <div className={css({ paddingLeft: space_M })}>{'Blank card type'}</div>
      </Flex>
    </Thumbnail>
  );
}