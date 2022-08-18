/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Tips, { WIPContainer } from '../common/element/Tips';
import Checkbox from '../common/Form/Checkbox';
import SelectInput from '../common/Form/SelectInput';
import Flex from '../common/layout/Flex';
import { iconStyle, space_M } from '../styling/style';
import ContentStatusSelector from './ContentStatusSelector';

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

  return (
    <Flex className={css({ gap: space_M })} direction="column" shrink={1}>
      <Flex align="center">
        <Checkbox
          label={
            <>
              <FontAwesomeIcon icon={faLock} className={iconStyle} /> {i18n.modules.card.settings.locked}
            </>
          }
          value={variant.frozen}
          onChange={value => dispatch(API.updateCardContent({ ...variant, frozen: value }))}
        />
        <Tips>
        {i18n.modules.card.infos.lockingCard}
        </Tips>
      </Flex>
      <div>
        <h3 className={marginDownSmall}>{i18n.modules.card.settings.cardColor}</h3>
        <TwitterPicker
          colors={['#B54BB2', '#B63E3E', '#3DC15C', '#37A8D8', '#DFCA2A', '#9C9C9C', '#FFFFFF']}
          color={card.color || 'white'}
          triangle="hide"
          onChangeComplete={newColor => {
            dispatch(API.updateCard({ ...card, color: newColor.hex }));
          }}
          styles={{
            default: { swatch: { boxShadow: 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.1)' } },
          }}
        />
      </div>
      <div>
        <h3 className={marginDownSmall}>{i18n.modules.card.settings.contentStatus}</h3>
        <ContentStatusSelector
          self={variant.status}
          onChange={status => dispatch(API.updateCardContent({ ...variant, status: status }))}
        />
      </div>
      <WIPContainer>
        <Flex>
          <h3 className={marginDownSmall}>{i18n.modules.card.settings.completionLevelMode}</h3>
          <Tips tipsType="TODO">
          {i18n.modules.card.infos.completionModeInfo}
          </Tips>
        </Flex>
        <SelectInput
          value={String(variant.completionMode)}
          placeholder={String(variant.completionMode)}
          options={[]}
          onChange={() => {}}
          isMulti={false}
        />
      </WIPContainer>
    </Flex>
  );
}
