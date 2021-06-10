/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { css } from '@emotion/css';
import { CardType } from 'colab-rest-client';
import { cardShadow } from '../../styling/style';
import IconButton from '../../common/IconButton';
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { ProjectName } from '../../projects/ProjectName';

interface DisplayProps {
  cardType: CardType;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
  background: 'white',
  boxShadow: cardShadow,
});

export default function CardTypeDisplay({ cardType }: DisplayProps): JSX.Element {
  return (
    <div className={style}>
      <div>Title: {cardType.title}</div>
      <div>Purpose: {cardType.purpose}</div>
      <div>
        {cardType.projectId != null ? (
          <>
            Project : <ProjectName projectId={cardType.projectId} />
          </>
        ) : (
          <>Global type</>
        )}
      </div>
      <IconButton icon={cardType.deprecated ? faCheckSquare : faSquare}>Deprecated</IconButton>
      <IconButton icon={cardType.published ? faCheckSquare : faSquare}>Published</IconButton>
    </div>
  );
}
