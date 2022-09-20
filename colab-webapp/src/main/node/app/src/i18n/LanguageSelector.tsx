/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import DropDownMenu from '../components/common/layout/DropDownMenu';
import { buttonStyle, mainHeaderHeight } from '../components/styling/style';
import { I18nCtx, Language } from './I18nContext';

export default function LanguageSelector(): JSX.Element {
  const { lang, setLang } = React.useContext(I18nCtx);

  const entries: { value: Language; label: React.ReactNode }[] = [
    { value: 'EN', label: <div>English</div> },
    { value: 'FR', label: <div>Français</div> },
  ];
  const valueComp: { value: Language; label: React.ReactNode } =
    lang == 'EN' ? { value: 'EN', label: <div>EN</div> } : { value: 'FR', label: <div>FR</div> };

  return (
    <DropDownMenu
      height={mainHeaderHeight}
      //icon={faGlobeAmericas}
      value={lang}
      valueComp={valueComp}
      entries={entries}
      onSelect={entry => setLang(entry.value)}
      idleHoverStyle="BACKGROUND"
      buttonClassName={buttonStyle}
    />
  );
}
