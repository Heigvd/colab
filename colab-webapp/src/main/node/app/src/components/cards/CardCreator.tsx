/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent } from 'colab-rest-client';
import { uniq } from 'lodash';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useAndLoadProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import Button from '../common/Button';
import FilterableList from '../common/FilterableList';
//import FilterableList from '../common/FilterableList';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenCloseModal from '../common/OpenCloseModal';
import {
  greyIconButtonChipStyle,
  lightIconButtonStyle,
  marginAroundStyle,
  space_M,
  space_S,
} from '../styling/style';
import CardTypeThumbnail, { EmptyCardTypeThumbnail } from './cardtypes/CardTypeThumbnail';

export interface CardCreatorProps {
  parentCardContent: CardContent;
  customButton?: ReactJSXElement;
  className?: string;
}

const listOfTypeStyle = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: space_M,
  margin: space_M + ' 0',
});

export default function CardCreator({
  parentCardContent,
  customButton,
  className,
}: CardCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { cardTypes, status } = useAndLoadProjectCardTypes();
  const navigate = useNavigate();
  const projectTags = uniq([...cardTypes].flatMap(cardType => (cardType ? cardType.tags : [])));

  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  const [selectAllTags, setSelectAllTags] = React.useState<boolean>(true);

  const [tagState, setTagState] = React.useState<Record<string, boolean> | undefined>();

  const eTags = Object.keys(tagState || []).filter(tag => tagState && tagState[tag]);

  const cardTypeFilteredByTag = cardTypes.filter(ty => ty.tags.find(tag => eTags.includes(tag)));

  const toggleAllTags = React.useCallback(
    (val: boolean) => {
      setSelectAllTags(val);
      setTagState(
        projectTags.reduce<Record<string, boolean>>((acc, cur) => {
          acc[cur] = val;
          return acc;
        }, {}),
      );
    },
    [projectTags],
  );

  React.useEffect(() => {
    if (status === 'READY') {
      toggleAllTags(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status /* no effect when toggleAllTags changes */]);

  const onSelect = React.useCallback((id: number) => {
    if (!id) {
      setSelectedType(null);
    }
    setSelectedType(id);
  }, []);

  React.useEffect(() => {
    if (selectedType != null) {
      if (cardTypeFilteredByTag.find(ct => ct.cardTypeId === selectedType) == null) {
        setSelectedType(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardTypeFilteredByTag /* no need to take blankTypePseudoId and selectedType into account */]);

  return (
    <OpenCloseModal
      title={
        'Create a new ' +
        (parentCardContent.title ? 'subcard for ' + parentCardContent.title : 'card')
      }
      collapsedChildren={
        customButton ? (
          customButton
        ) : (
          <IconButton icon={faPlus} className={greyIconButtonChipStyle} title="Add a card" /> // TODO harmonize "Add a card" / "Add Card"
        )
      }
      className={className}
      modalClassName={css({ width: '800px', height: '580px' })}
      footer={close => (
        <Flex
          justify="flex-end"
          align="center"
          grow={1}
          className={css({ padding: space_M, alignSelf: 'stretch' })}
        >
          <IconButton
            onClick={function () {
              navigate('types');
            }}
            title="Manage card types"
            icon={faCog}
            className={lightIconButtonStyle}
          />
          <Button onClick={close} invertedButton className={marginAroundStyle([2], space_S)}>
            Cancel
          </Button>

          <Button
            title="Create card"
            onClick={() => {
              dispatch(
                API.createSubCardWithTextDataBlock({
                  parent: parentCardContent,
                  cardTypeId: selectedType,
                }),
              ).then(() => {
                close();
              });
            }}
          >
            Add a card
          </Button>
        </Flex>
      )}
      showCloseButton
    >
      {() => {
        if (status !== 'READY') {
          return <AvailabilityStatusIndicator status={status} />;
        } else {
          return (
            <div className={css({ width: '100%', textAlign: 'left' })}>
              {projectTags && projectTags.length > 0 && (
                <Flex
                  className={css({
                    paddingBottom: space_S,
                    marginBottom: space_S,
                    borderBottom: '1px solid var(--lightGray)',
                  })}
                  direction="column"
                  align="stretch"
                >
                  <FilterableList
                    tags={projectTags}
                    onChange={(t, cat) =>
                      setTagState(state => {
                        return { ...state, [cat]: t };
                      })
                    }
                    tagState={tagState}
                    stateSelectAll={selectAllTags}
                    toggleAllTags={toggleAllTags}
                  />
                </Flex>
              )}
              <Flex direction="column">
                <div className={listOfTypeStyle}>
                  <EmptyCardTypeThumbnail onClick={onSelect} highlighted={selectedType == null} />
                  {cardTypeFilteredByTag != null && cardTypeFilteredByTag.length > 0 && (
                    <>
                      {cardTypeFilteredByTag.map(cardType => {
                        return (
                          <CardTypeThumbnail
                            key={cardType.cardTypeId}
                            onClick={onSelect}
                            highlighted={selectedType === cardType.cardTypeId}
                            cardType={cardType}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              </Flex>
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
