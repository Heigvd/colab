/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { Card, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Tips from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import { space_lg } from '../styling/style';
import CardACL from './CardACL';
import InvolvementSelector from './InvolvementSelector';

interface CardInvolvementProps {
  card: Card;
}

export default function CardInvolvement({ card }: CardInvolvementProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const updateDefInvolvementLevel = React.useCallback(
    (value: InvolvementLevel | null) => {
      dispatch(API.updateCard({ ...card, defaultInvolvementLevel: value }));
    },
    [card, dispatch],
  );
  return (
    <>
      <Flex
        align="center"
        className={css({
          marginBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
          alignSelf: 'stretch',
        })}
      >
        <h2>{i18n.team.generalInvolvement}</h2>
        <Tips>{i18n.team.involvementHelper}</Tips>
      </Flex>
      <InvolvementSelector
        self={card.defaultInvolvementLevel}
        onChange={updateDefInvolvementLevel}
      />
      <CardACL card={card} />
    </>
  );
}
