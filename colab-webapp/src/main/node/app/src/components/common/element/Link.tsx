/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, NavLinkProps, Link as SimpleLink, useLocation } from 'react-router';
import {
  activeIconButtonStyle,
  ghostIconButtonStyle,
  iconButtonStyle,
  inheritedDefaultTextStyle,
} from '../../../styling/style';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: NavLinkProps['className'];
  end?: boolean;
}

function defaultClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? activeIconButtonStyle : cx(iconButtonStyle, ghostIconButtonStyle);
}

export const MainMenuLink = ({ to, children, end, className }: LinkProps): JSX.Element => {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  const basePath = to.substring(0, to.lastIndexOf('/')) || '/';

  return (
    <NavLink
      end={end}
      className={className || defaultClassName({ isActive })}
      to={isActive && !end ? basePath : to}
    >
      {children}
    </NavLink>
  );
};

export const InlineLink = ({ to, children, className }: LinkProps): JSX.Element => {
  return (
    <NavLink to={to} className={className}>
      {children}
    </NavLink>
  );
};

export function Link({ to, children }: LinkProps): JSX.Element {
  return (
    <SimpleLink to={to} className={inheritedDefaultTextStyle}>
      {children}
    </SimpleLink>
  );
}
