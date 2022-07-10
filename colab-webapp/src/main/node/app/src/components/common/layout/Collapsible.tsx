/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { paddingAroundStyle, space_M, space_S } from '../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';

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
    padding: space_S,
    marginTop: space_S,
    borderBottom: '1px solid var(--darkGray)',
    color: 'var(--fgColor)',
    '&:hover': {
      color: 'var(--hoverfgColor)',
      backgroundColor: 'var(--lightGray)',
      cursor: 'pointer',
    },
  }),
);

export interface CollapsibleProps {
  icon?: IconProp;
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
          <FontAwesomeIcon
            icon={icon}
            title={tooltip}
            className={paddingAroundStyle([1, 3], space_S)}
          />
        )}
        {label}
        <IconButton
          icon={showContent ? faChevronUp : faChevronDown}
          title={
            tooltip
              ? showContent
                ? i18n.common.close + ' ' + tooltip
                : i18n.common.open + ' ' + tooltip
              : showContent
              ? i18n.common.close
              : i18n.common.open
          }
          className={css({ marginLeft: space_M })}
        />
      </Flex>
      <Flex className={cx(showContent ? openStyle : closeStyle, contentClassName)}>{children}</Flex>
    </>
  );
}
