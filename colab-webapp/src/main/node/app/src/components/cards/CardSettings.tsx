/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { CirclePicker, TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useAndLoadCardType } from '../../store/selectors/cardTypeSelector';
import { lightTextStyle, space_lg, space_sm } from '../../styling/style';
import { cardColors } from '../../styling/theme';
import Checkbox from '../common/element/Checkbox';
import Tips, { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import ContentStatusSelector from './CardContentStatusSelector';

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
      <div>
        <h3 className={marginDownSmall}>{i18n.modules.card.settings.color}</h3>
        <CirclePicker
          colors={Object.values(cardColors)}
          onChangeComplete={newColor => {
            dispatch(API.updateCard({ ...card, color: newColor.hex }));
          }}
          color={card.color || 'white'}
          width={'auto'}
          className={css({
            marginTop: space_sm,
            padding: space_sm,
            'div[title="#FFFFFF"]': {
              background: '#FFFFFF !important',
              boxShadow:
                (card.color || '#FFFFFF').toUpperCase() === '#FFFFFF'
                  ? 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px inset !important'
                  : 'rgba(0, 0, 0, 0.1) 0px 0px 6px 3px !important',
            },
          })}
        />
        <TwitterPicker
          colors={[]}
          color={card.color || 'white'}
          width={'auto'}
          triangle="hide"
          onChangeComplete={newColor => {
            dispatch(API.updateCard({ ...card, color: newColor.hex }));
          }}
          styles={{
            default: {
              card: {
                boxShadow: 'none',
                background: 'none',
                backgroundColor: 'none',
                border: 'none',
              },
            },
          }}
        />
      </div>
      <div>
        <h3 className={marginDownSmall}>{i18n.modules.card.settings.status}</h3>
        <ContentStatusSelector
          self={variant.status}
          onChange={status => dispatch(API.updateCardContent({ ...variant, status }))}
        />
      </div>
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
