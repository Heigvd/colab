/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Checkbox from '../common/Form/Checkbox';
import OpenClose from '../common/OpenClose';
import Tabs, { Tab } from '../common/Tabs';
import { paddedContainerStyle } from '../styling/style';
import CardACL from './CardACL';
import ContentStatusSelector from './ContentStatusSelector';
import InvolvementSelector from './InvolvementSelector';

interface Props {
  card: Card;
  variant: CardContent;
  onClose: () => void;
}

export default function CardSettings({ card, variant }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const updateDefInvolvementLevel = React.useCallback(
    (value: InvolvementLevel | null) => {
      dispatch(API.updateCard({ ...card, defaultInvolvementLevel: value }));
    },
    [card, dispatch],
  );

  return (
    <Tabs>
      <Tab name="settings" label={i18n.card.settings.title}>
        <Flex className={paddedContainerStyle} direction="column" shrink={1}>
          <TwitterPicker
            colors={['#EDD3EC', '#EAC2C2', '#CCEFD4', '#E1F2F9', '#F9F5D6', '#F6F1F1']}
            color={card.color || 'white'}
            triangle="hide"
            onChangeComplete={newColor => {
              dispatch(API.updateCard({ ...card, color: newColor.hex }));
            }}
          />

          <ContentStatusSelector
            self={variant.status}
            onChange={status => dispatch(API.updateCardContent({ ...variant, status: status }))}
          />

          <Checkbox
            label="frozen"
            value={variant.frozen}
            onChange={value => dispatch(API.updateCardContent({ ...variant, frozen: value }))}
          />
        </Flex>
      </Tab>
      <Tab name="acl" label={i18n.card.settings.acl.title}>
        <Flex className={paddedContainerStyle} direction="column" shrink={1}>
          <InvolvementSelector
            self={card.defaultInvolvementLevel}
            onChange={updateDefInvolvementLevel}
          />
          <OpenClose
            closeIcon={faCheck}
            collapsedChildren={
              <span>
                <FontAwesomeIcon icon={faUsers} />
              </span>
            }
          >
            {() => <CardACL card={card} />}
          </OpenClose>
        </Flex>
      </Tab>
    </Tabs>
  );
}
