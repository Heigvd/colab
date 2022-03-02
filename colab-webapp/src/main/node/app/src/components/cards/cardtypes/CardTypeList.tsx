/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { useProjectCardTypes } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import { space_M } from '../../styling/style';
import CardTypeDisplay from './CardTypeDisplay';
import CardTypeManager from './CardTypeManager';

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
    dispatch(
      API.createCardType({
        projectId: project!.id!,
        tags: [],
      }),
    );
  }, [dispatch, project]);

  React.useEffect(() => {
    if (cardTypes.projectStatus === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardTypes(project));
      }
    }
    if (cardTypes.publishedStatus === 'UNSET') {
      // published type from other project or global types not yet knonw
      dispatch(API.getPublishedCardTypes());
    }
  }, [project, cardTypes, dispatch]);

  if (project == null) {
    return <i>No project</i>;
  } else {
    if (cardTypes.projectStatus !== 'READY' || cardTypes.publishedStatus !== 'READY') {
      return <InlineLoading />;
    } else {
      return (
        <div>
          <IconButton
            icon={faArrowLeft}
            title={'Back to project'}
            iconColor="var(--darkGray)"
            onClick={() => navigate('./editor/' + project.id)}
            className={css({ display: 'block', marginBottom: space_M })}
          />
          <h3>Card Types</h3>
          <h4>Project own types</h4>
          <IconButton onClick={createNewCb} icon={faPlus} title="Create new" />
          <div className={flexWrap}>
            {cardTypes.own.map(cardType => (
              <CardTypeManager key={cardType.id} cardType={cardType} />
            ))}
          </div>
          <h4>Inherited</h4>
          <div className={flexWrap}>
            {cardTypes.inherited.map(cardType => (
              <CardTypeDisplay key={cardType.id} cardType={cardType} />
            ))}
          </div>
        </div>
      );
    }
  }
}
