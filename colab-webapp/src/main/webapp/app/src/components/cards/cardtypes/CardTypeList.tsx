/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { css } from '@emotion/css';
import { useAppDispatch } from '../../../store/hooks';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useCardTypes } from '../../../selectors/cardTypeSelector';
import InlineLoading from '../../common/InlineLoading';
import IconButton from '../../common/IconButton';
import CardTypeEditor from './CardTypeEditor';
import CardTypeDisplay from './CardTypeDisplay';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export interface Props {}

export default ({}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();
  const cardTypes = useCardTypes();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardType({
        '@class': 'CardType',
        projectId: project!.id!,
      }),
    );
  }, [dispatch, project]);

  if (project == null) {
    return <i>No project</i>;
  } else {
    if (cardTypes.status === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardTypes(project));
      }
    }

    if (cardTypes.status !== 'READY') {
      return <InlineLoading />;
    } else {
      return (
        <div>
          <h3>Card Types</h3>
          <h4>Project own types</h4>
          <IconButton onClick={createNewCb} icon={faPlus} />
          <div className={flexWrap}>
            {cardTypes.projectCardType.map(cardType => (
              <CardTypeEditor key={cardType.id} cardType={cardType} />
            ))}
          </div>
          <h4>Global types</h4>
          <div className={flexWrap}>
            {cardTypes.inheritedCardType.map(cardType => (
              <CardTypeDisplay key={cardType.id} cardType={cardType} />
            ))}
          </div>
        </div>
      );
    }
  }
};
