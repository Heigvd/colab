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
import ResourcesListSummary from '../../resources/summary/ResourcesListSummary';
import {
  borderRadius,
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
  highlighted?: boolean;
  cardType?: CardType | null;
  onClick?: (id: number) => void;
}

// TODO : make functional Flex/div

export default function CardTypeThumbnail({ cardType }: CardTypeThumbnailProps): JSX.Element {
  const isEmpty = cardType === null || cardType === undefined;
  const { text: purpose } = useAndLoadTextOfDocument(cardType ? cardType.purposeId : null);
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
        <Flex title={'Blank card type'} align="center" justify='center' grow={1}>
          <FontAwesomeIcon icon={faFile} size="3x" />
          <div className={css({ paddingLeft: space_M })}><h3>{'Blank card type'}</h3></div>
        </Flex>
      ) : (
        <>
          <Flex direction="column" align="stretch" grow={1}>
            <Flex justify='space-between'>
              <Flex direction="column">
                <h3 className={oneLineEllipsis}>{cardType.title}</h3>
                <p className={cx(lightItalicText, textSmall, multiLineEllipsis, css({maxWidth: '100%'}))}>{purpose}</p>
              </Flex>
              <p className={cx(lightItalicText, textSmall, css({whiteSpace: 'nowrap'}))}>
                <ResourcesListSummary
                  kind={'CardType'}
                  accessLevel={'READ'}
                  cardTypeId={cardType.ownId}
                />
              </p>
            </Flex>
            <TagsDisplay tags={cardType.tags} className={tagStyle} />
          </Flex>
        </>
      )}
    </>
  );
}
