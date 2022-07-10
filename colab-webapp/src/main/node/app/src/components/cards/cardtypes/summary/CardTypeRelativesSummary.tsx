/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faBullhorn, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';
import Flex from '../../../common/layout/Flex';
import ResourcesListSummary from '../../../resources/summary/ResourcesListSummary';
import { space_M } from '../../../styling/style';
import TargetCardTypeSummary from './TargetCardTypeSummary';

const itemStyle = css({
  marginRight: space_M,
});

interface CardTypeRelativesSummaryProps {
  cardType: CardType;
  displayChoices?: {
    showResources: boolean;
    showPublished: boolean;
    showDeprecated: boolean;
    showTargetCardType: boolean;
  };
}

export default function CardTypeRelativesSummary({
  cardType,
  displayChoices = {
    showResources: true,
    showPublished: false,
    showDeprecated: false,
    showTargetCardType: false,
  },
}: CardTypeRelativesSummaryProps): JSX.Element {
  return (
    <Flex>
      {/* resources on the type */}
      {displayChoices.showResources && (
        <Flex className={itemStyle}>
          <ResourcesListSummary
            kind={'CardType'}
            accessLevel={'READ'}
            cardTypeId={cardType.ownId}
          />
        </Flex>
      )}

      {/* is published */}
      {displayChoices.showPublished && cardType.published && (
        <Flex className={itemStyle}>
          <FontAwesomeIcon
            icon={faBullhorn}
            title="It can be referenced by other projects (with regards to access rights)"
          />
        </Flex>
      )}

      {/* is deprecated */}
      {displayChoices.showDeprecated && cardType.deprecated && (
        <Flex className={itemStyle}>
          <FontAwesomeIcon icon={faTriangleExclamation} title="It should not be used anymore" />
        </Flex>
      )}

      {/* target card type  */}
      {displayChoices.showTargetCardType && cardType.kind === 'referenced' && (
        <Flex className={itemStyle}>
          <TargetCardTypeSummary cardType={cardType} />
        </Flex>
      )}
    </Flex>
  );
}
