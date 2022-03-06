/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { useProjectCardTypes } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import Collapsible from '../../common/Collapsible';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import { space_M, workInProgressStyle } from '../../styling/style';
import CardTypeDisplay from './CardTypeDisplay';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export default function CardTypeList(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { project } = useProjectBeingEdited();
  const cardTypes = useProjectCardTypes();

  const createNewCb = React.useCallback(() => {
    if (project && project.id) {
      dispatch(
        API.createCardType({
          projectId: project.id,
          tags: [],
        }),
      );
    }
  }, [dispatch, project]);

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
                    className={css({ display: 'block', marginBottom: space_M })}
                  />
                  <h3>Card Types</h3>
                  <h4>Project own types</h4>
                  <IconButton onClick={createNewCb} icon={faPlus} title="Create new" />
                  <div className={flexWrap}>
                    {cardTypes.own.map(cardType => (
                      <CardTypeItem key={cardType.id} cardType={cardType} />
                    ))}
                  </div>
                  <h4>Types defined outside of the project and referenced in this project</h4>
                  <div className={flexWrap}>
                    {cardTypes.inherited.map(cardType => (
                      <CardTypeDisplay key={cardType.id} cardType={cardType} />
                    ))}
                  </div>
                  <Collapsible title="others" contentClassName={workInProgressStyle}>
                    <div>
                      <h4>from other projects</h4>
                      <div>
                        {cardTypes.published.map(cardType => (
                          <CardTypeDisplay
                            key={cardType.id}
                            cardType={cardType}
                            readOnly
                            notUsedInProject
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4>global</h4>
                      <div>
                        {cardTypes.global.map(cardType => (
                          <CardTypeDisplay
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
