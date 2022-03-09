/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { useProjectCardTypes } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import Collapsible from '../../common/Collapsible';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import { space_L, space_M } from '../../styling/style';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
  gap: space_L,
  marginBottom: space_L,
});

export default function CardTypeList(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { project } = useProjectBeingEdited();
  const cardTypes = useProjectCardTypes();
  const unfilteredCardTypes = (): CardType[] => {
    const cts: CardType[] = [];
    cardTypes.own.map(ct => cts.push(ct));
    cardTypes.inherited.map(ct => cts.push(ct));
    cardTypes.global.map(ct => cts.push(ct));
    return cts;
  };

  React.useEffect(() => {
    if (cardTypes.projectStatus === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardTypes(project));
      }
    }
    if (cardTypes.publishedStatus === 'UNSET') {
      // published type from other project or global types not yet knonw
      dispatch(API.getAvailablePublishedCardTypes());
    }
  }, [project, cardTypes, dispatch]);

  if (project == null) {
    return <i>No project</i>;
  } else {
    if (cardTypes.projectStatus !== 'READY' || cardTypes.publishedStatus !== 'READY') {
      return <InlineLoading />;
    } else {
      return (
        <>
          <Routes>
            <Route path="edit/:id/*" element={<CardTypeEditor />} />
            <Route
              path="*"
              element={
                <div>
                  <IconButton
                    icon={faArrowLeft}
                    title={'Back'}
                    iconColor="var(--darkGray)"
                    onClick={() => navigate('../')}
                    className={css({ display: 'inline', marginBottom: space_M })}
                  />
                  <Flex justify="space-between">
                    <h2>Card Types</h2>
                    <CardTypeCreator />
                  </Flex>
                  <h4>Project types</h4>
                  <div className={flexWrap}>
                    {unfilteredCardTypes().map(cardType => (
                      <CardTypeItem key={cardType.id} cardType={cardType} />
                    ))}
                  </div>
                  <Collapsible
                    title="Out of project types"
                    contentClassName={css({ flexDirection: 'column' })}
                  >
                    <div>
                      <h4>From your other projects</h4>
                      <div>
                        {cardTypes.published.map(cardType => (
                          <CardTypeItem
                            key={cardType.id}
                            cardType={cardType}
                            readOnly
                            notUsedInProject
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4>Global</h4>
                      <div>
                        {cardTypes.global.map(cardType => (
                          <CardTypeItem
                            key={cardType.id}
                            cardType={cardType}
                            readOnly
                            notUsedInProject
                          />
                        ))}
                      </div>
                    </div>
                  </Collapsible>
                </div>
              }
            />
          </Routes>
        </>
      );
    }
  }
}
