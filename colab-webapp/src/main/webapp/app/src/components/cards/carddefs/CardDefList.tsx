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
import { useCardDefs } from '../../../selectors/cardDefSelector';
import InlineLoading from '../../common/InlineLoading';
import { CardDef } from 'colab-rest-client';
import AutoSaveInput from '../../common/AutoSaveInput';
import IconButton from '../../common/IconButton';

interface DisplayProps {
  cardDef: CardDef;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
});

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

const CardDefEditor = ({ cardDef }: DisplayProps) => {
  const dispatch = useAppDispatch();

  return (
    <div className={style}>
      <AutoSaveInput
        label="Title: "
        placeholder=""
        inputType="INPUT"
        value={cardDef.title || ''}
        onChange={newValue => dispatch(API.updateCardDef({ ...cardDef, title: newValue }))}
      />
      <AutoSaveInput
        label="Purpose: "
        placeholder=""
        inputType="TEXTAREA"
        value={cardDef.purpose || ''}
        onChange={newValue => dispatch(API.updateCardDef({ ...cardDef, purpose: newValue }))}
      />
    </div>
  );
};

const CardDefDisplay = ({ cardDef }: DisplayProps) => {
  return (
    <div className={style}>
      <div>Title: {cardDef.title}</div>
      <div>Purpose: {cardDef.purpose}</div>
    </div>
  );
};

export interface Props {}

export default ({}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();
  const cardDefs = useCardDefs();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardDef({
        projectId: project!.id!,
        cardDef: {
          '@class': 'CardDef',
        },
      }),
    );
  }, [dispatch, project]);

  if (project == null) {
    return <i>No project</i>;
  } else {
    if (cardDefs.status === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardDefs(project));
      }
    }

    if (cardDefs.status !== 'READY') {
      return <InlineLoading />;
    } else {
      return (
        <div>
          <h3>Card Definition</h3>
          <h4>Project own types</h4>
          <IconButton onClick={createNewCb} icon={faPlus} />
          <div className={flexWrap}>
            {cardDefs.projectCardDef.map(cardDef => (
              <CardDefEditor key={cardDef.id} cardDef={cardDef} />
            ))}
          </div>
          <h4>Global types</h4>
          <div className={flexWrap}>
            {cardDefs.inheritedCardDef.map(cardDef => (
              <CardDefDisplay key={cardDef.id} cardDef={cardDef} />
            ))}
          </div>
        </div>
      );
    }
  }
};
