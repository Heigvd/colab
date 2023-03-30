/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import logger from '../../logger';
import { useAllProjectCards } from '../../store/selectors/cardSelector';
import SearchSortList, { IWidget } from '../common/collection/SearchSortList';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Icon from '../common/layout/Icon';
import Tabs, { Tab } from '../common/layout/Tabs';
import TextEditorWrapper from '../documents/texteditor/TextEditorWrapper';
import { allMaterialIcons } from '../styling/IconType';
import { cardStyle, space_sm } from '../styling/style';
import DebugForm from './debugForm';
import DebugInput from './DebugInput';
import DebugLoading from './DebugLoading';
import PlayWithGridOrganizer from './PlayWithGridOrganizer';

export default function Debugger(): JSX.Element {
  const cards = useAllProjectCards();
  logger.info(cards);
  const cardsinfo: IWidget[] = cards.map(card => {
    return { id: card.id?.toString() || '', title: card.title || '', color: card.color || '' };
  });

  return (
    <Tabs defaultTab="collab">
      <Tab name="icons" label="icons">
        <div>
          {allMaterialIcons.map(i => (
            <Icon key={i} icon={i} title={i} />
          ))}
        </div>
      </Tab>
      <Tab name="availability" label="availability">
        NOT_INITIALIZED <AvailabilityStatusIndicator status="NOT_INITIALIZED" />
        ERROR <AvailabilityStatusIndicator status="ERROR" />
        NOT_EDITING <AvailabilityStatusIndicator status="NOT_EDITING" />
        READY <AvailabilityStatusIndicator status="READY" />
        LOADING <AvailabilityStatusIndicator status="LOADING" />
      </Tab>
      <Tab name="loading" label="loading">
        <DebugLoading />
      </Tab>
      <Tab name="input" label="input">
        <DebugInput />
      </Tab>
      <Tab name="form" label="form">
        <DebugForm />
      </Tab>
      <Tab name="grid" label="Grid">
        <PlayWithGridOrganizer />
      </Tab>
      <Tab name="sortingList" label="Search&sort">
        <SearchSortList
          itemComp={item => (
            <>
              <div className={cx(cardStyle, css({ padding: space_sm, width: '200px' }))}>
                <h2>{item.title.length > 0 ? item.title : 'No title'}</h2>
                <p>id:{item.id}</p>
                <p>color:{item.color}</p>
              </div>
            </>
          )}
          widgets={cardsinfo}
        />
      </Tab>
      <Tab name="collab" label="Lexical 29">
        <TextEditorWrapper docId={29} editable={true} colab={true}></TextEditorWrapper>
      </Tab>
      <Tab name="collab2" label="Lexical 28">
        <TextEditorWrapper docId={28} editable={true} colab={true}></TextEditorWrapper>
      </Tab>
    </Tabs>
  );
}
