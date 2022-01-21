/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { space_M } from '../styling/style';

const linkStyle = css({
  textDecoration: 'none',
  color: 'var(--linkColor)',
  ':hover': {
    backgroundColor: 'var(--linkHoverBgColor)',
    color: 'var(--linkHoverColor)',
  },
});

export const mainMenuLink = css({
  textDecoration: 'none',
  color: 'var(--linkColor)',
  textTransform: 'uppercase',
  fontSize: '14px',
  padding: space_M,
  boxSizing: 'border-box',
  ':focus': {
    outline: 'none',
  },
  ':focus-visible': {
    outline: '1px solid blue',
  },
  ':hover': {
    backgroundColor: 'var(--hoverBgColor)',
    color: 'var(--linkHoverColor)',
  },
});

export const mainLinkActiveClass = cx(
  mainMenuLink,
  css({
    backgroundColor: 'var(--pictoSteelBlue)',
    pointerEvents: 'none',
    ':hover': {
      backgroundColor: 'var(--pictoSteelBlue)',
    },
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
  children: React.ReactNode;
  className?: NavLinkProps['className'];
}

function defaultClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? mainLinkActiveClass : mainMenuLink;
}

export const MainMenuLink = ({ to, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink className={className || defaultClassName} to={to}>
      {children}
    </NavLink>
  );
};

function secondDefaultClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? secondLevelLinkActiveClass : secondLevelLink;
}

export const SecondLevelLink = ({ to, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink to={to} className={className || secondDefaultClassName}>
      {children}
    </NavLink>
  );
};

export const InlineLink = ({ to, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink to={to} className={className || inlineLink}>
      {children}
    </NavLink>
  );
};
