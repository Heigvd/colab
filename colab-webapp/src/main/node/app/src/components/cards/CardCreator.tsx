/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent } from 'colab-rest-client';
import { uniq } from 'lodash';
import * as React from 'react';
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
import { greyIconButtonChipStyle, marginAroundStyle, space_M, space_S } from '../styling/style';
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
  const blankTypePseudoId = 0;
  const dispatch = useAppDispatch();

  const [selectedType, setSelectedType] = React.useState<number>(blankTypePseudoId);
  const [selectAllTags, setSelectAllTags] = React.useState<boolean>(true);
  const [tagState, setTagState] = React.useState<Record<string, boolean> | undefined>(undefined);

  const { cardTypes, status } = useAndLoadProjectCardTypes();

  const projectTags = uniq([...cardTypes].flatMap(cardType => (cardType ? cardType.tags : [])));

  const eTags = Object.keys(tagState || []).filter(tag => tagState && tagState[tag]);

  const cardTypeFilteredByTag = cardTypes.filter(ty => ty.tags.find(tag => eTags.includes(tag)));

  const toggleAllTags = (val: boolean) => {
    setSelectAllTags(val);
    setTagState(
      projectTags.reduce<Record<string, boolean>>((acc, cur) => {
        acc[cur] = val;
        return acc;
      }, {}),
    );
  };

  const onSelect = React.useCallback((id: number) => {
    setSelectedType(id);
  }, []);

  React.useEffect(() => {
    if (selectedType !== blankTypePseudoId) {
      if (cardTypeFilteredByTag.find(ct => ct.cardTypeId === selectedType) == null) {
        setSelectedType(blankTypePseudoId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardTypeFilteredByTag /* no need to take blankTypePseudoId and selectedType into account */]);

  return (
    <OpenCloseModal
      title={
        'Create new ' +
        (parentCardContent.title ? 'subcard for ' + parentCardContent.title : 'card') +
        ' - choose the type'
      }
      collapsedChildren={
        customButton ? (
          customButton
        ) : (
          <IconButton icon={faPlus} className={greyIconButtonChipStyle} title="Add a card" /> // TODO harmonize "Add a card" / "Add Card"
        )
      }
      className={className}
      modalClassName={css({ width: '800px' })}
      footer={close => (
        <Flex
          justify="flex-end"
          grow={1}
          className={css({ padding: space_M, alignSelf: 'stretch' })}
        >
          <Button
            title="Cancel"
            onClick={close}
            invertedButton
            className={marginAroundStyle([2], space_S)}
          >
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
            Create card
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
              <Flex>
                <EmptyCardTypeThumbnail
                  onClick={onSelect}
                  highlighted={blankTypePseudoId === selectedType}
                />
              </Flex>
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
                  toggleAllTags={t => toggleAllTags(t)}
                />
              </Flex>
              <Flex direction="column">
                {/*cardTypeFiltered != null && cardTypeFiltered.length > 0 && (
                  <>
                    <Flex align="flex-end">
                      <h3>Inherited</h3>
                      <Tips>
                        Inherited types references either global types or types from others projects
                      </Tips>
                    </Flex>
                    <div className={listOfTypeStyle}>
                      {cardTypeFiltered.map(cardType => (
                        <CardTypeThumbnail
                          key={cardType.cardTypeId}
                          onClick={onSelect}
                          highlighted={cardType.cardTypeId === selectedType}
                          cardType={cardType}
                        />
                      ))}
                    </div>
                  </>
                )*/}
                {cardTypeFilteredByTag != null && cardTypeFilteredByTag.length > 0 ? (
                  <div className={listOfTypeStyle}>
                    {cardTypeFilteredByTag.map(cardType => {
                      return (
                        <CardTypeThumbnail
                          key={cardType.cardTypeId}
                          onClick={onSelect}
                          highlighted={cardType.cardTypeId === selectedType}
                          cardType={cardType}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Flex>
                    <p className={css({ color: 'var(--darkGray)' })}>
                      <i>No project type is defined in selected categories.</i>
                    </p>
                  </Flex>
                )}
                {/* TODO Think about it : 
                maybe it would be nice to have an easy way to access the project's card type manager 
                (sandra) */}
              </Flex>
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
