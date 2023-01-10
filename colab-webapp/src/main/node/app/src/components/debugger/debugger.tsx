/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import logger from '../../logger';
import { useAllProjectCards } from '../../selectors/cardSelector';
import SearchSortList, { IWidget } from '../common/collection/SearchSortList';
import Tabs, { Tab } from '../common/layout/Tabs';
import { cardStyle, space_S } from '../styling/style';
import DebugForm from './debugForm';
import DebugInput from './DebugInput';
import IconAsImage from './IconAsImage';
import PlayWithGridOrganizer from './PlayWithGridOrganizer';

export default function Debugger(): JSX.Element {
  const cards = useAllProjectCards();
      logger.info(cards);
  const cardsinfo : IWidget[] = cards.map((card) => {
    return { id: card.id?.toString() || '', title: card.title || '', color: card.color || '' }
  });
  return (
    <Tabs defaultTab="sortingList">
      <Tab name="input" label="input">
        <DebugInput />
      </Tab>
      <Tab name="form" label="form">
        <DebugForm />
      </Tab>
      <Tab name="grid" label="Grid">
        <PlayWithGridOrganizer />
      </Tab>
      <Tab name="icons" label="Icons">
        <IconAsImage />
      </Tab>
      <Tab name="sortingList" label="Search&sort">
         <SearchSortList itemComp={(item) => <><div className={cx(cardStyle, css({padding: space_S, width: '200px'}))}><h2>{item.title.length > 0 ? item.title : 'No title'}</h2><p>id:{item.id}</p><p>color:{item.color}</p></div></>}  widgets={cardsinfo}/>
      </Tab>
    </Tabs>
  );
}
