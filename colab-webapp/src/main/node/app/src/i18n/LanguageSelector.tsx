/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import DropDownMenu, { entryStyle } from '../components/common/layout/DropDownMenu';
import { I18nCtx, Language } from './I18nContext';

export default function LanguageSelector(): JSX.Element {
  const { lang, setLang } = React.useContext(I18nCtx);

  const entries: { value: Language; label: React.ReactNode }[] = [
    { value: 'EN', label: <div>English</div> },
    { value: 'FR', label: <div>Français</div> },
  ];

  return (
    <DropDownMenu
      icon="language"
      showSelectedLabel
      entries={entries}
      value={lang}
      onSelect={entry => setLang(entry.value)}
      direction="left"
      className={css({ alignItems: 'stretch' })}
      buttonClassName={entryStyle}
    />
  );
}
