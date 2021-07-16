/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

const linkStyle = css({
  textDecoration: 'none',
  color: 'var(--linkColor)',
  ':hover': {
    backgroundColor: 'var(--linkHoverBgColor)',
    color: 'var(--linkHoverColor)',
  },
});

const mainMenuLink = cx(
  linkStyle,
  css({
    lineHeight: '44px',
    display: 'inline-block',
    padding: '8px 5px 0 5px',
    ':focus': {
      outlineStyle: 'inset',
    },
  }),
);

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

export const InlineLink = ({ to, exact = false, children }: LinkProps): JSX.Element => {
  return (
    <NavLink exact={exact} to={to} className={inlineLink}>
      {children}
    </NavLink>
  );
};
