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
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import Collapsible from '../../common/Collapsible';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
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
  const navigate = useNavigate();
  const { project } = useProjectBeingEdited();
  const { cardTypes: projectCardTypes, status: projectCTStatus } = useAndLoadProjectCardTypes();
  const { cardTypes: availableCardTypes, status: availableCTStatus } =
    useAndLoadAvailableCardTypes();

  if (project == null) {
    return <i>No project</i>;
  } else {
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
                    {projectCardTypes.map(cardType => (
                      <CardTypeItem key={cardType.ownId} cardType={cardType} />
                    ))}
                  </div>
                  <Collapsible
                    title="Out of project types"
                    contentClassName={css({ flexDirection: 'column' })}
                  >
                    <div>
                      <h4>From your other projects</h4>
                      <div className={flexWrap}>
                        {availableCardTypes
                          .filter(ct => ct.projectIdCT != null)
                          .map(cardType => (
                            <CardTypeItem
                              key={cardType.ownId}
                              cardType={cardType}
                              readOnly
                              notUsedInProject
                            />
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4>Global</h4>
                      <div className={flexWrap}>
                        {availableCardTypes
                          .filter(ct => ct.projectIdCT == null)
                          .map(cardType => (
                            <CardTypeItem
                              key={cardType.ownId}
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
