/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { mainMenuLink } from '../styling/style';

const linkStyle = css({
  textDecoration: 'none',
  color: 'var(--linkColor)',
  ':hover': {
    backgroundColor: 'var(--linkHoverBgColor)',
    color: 'var(--linkHoverColor)',
  },
});

const mainLinkActiveClass = cx(
  css({
    borderBottom: '6px solid var(--pictoLightBlue)',
  }),
);

const secondLevelLinkActiveClass = cx(
  css({
    borderBottom: '2px solid var(--pictoOrange)',
  }),
);

const secondLevelLink = cx(
  linkStyle,
  css({
    marginLeft: '10px',
    textDecoration: 'none',
  }),
);

const inlineLink = cx(
  linkStyle,
  css({
    textDecoration: 'none',
  }),
);

interface LinkProps {
  to: string;
  exact?: boolean;
  children: React.ReactNode;
  isActive?: NavLinkProps['isActive'];
  className?: string;
}

export const MainMenuLink = ({ to, exact = false, children, isActive }: LinkProps): JSX.Element => {
  return (
    <NavLink
      isActive={isActive}
      exact={exact}
      to={to}
      activeClassName={mainLinkActiveClass}
      className={mainMenuLink}
    >
      {children}
    </NavLink>
  );
};

export const SecondLevelLink = ({
  to,
  exact = false,
  children,
  isActive,
}: LinkProps): JSX.Element => {
  return (
    <NavLink
      isActive={isActive}
      exact={exact}
      to={to}
      activeClassName={secondLevelLinkActiveClass}
      className={secondLevelLink}
    >
      {children}
    </NavLink>
  );
};

export const InlineLink = ({ to, exact = false, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink exact={exact} to={to} className={cx(className, inlineLink)}>
      {children}
    </NavLink>
  );
};
