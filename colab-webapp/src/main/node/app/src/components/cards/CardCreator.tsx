/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent, CardType } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useCardTypeTags, useProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import FilterableList from '../common/FilterableList';
//import FilterableList from '../common/FilterableList';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import OpenCloseModal from '../common/OpenCloseModal';
import Tips from '../common/Tips';
import {
  greyIconButtonChipStyle,
  marginAroundStyle,
  space_M,
  space_S,
} from '../styling/style';
import CardTypeThumbnail, { EmptyCardTypeThumbnail } from './cardtypes/CardTypeThumbnail';

export interface CardCreatorProps {
  parent: CardContent;
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
  parent,
  customButton,
  className,
}: CardCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [selectedType, setSelectedType] = React.useState<number | undefined>(0);
  const [selectAllTags, setSelectAllTags] = React.useState<boolean>(true);
  const { project } = useProjectBeingEdited();
  // TODO get all CardTypes referenced in the project
  const cardTypes = useProjectCardTypes();

  React.useEffect(() => {
    if (cardTypes.projectStatus === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardTypes(project));
      }
    }
    if (cardTypes.publishedStatus === 'UNSET') {
      // published type from other project or global types not yet knonw
      dispatch(API.getAvailablePublishedCardTypes());
    }
  }, [cardTypes.projectStatus, cardTypes.publishedStatus, project, dispatch]);

  const onSelect = React.useCallback((id: number) => {
    setSelectedType(id);
  }, []);

  const allTags = useCardTypeTags();

  const projectTags = [...cardTypes.own, ...cardTypes.inherited].flatMap(cardType => cardType.tags);

  const [tagState, setTagState] = React.useState<Record<string, boolean> | undefined>(undefined);

  React.useEffect(() => {
    if (tagState === undefined && cardTypes.projectStatus === 'READY') {
      const intialTagState = projectTags.reduce<Record<string, boolean>>((acc, cur) => {
        acc[cur] = true;
        return acc;
      }, {});
      setTagState(intialTagState);
    }
  }, [cardTypes.own, cardTypes.inherited, cardTypes.projectStatus, tagState, projectTags]);

  const eTags = Object.keys(tagState || []).filter(tag => tagState && tagState[tag]);

  const filter = (types: CardType[]) => {
    return types.filter(ty => ty.tags.find(tag => eTags.includes(tag)));
  };

  const toggleAllTags = (val: boolean) => {
    setSelectAllTags(val);
    setTagState(
      projectTags.reduce<Record<string, boolean>>((acc, cur) => {
        acc[cur] = val;
        return acc;
      }, {}),
    );
  };

  const filtered = {
    own: filter(cardTypes.own),
    inherited: filter(cardTypes.inherited),
    published: filter(cardTypes.published),
    global: filter(cardTypes.global),
  };

  return (
    <OpenCloseModal
      title={
        'Create new ' +
        (parent.title ? 'subcard for ' + parent.title : 'card') +
        ' - choose the type'
      }
      collapsedChildren={
        customButton ? (
          customButton
        ) : (
          <IconButton icon={faPlus} className={greyIconButtonChipStyle} title="Add a card" />
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
                  parent: parent,
                  cardTypeId: selectedType || null,
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
        if (cardTypes.projectStatus !== 'READY' || cardTypes.publishedStatus !== 'READY') {
          return <InlineLoading />;
        } else {
          return (
            <div className={css({ width: '100%', textAlign: 'left' })}>
              <Flex>
                <EmptyCardTypeThumbnail onClick={onSelect} highlighted={0 === selectedType} />
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
                  tags={allTags}
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
                {filtered.inherited != null && filtered.inherited.length > 0 && (
                  <>
                    <Flex align="flex-end">
                      <h3>Inherited</h3>
                      <Tips>
                        Inherited types references either global types or types from others projects
                      </Tips>
                    </Flex>
                    <div className={listOfTypeStyle}>
                      {filtered.inherited.map(cardType => (
                        <CardTypeThumbnail
                          key={cardType.id}
                          onClick={onSelect}
                          highlighted={cardType.id === selectedType}
                          cardType={cardType}
                        />
                      ))}
                    </div>
                  </>
                )}
                {filtered.own != null && filtered.own.length > 0 ? (
                  <div className={listOfTypeStyle}>
                    {filtered.own.map(cardType => {
                      return (
                        <CardTypeThumbnail
                          key={cardType.id}
                          onClick={onSelect}
                          highlighted={cardType.id === selectedType}
                          cardType={cardType}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Flex>
                    <p className={css({ color: 'var(--darkGray)' })}>
                      <i>You have no custom type in selected categories.</i>
                    </p>
                  </Flex>
                )}
              </Flex>
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
