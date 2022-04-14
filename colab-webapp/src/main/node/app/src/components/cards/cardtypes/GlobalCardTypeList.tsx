/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import * as API from '../../../API/api';
import { useAndLoadGlobalTypesForAdmin } from '../../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import IconButton from '../../common/IconButton';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export default function GlobalCardTypeList(): JSX.Element {
  const dispatch = useAppDispatch();
  const { cardTypes, status } = useAndLoadGlobalTypesForAdmin();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardType({
        projectId: null,
        tags: [],
      }),
    );
  }, [dispatch]);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <Routes>
        <Route path="edit/:id/*" element={<CardTypeEditor />} />
        <Route
          path="*"
          element={
            <div>
              <h3>Global Card Types</h3>
              <IconButton onClick={createNewCb} icon={faPlus} title="Add a type" />
              <div className={flexWrap}>
                {cardTypes.map(cardType => (
                  <CardTypeItem key={cardType.cardTypeId} cardType={cardType} />
                ))}
              </div>
            </div>
          }
        />
      </Routes>
    );
  }
}
