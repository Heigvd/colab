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
import { useProjectCardTypes } from '../../selectors/cardTypeSelector';
import Loading from '../common/Loading';
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
  const cardTypes = useProjectCardTypes();

  React.useEffect(() => {
    if (state !== 'EXPANDED') {
      if (cardTypes.projectStatus === 'UNSET') {
        if (project != null) {
          dispatch(API.getProjectCardTypes(project));
        }
      }
      if (cardTypes.publishedStatus === 'UNSET') {
        // published type from other project or global types not yet knonw
        dispatch(API.getPublishedCardTypes());
      }
    }
  }, [cardTypes.projectStatus, cardTypes.publishedStatus, dispatch]);

  const onSelect = React.useCallback((id: number) => {
    setSelectedType(id);
  }, []);

  if (state === 'COLLAPSED') {
    return (
      <div>
        <IconButton
          icon={faPlus}
          title="Add card"
          onClick={() => {
            setState('EXPANDED');
          }}
        />
      </div>
    );
  } else {
    if (
      cardTypes.projectStatus !== 'READY' ||
      cardTypes.publishedStatus !== 'READY' ||
      state === 'PENDING'
    ) {
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
                <h4>Global</h4>
                <div className={listOfTypeStyle}>
                  {cardTypes.global.map(cardType => (
                    <CardTypeThumbnail
                      key={cardType.id}
                      onClick={onSelect}
                      highlighted={cardType.id === selectedType}
                      cardType={cardType}
                    />
                  ))}
                </div>
                <h4>From other projects</h4>
                <div className={listOfTypeStyle}>
                  {cardTypes.published.map(cardType => (
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
                <h3>Project Types</h3>
                <h4>Inherited</h4>
                <div className={listOfTypeStyle}>
                  {cardTypes.inherited.map(cardType => (
                    <CardTypeThumbnail
                      key={cardType.id}
                      onClick={onSelect}
                      highlighted={cardType.id === selectedType}
                      cardType={cardType}
                    />
                  ))}
                </div>
                <h4>Custom</h4>
                <div className={listOfTypeStyle}>
                  {cardTypes.own.map(cardType => (
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
