/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Checkbox from '../common/Form/Checkbox';
import SelectInput from '../common/Form/SelectInput';
import Tips, { WIPContainer } from '../common/Tips';
import { space_M } from '../styling/style';
import ContentStatusSelector from './ContentStatusSelector';

const marginDownSmall = css({
  marginBottom: 0,
});

interface Props {
  card: Card;
  variant: CardContent;
  onClose: () => void;
}

export default function CardSettings({ card, variant }: Props): JSX.Element {
  const dispatch = useAppDispatch();

  return (
        <Flex className={css({ gap: space_M })} direction="column" shrink={1}>
          <div>
            <h3 className={marginDownSmall}>Card color</h3>
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
            <h3 className={marginDownSmall}>Card content status</h3>
            <ContentStatusSelector
              self={variant.status}
              onChange={status => dispatch(API.updateCardContent({ ...variant, status: status }))}
            />
            <Checkbox
              label="frozen"
              value={variant.frozen}
              onChange={value => dispatch(API.updateCardContent({ ...variant, frozen: value }))}
            />
          </div>
          <WIPContainer>
            <Flex>
              <h3 className={marginDownSmall}>Completion level mode</h3>
              <Tips tipsType="TODO">
                Select completion mode (MANUAL | AUTO | NO_OP). Manual: input to set completion;
                Auto: based on children; No: do not event diplay the bar
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
