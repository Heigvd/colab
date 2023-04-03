/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { SolidButtonStyle, space_sm } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import CardCreator from './CardCreator';

interface CardCreatorAndOrganizeProps {
  rootContent: CardContent;
  organize: {
    organize: boolean;
    setOrganize: React.Dispatch<React.SetStateAction<boolean>>;
  };
  className?: string;
  organizeButtonClassName?: string;
  cardCreatorClassName?: string;
}

export default function CardCreatorAndOrganize({
  rootContent,
  organize,
  className,
  cardCreatorClassName,
  organizeButtonClassName,
}: CardCreatorAndOrganizeProps) {
  const i18n = useTranslations();

  const subCards = useAndLoadSubCards(rootContent.id);

  return (
    <Flex direction="column" gap={space_sm} align="center" className={className}>
      <CardCreator parentCardContent={rootContent} className={cardCreatorClassName} />
      {subCards && subCards.length > 1 && (
        <IconButton
          kind="ghost"
          className={cx(
            css({ alignSelf: 'flex-end' }),
            { [SolidButtonStyle('primary')]: organize.organize },
            organizeButtonClassName,
            /* css({
                  backgroundColor: 'var(--primary-main)',
                  color: 'var(--bg-primary)',
                  '&:hover'
                }), */
          )}
          title={i18n.modules.card.positioning.organizeCards}
          icon={'dashboard_customize'}
          onClick={() => organize.setOrganize(e => !e)}
        />
      )}
    </Flex>
  );
}
