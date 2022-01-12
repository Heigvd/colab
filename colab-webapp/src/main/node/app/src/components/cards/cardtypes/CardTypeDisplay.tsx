/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import Button from '../../common/Button';
import { useBlock } from '../../live/LiveTextEditor';
import { ProjectName } from '../../projects/ProjectName';
import { cardShadow } from '../../styling/style';

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
  const purpose = useBlock(cardType.purposeId);

  return (
    <div className={style}>
      <div>Title: {cardType.title}</div>
      <div>Purpose: {purpose?.textData || ''}</div>
      <div>Tags: {cardType.tags.join('; ')}</div>
      <div>
        {cardType.projectId != null ? (
          <>
            Project : <ProjectName projectId={cardType.projectId} />
          </>
        ) : (
          <>Global type</>
        )}
      </div>
      <Button icon={cardType.deprecated ? faCheckSquare : faSquare}>Deprecated</Button>
      <Button icon={cardType.published ? faCheckSquare : faSquare}>Published</Button>
    </div>
  );
}
