/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Assignment } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import { useCard, useVariantsOrLoad } from '../../../store/selectors/cardSelector';
import CardContentStatusDisplay from '../../cards/CardContentStatus';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
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
    gridTemplateColumns: 'minmax(140px, max-content) max-content 1fr',
    gap: space_lg,
    alignItems: 'center',
    justifyContent: 'stretch',
    justifyItems: 'stretch',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid transparent',
    cursor: 'pointer',
    minWidth: 'fit-content',
    '&:hover': {
      border: '1px solid var(--primary-main)',
    },
    '&:active': {
      backgroundColor: 'var(--primary-fade)',
    },
  }),
);

interface TaskItemProps {
  assignment: Assignment;
  className?: string;
}

export default function TaskItem({ assignment, className }: TaskItemProps): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();

  const card = useCard(assignment.cardId);
  const cardContents = useVariantsOrLoad(typeof card === 'object' ? card : undefined);

  if (typeof card === 'object') {
    return (
      <>
        {(cardContents || []).map(variant => {
          return (
            <div
              key={variant.id}
              className={cx(taskItemStyle, className)}
              onClick={() => navigate(`./../edit/${card.id}`)}
            >
              <div className={multiLineEllipsisStyle}>
                {card.title ? card.title : i18n.modules.card.untitled}
                {variant?.title && ' - ' + variant?.title}
              </div>
              <span className={cx(lightTextStyle)}>
                {variant ? variant.completionLevel : '100'}%
              </span>
              <Flex justify="flex-end">
                <CardContentStatusDisplay
                  mode="semi"
                  status={variant ? variant.status : 'PREPARATION'}
                  showActive
                />
              </Flex>
            </div>
          );
        })}
      </>
    );
  }

  return <AvailabilityStatusIndicator status="ERROR" />;
}
