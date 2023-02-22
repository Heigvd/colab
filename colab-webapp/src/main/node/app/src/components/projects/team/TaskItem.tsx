/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import CardContentStatusDisplay from '../../cards/CardContentStatus';
import Flex from '../../common/layout/Flex';
import {
  lightTextStyle,
  multiLineEllipsisStyle,
  p_md,
  space_lg,
  text_sm,
} from '../../styling/style';

const taskItemStyle = cx(
  p_md,
  text_sm,
  css({
    display: 'grid',
    gridTemplateColumns: 'minmax(170px, min-content) max-content 130px',
    gap: space_lg,
    alignItems: 'center',
    justifyContent: 'stretch',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid transparent',
    cursor: 'pointer',
    '&:hover': {
      border: '1px solid var(--primary-main)',
    },
    '&:active': {
      backgroundColor: 'var(--primary-fade)',
    },
  }),
);

interface TaskProps {
  variant?: CardContent;
  //TO IMPROVE
  card: Card;
  className?: string;
}

export default function Task({ variant, className, card }: TaskProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <div
      className={cx(taskItemStyle, className)}
      onClick={() => navigate(`./../../edit/${card.id}`)}
    >
      <div className={multiLineEllipsisStyle}>
        {card.title ? card.title : 'Card title'}
        {variant?.title}
      </div>
      <span className={cx(lightTextStyle)}>{variant ? variant.completionLevel : '100%'}</span>
      <Flex justify="flex-end">
        <CardContentStatusDisplay
          mode="semi"
          status={variant ? variant.status : 'PREPARATION'}
          showActive
        />
      </Flex>
    </div>
  );
}
