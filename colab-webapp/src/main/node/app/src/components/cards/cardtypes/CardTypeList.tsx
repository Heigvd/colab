/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
  useAndLoadAvailableCardTypes,
  useAndLoadProjectCardTypes,
} from '../../../selectors/cardTypeSelector';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import Collapsible from '../../common/Collapsible';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import { space_L, space_M, space_S } from '../../styling/style';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';
import CardTypeListWithFilter from './CardTypeListWithFilter';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
  gap: space_L,
  marginBottom: space_L,
});

export default function CardTypeList(): JSX.Element {
  const navigate = useNavigate();

  const { cardTypes: projectCardTypes, status: projectCTStatus } = useAndLoadProjectCardTypes();
  const { cardTypes: availableCardTypes, status: availableCTStatus } =
    useAndLoadAvailableCardTypes();

  if (projectCTStatus !== 'READY') {
    return <AvailabilityStatusIndicator status={projectCTStatus} />;
  } else if (availableCTStatus !== 'READY') {
    return <AvailabilityStatusIndicator status={availableCTStatus} />;
  } else {
    return (
      <>
        <Routes>
          <Route path="edit/:id/*" element={<CardTypeEditor />} />
          <Route
            path="*"
            element={
              <Flex
                direction="column"
                grow={1}
                align="stretch"
                className={css({ alignSelf: 'stretch' })}
              >
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
                <CardTypeListWithFilter
                  cardTypes={projectCardTypes}
                  filterClassName={css({ paddingBottom: space_S })}
                >
                  {filteredCardTypes => (
                    <div className={flexWrap}>
                      {filteredCardTypes.map(cardType => (
                        <CardTypeItem key={cardType.ownId} cardType={cardType} />
                      ))}
                    </div>
                  )}
                </CardTypeListWithFilter>
                <Collapsible
                  title="Out of project types"
                  contentClassName={css({ flexDirection: 'column', alignItems: 'stretch' })}
                >
                  <CardTypeListWithFilter
                    cardTypes={availableCardTypes}
                    filterClassName={css({ paddingBottom: space_S })}
                  >
                    {filteredCardTypes => (
                      <div className={flexWrap}>
                        {filteredCardTypes.map(cardType => (
                          <CardTypeItem key={cardType.ownId} cardType={cardType} />
                        ))}
                      </div>
                    )}
                  </CardTypeListWithFilter>
                </Collapsible>
              </Flex>
            }
          />
        </Routes>
      </>
    );
  }
}
