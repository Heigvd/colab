/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';
import Flex from '../../../common/layout/Flex';
import Icon from '../../../common/layout/Icon';
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
  const i18n = useTranslations();
  return (
    <Flex>
      {/* resources on the type */}
      {displayChoices.showResources && (
        <Flex className={itemStyle}>
          <ResourcesListSummary
            resourcesOwnership={{
              kind: 'CardType',
              cardTypeId: cardType.ownId,
            }}
          />
        </Flex>
      )}

      {/* is published */}
      {displayChoices.showPublished && cardType.published && (
        <Flex className={itemStyle}>
           <Icon icon={'feed'} title={i18n.modules.cardType.info.referencedByOther} />
        </Flex>
      )}

      {/* is deprecated */}
      {displayChoices.showDeprecated && cardType.deprecated && (
        <Flex className={itemStyle}>
           <Icon
            icon={'warning'}
            title={i18n.modules.cardType.info.shouldNotBeUsed}
          />
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
