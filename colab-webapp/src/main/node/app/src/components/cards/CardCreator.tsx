/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent, CardType } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useCardTypeTags, useProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import Flex from '../common/Flex';
import Checkbox from '../common/Form/Checkbox';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import OpenCloseModal from '../common/OpenCloseModal';
import Tips from '../common/Tips';
import {
  borderRadius,
  greyIconButtonChipStyle,
  lightTheme,
  marginAroundStyle,
  noOutlineStyle,
  space_M,
  space_S,
} from '../styling/style';
import CardTypeCreator from './cardtypes/CardTypeCreator';
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';

const categoryTabStyle = cx(
  lightTheme,
  css({
    padding: space_S,
    backgroundColor: 'var(--primaryColorContrastShade)',
    color: 'var(--primaryColor)',
    margin: space_S,
    borderRadius: borderRadius,
  }),
);
const checkedCategoryTabStyle = css({
  backgroundColor: 'var(--primaryColor)',
  color: 'var(--primaryColorContrast)',
  '&:hover': {
    color: 'var(--primaryColorContrast)',
  },
});
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
  const [selectedType, setSelectedType] = React.useState<number | undefined>();
  const { project } = useProjectBeingEdited();
  const cardTypes = useProjectCardTypes();

  React.useEffect(() => {
    if (cardTypes.projectStatus === 'UNSET') {
      if (project != null) {
        dispatch(API.getProjectCardTypes(project));
      }
    }
    if (cardTypes.publishedStatus === 'UNSET') {
      // published type from other project or global types not yet knonw
      dispatch(API.getPublishedCardTypes());
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
    >
      {close => {
        if (cardTypes.projectStatus !== 'READY' || cardTypes.publishedStatus !== 'READY') {
          return <InlineLoading />;
        } else {
          return (
            <div className={css({ width: '100%', textAlign: 'left' })}>
              <Flex
                className={css({
                  paddingBottom: space_S,
                  marginBottom: space_S,
                  borderBottom: '1px solid var(--lightGray)',
                })}
                wrap="wrap"
              >
                {allTags.map(tag => {
                  return (
                    <div
                      className={cx(categoryTabStyle, {
                        [checkedCategoryTabStyle]: tagState && tagState[tag],
                      })}
                      key={tag}
                    >
                      <Checkbox
                        key={tag}
                        label={tag}
                        value={tagState && tagState[tag]}
                        onChange={t =>
                          setTagState(state => {
                            return { ...state, [tag]: t };
                          })
                        }
                        className={cx(noOutlineStyle, {
                          [checkedCategoryTabStyle]: tagState && tagState[tag],
                        })}
                      />
                    </div>
                  );
                })}
                <Tips tipsType="TODO">
                  To create a card, one should select a type among all available ones in a
                  convinient way. Project "Card Types" tab display all types too: such duplication
                  should be solved.
                </Tips>
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
                <Flex align="flex-end">
                  <h3>Custom</h3>
                  <Tips>
                    Custom project types belong to this very project (ie you have full write right)
                  </Tips>
                </Flex>
                {filtered.own != null && filtered.own.length > 0 ? (
                  <div className={listOfTypeStyle}>
                    {filtered.own.map(cardType => (
                      <CardTypeThumbnail
                        key={cardType.id}
                        onClick={onSelect}
                        highlighted={cardType.id === selectedType}
                        cardType={cardType}
                      />
                    ))}
                  </div>
                ) : (
                  <Flex>
                    <p className={css({ color: 'var(--darkGray)' })}>
                      <i>You have no custom type in selected categories.</i>
                    </p>
                    <Tips>
                      If needed you can create a new custom type by clicking "Create new type"
                    </Tips>
                  </Flex>
                )}
                <CardTypeCreator
                  afterCreation={(id: number) => {
                    setSelectedType(id);
                  }}
                />
              </Flex>
              <details>
                <summary>Browse global types</summary>
                <div
                  className={css({
                    border: '1px solid var(--lightGray)',
                    padding: space_M,
                    marginBottom: space_S,
                  })}
                >
                  <details>
                    <summary className={noOutlineStyle}>
                      Global
                      <Tips>
                        Global types are defined by adminstrators in "admin/card types" tab. Such
                        type are available in any project
                      </Tips>
                    </summary>
                    {filtered.global != null && (
                      <div className={listOfTypeStyle}>
                        {filtered.global.map(cardType => (
                          <CardTypeThumbnail
                            key={cardType.id}
                            onClick={onSelect}
                            highlighted={cardType.id === selectedType}
                            cardType={cardType}
                          />
                        ))}
                      </div>
                    )}
                  </details>
                  <details>
                    <summary className={noOutlineStyle}>
                      From other projects
                      <Tips>
                        Types published from others projects you, as specific colab user, have acces
                        to.
                      </Tips>
                    </summary>
                    {filtered.published != null && (
                      <div className={listOfTypeStyle}>
                        {filtered.published.map(cardType => (
                          <CardTypeThumbnail
                            key={cardType.id}
                            onClick={onSelect}
                            highlighted={cardType.id === selectedType}
                            cardType={cardType}
                          />
                        ))}
                      </div>
                    )}
                  </details>
                </div>
              </details>
              <Flex justify="flex-end" className={css({ marginTop: 'auto' })}>
                {selectedType != null ? (
                  <Button
                    title="Create card"
                    onClick={() => {
                      dispatch(
                        API.createSubCardWithBlockDoc({
                          parent: parent,
                          cardTypeId: selectedType,
                        }),
                      ).then(() => {
                        close();
                      });
                    }}
                  >
                    Create card
                  </Button>
                ) : null}
                <Button
                  title="Cancel"
                  onClick={close}
                  invertedButton
                  className={marginAroundStyle([4], space_S)}
                >
                  Cancel
                </Button>
              </Flex>
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
