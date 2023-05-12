/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useAndLoadCardType } from '../../store/selectors/cardTypeSelector';
import { lightTextStyle, space_lg } from '../../styling/style';
import Checkbox from '../common/element/Checkbox';
import Tips, { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

const marginDownSmall = css({
  marginBottom: 0,
});

interface CardSettingsProps {
  card: Card;
  variant: CardContent;
  onClose: () => void;
}

export default function CardSettings({ card, variant }: CardSettingsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { cardType } = useAndLoadCardType(card.cardTypeId);

  return (
    <Flex className={css({ gap: space_lg })} direction="column" shrink={1}>
      <Flex align="center">
        <Checkbox
          label={
            <>
              <Icon icon={'lock'} /> {i18n.modules.card.settings.locked}
            </>
          }
          value={variant.frozen}
          onChange={value => dispatch(API.updateCardContent({ ...variant, frozen: value }))}
        />
        <Tips>{i18n.modules.card.infos.lockingCard}</Tips>
      </Flex>
      <WIPContainer>
        <Flex>
          <h3>{i18n.modules.cardType.cardType}</h3>
        </Flex>
        {cardType == null ? (
          <span>{i18n.modules.cardType.noCardType}</span>
        ) : (
          <span className={lightTextStyle}>{cardType.title}</span>
        )}
      </WIPContainer>
      {/* not implemented yet
      <WIPContainer>
        <Flex>
          <h3 className={marginDownSmall}>{i18n.modules.card.settings.completionLevelMode}</h3>
          <Tips tipsType="TODO">{i18n.modules.card.infos.completionModeInfo}</Tips>
        </Flex>
        <SelectInput
          value={String(variant.completionMode)}
          isClearable={false}
          isMulti={false}
          options={[]}
          onChange={() => {}}
        />
      </WIPContainer> */}
    </Flex>
  );
}
