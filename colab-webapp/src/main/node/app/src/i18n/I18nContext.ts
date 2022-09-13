/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { en } from './en';
import { fr } from './fr';

export const languages = ['FR', 'EN'] as const;

export type Language = typeof languages[number]

export interface I18nState {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const I18nCtx = React.createContext<I18nState>({
  lang: 'EN',
  setLang: () => {},
});

export type ColabTranslations = typeof en;

export default function useTranslations(): typeof en {
  const { lang } = React.useContext(I18nCtx);

  if (lang === 'FR') {
    return fr;
  } else {
    return en;
  }
}

export function useLanguage(): Language {
  const { lang } = React.useContext(I18nCtx);
  return lang;
}