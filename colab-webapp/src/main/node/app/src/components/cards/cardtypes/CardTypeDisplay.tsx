/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV, faPaw, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { dispatch } from '../../../store/store';
import Button from '../../common/Button';
import DropDownMenu from '../../common/DropDownMenu';
import { useBlock } from '../../live/LiveTextEditor';
import { ProjectName } from '../../projects/ProjectName';
import { cardShadow, lightIconButtonStyle } from '../../styling/style';

interface DisplayProps {
  cardType: CardType;
  readOnly?: boolean;
  notUsedInProject?: boolean;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
  background: 'white',
  boxShadow: cardShadow,
});

export default function CardTypeDisplay({
  cardType,
  readOnly,
  notUsedInProject,
}: DisplayProps): JSX.Element {
  const purpose = useBlock(cardType.purposeId);
  const { project } = useProjectBeingEdited();

  return (
    <div className={style}>
      {cardType && cardType.id && project && project.id && (
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
          entries={[
            ...(notUsedInProject
              ? [
                  {
                    value: 'Use this type in the project',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faPaw} /> Use in project
                      </>
                    ),
                    // TODO sandra work in progress : not working for global for the moment (access rights problem)
                    action: () => dispatch(API.addCardTypeToProject({ cardType, project })),
                  },
                ]
              : [
                  {
                    value: 'Remove this type from the project',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faTrash} /> Remove type
                      </>
                    ),
                    // TODO sandra work in progress : not working for inherited from other project for the moment (mostly)
                    action: () => dispatch(API.removeCardTypeFromProject({ cardType, project })),
                  },
                ]),
          ]}
          onSelect={val => {
            val.action != null && val.action();
          }}
        />
      )}
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
      <Button icon={cardType.deprecated ? faCheckSquare : faSquare} clickable={!readOnly}>
        Deprecated
      </Button>
      <Button icon={cardType.published ? faCheckSquare : faSquare} clickable={!readOnly}>
        Published
      </Button>
    </div>
  );
}
