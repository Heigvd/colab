/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { MaterialIconsType } from '../../../styling/IconType';

export interface Item {
  icon: MaterialIconsType;
  nextToIconElement?: React.ReactNode;
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface SideCollapsibleContext<T extends { [key: string]: Item }> {
  items: T;
  openKey?: string | undefined;
  setOpenKey?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const defaultSideCollapsibleContext: SideCollapsibleContext<{ [key: string]: Item }> = {
  items: {},
  openKey: undefined,
  setOpenKey: () => {},
};

export const SideCollapsibleCtx = React.createContext(defaultSideCollapsibleContext);
