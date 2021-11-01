/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../../API/api';
import { useProjectCardTypes } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import CardTypeDisplay from './CardTypeDisplay';
import CardTypeEditor from './CardTypeEditor';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export default function CardTypeList(): JSX.Element {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();
  const cardTypes = useProjectCardTypes();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardType({
        projectId: project!.id!,
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
          <h3>Card Types</h3>
          <h4>Project own types</h4>
          <IconButton onClick={createNewCb} icon={faPlus} />
          <div className={flexWrap}>
            {cardTypes.own.map(cardType => (
              <CardTypeEditor key={cardType.id} cardType={cardType} />
            ))}
          </div>
          <h4>Inherited</h4>
          <div className={flexWrap}>
            {cardTypes.inherited.map(cardType => (
              <CardTypeDisplay key={cardType.id} cardType={cardType} />
            ))}
          </div>
          <h4>From other projects</h4>
          <div className={flexWrap}>
            {cardTypes.published.map(cardType => (
              <CardTypeDisplay key={cardType.id} cardType={cardType} />
            ))}
          </div>
          <h4>Global</h4>
          <div className={flexWrap}>
            {cardTypes.global.map(cardType => (
              <CardTypeDisplay key={cardType.id} cardType={cardType} />
            ))}
          </div>
        </div>
      );
    }
  }
}
