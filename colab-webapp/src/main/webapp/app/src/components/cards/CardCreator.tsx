/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { CardContent } from 'colab-rest-client';
import IconButton from '../common/IconButton';
import { faPlus, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import Overlay from '../common/Overlay';
import { useCardTypes } from '../../selectors/cardTypeSelector';
import Loading from '../common/Loading';
import { getProjectCardTypes } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';
import CardTypeCreator from './cardtypes/CardTypeCreator';
import { css, cx } from '@emotion/css';
import { lightMode } from '../styling/style';

interface Props {
  parent: CardContent;
}

const listOfTypeStyle = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
});

export default function CardCreator({ parent }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const [state, setState] = React.useState<'COLLAPSED' | 'EXPANDED' | 'PENDING'>('COLLAPSED');
  const [selectedType, setSelectedType] = React.useState<number | undefined>();
  const { project } = useProjectBeingEdited();

  const onSelect = React.useCallback((id: number) => {
    setSelectedType(id);
  }, []);

  const cardTypes = useCardTypes();

  if (state === 'COLLAPSED') {
    return (
      <div>
        <IconButton
          icon={faPlus}
          title="Add sub-card"
          onClick={() => {
            setState('EXPANDED');
          }}
        />
      </div>
    );
  } else {
    if (cardTypes.status === 'UNSET') {
      if (project != null) {
        dispatch(getProjectCardTypes(project));
      }
    }
    if (cardTypes.status !== 'READY' || state === 'PENDING') {
      return <Loading />;
    } else {
      return (
        <Overlay>
          <div
            className={cx(
              lightMode,
              css({
                border: '1px solid grey',
                padding: '20px',
              }),
            )}
          >
            <div>
              <h2>Create a new subcard {parent.title ? 'for ' + parent.title : ''}</h2>
              <div>
                <h3>Common types</h3>
                <div className={listOfTypeStyle}>
                  {cardTypes.inheritedCardType.map(cardType => (
                    <CardTypeThumbnail
                      key={cardType.id}
                      onClick={onSelect}
                      highlighted={cardType.id === selectedType}
                      cardType={cardType}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3>Custom Types</h3>
                <div className={listOfTypeStyle}>
                  {cardTypes.projectCardType.map(cardType => (
                    <CardTypeThumbnail
                      key={cardType.id}
                      onClick={onSelect}
                      highlighted={cardType.id === selectedType}
                      cardType={cardType}
                    />
                  ))}
                  <CardTypeCreator
                    afterCreation={(id: number) => {
                      setSelectedType(id);
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <IconButton
                icon={faTimes}
                title="cancel"
                onClick={() => {
                  setState('COLLAPSED');
                }}
              />
              {selectedType != null ? (
                <IconButton
                  icon={faCheck}
                  title="create"
                  onClick={() => {
                    setState('PENDING');
                    dispatch(
                      API.createSubCard({
                        parent: parent,
                        cardTypeId: selectedType,
                      }),
                    ).then(() => {
                      setState('COLLAPSED');
                    });
                  }}
                />
              ) : null}
            </div>
          </div>
        </Overlay>
      );
    }
  }
}
