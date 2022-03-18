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
import { paddingAroundStyle, space_M, space_S } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';

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
const collapseTitleStyle = cx(
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
  open?: boolean;
  children: React.ReactNode;
  titleClassName?: string;
  contentClassName?: string;
  title: string | React.ReactNode;
  tooltip?: string;
}

export default function Collapsible({
  icon,
  open,
  children,
  titleClassName,
  contentClassName,
  title,
  tooltip,
}: CollapsibleProps): JSX.Element {
  const [showContent, setShowContent] = React.useState<boolean>(open || false);
  return (
    <>
      <Flex
        align="center"
        className={cx(collapseTitleStyle, titleClassName)}
        onClick={() => setShowContent(showContent => !showContent)}
      >
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={paddingAroundStyle([1, 3], space_S)}
            title={tooltip}
          />
        )}
        {title}
        <IconButton
          icon={showContent ? faChevronUp : faChevronDown}
          title={
            tooltip
              ? showContent
                ? 'Close ' + tooltip
                : 'Open ' + tooltip
              : showContent
              ? 'Close'
              : 'Open'
          }
          className={css({ marginLeft: space_M })}
        />
      </Flex>
      <Flex className={cx(showContent ? openStyle : closeStyle, contentClassName)}>{children}</Flex>
    </>
  );
}
