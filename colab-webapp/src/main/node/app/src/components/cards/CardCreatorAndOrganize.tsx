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
  showOrganize?: boolean;
  className?: string;
  cardCreatorClassName?: string;
  organizeButtonClassName?: string;
}

export default function CardCreatorAndOrganize({
  rootContent,
  organize,
  showOrganize = true,
  className,
  cardCreatorClassName,
  organizeButtonClassName,
}: CardCreatorAndOrganizeProps) {
  const i18n = useTranslations();

  return (
    <Flex direction="column" gap={space_sm} align="center" className={className}>
      <CardCreator parentCardContent={rootContent} className={cardCreatorClassName} />
      {showOrganize && (
        <IconButton
          kind="ghost"
          className={cx(
            css({ alignSelf: 'flex-end' }),
            { [SolidButtonStyle('primary')]: organize.organize },
            organizeButtonClassName,
          )}
          title={i18n.modules.card.positioning.organizeCards}
          icon={'dashboard_customize'}
          onClick={() => organize.setOrganize(e => !e)}
        />
      )}
    </Flex>
  );
}
