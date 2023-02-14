/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { space_sm } from '../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';
import Icon from './Icon';

const openStyle = css({
  maxHeight: '40000px',
  transition: 'max-height 500ms ease-in-out',
  overflow: 'hidden',
});

const closeStyle = css({
  maxHeight: '0px',
  transition: 'max-height 500ms ease-in-out',
  overflow: 'hidden',
});

const defaultLabelStyle = cx(
  css({
    padding: space_sm,
    marginTop: space_sm,
    borderBottom: '1px solid var(--lightGray)',
    color: 'var(--fgColor)',
    '&:hover': {
      color: 'var(--hoverfgColor)',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
    },
  }),
);

export interface CollapsibleProps {
  icon?: string;
  label: string | React.ReactNode;
  open?: boolean;
  tooltip?: string;
  children: React.ReactNode;
  labelClassName?: string;
  contentClassName?: string;
}

export default function Collapsible({
  icon,
  label,
  open,
  tooltip,
  children,
  labelClassName,
  contentClassName,
}: CollapsibleProps): JSX.Element {
  const i18n = useTranslations();

  const [showContent, setShowContent] = React.useState<boolean>(open || false);

  return (
    <>
      <Flex
        align="center"
        onClick={() => setShowContent(showContent => !showContent)}
        className={cx(defaultLabelStyle, labelClassName)}
      >
        {icon && (
           <Icon
            icon={icon}
            title={tooltip}
          />
        )}
        {label}
        <IconButton
          icon={showContent ? 'chevron_up' : 'chevron_down'}
          title={
            tooltip
              ? showContent
                ? i18n.common.close + ' ' + tooltip
                : i18n.common.open + ' ' + tooltip
              : showContent
              ? i18n.common.close
              : i18n.common.open
          }
          className={css({ marginLeft: space_sm })}
        />
      </Flex>
      <Flex className={cx(showContent ? openStyle : closeStyle, contentClassName)}>{children}</Flex>
    </>
  );
}
