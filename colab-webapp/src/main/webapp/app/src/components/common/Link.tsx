/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { css, cx } from '@emotion/css';
import { NavLink } from 'react-router-dom';

const linkStyle = css({
  textDecoration: 'none',
  color: 'var(--fgColor)',
  ':hover': {
    backgroundColor: 'var(--hoverBgColor)',
    color: 'var(--hoverFgColor)',
  },
});

const mainMenuLink = cx(
  linkStyle,
  css({
    lineHeight: '44px',
    display: 'inline-block',
    paddingTop: '8px',
    paddingLeft: '10px',
  }),
);

const mainLinkActiveClass = cx(
  css({
    borderBottom: '6px solid var(--pictoLightBlue)',
  }),
);

const secondLevelLinkActiveClass = cx(
  css({
    borderBottom: '2px solid var(--pictoLightBlue)',
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
}

export const MainMenuLink = ({ to, exact = false, children }: LinkProps) => {
  return (
    <NavLink exact={exact} to={to} activeClassName={mainLinkActiveClass} className={mainMenuLink}>
      {children}
    </NavLink>
  );
};

export const SecondLevelLink = ({ to, exact = false, children }: LinkProps) => {
  return (
    <NavLink
      exact={exact}
      to={to}
      activeClassName={secondLevelLinkActiveClass}
      className={secondLevelLink}
    >
      {children}
    </NavLink>
  );
};

export const InlineLink = ({ to, exact = false, children }: LinkProps) => {
  return (
    <NavLink exact={exact} to={to} className={inlineLink}>
      {children}
    </NavLink>
  );
};
