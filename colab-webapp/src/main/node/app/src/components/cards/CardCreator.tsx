/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheck, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardContent, CardType } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useCardTypeTags, useProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Checkbox from '../common/Form/Checkbox';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import OpenCloseModal from '../common/OpenCloseModal';
import Tips from '../common/Tips';
import CardTypeCreator from './cardtypes/CardTypeCreator';
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';

export interface CardCreatorProps {
  parent: CardContent;
}

const listOfTypeStyle = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
});

export default function CardCreator({ parent }: CardCreatorProps): JSX.Element {
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
      title="Create a card"
      collapsedChildren={<FontAwesomeIcon title="add a card" icon={faPlus} />}
    >
      {close => {
        if (cardTypes.projectStatus !== 'READY' || cardTypes.publishedStatus !== 'READY') {
          return <InlineLoading />;
        } else {
          return (
            <div
              className={css({
                border: '1px solid grey',
                padding: '20px',
              })}
            >
              <h2>Create a new subcard {parent.title ? 'for ' + parent.title : ''}</h2>
              <Flex>
                {allTags.map(tag => {
                  return (
                    <Checkbox
                      key={tag}
                      label={tag}
                      value={tagState && tagState[tag]}
                      onChange={t =>
                        setTagState(state => {
                          return { ...state, [tag]: t };
                        })
                      }
                    />
                  );
                })}
              </Flex>
              <div>
                <Tips tipsType="TODO">
                  To create a card, one should select a type among all available ones in a
                  convinient way
                </Tips>
                <Tips tipsType="TODO">
                  Project "Card Types" tab display all types too: such duplication should be solved
                </Tips>
                <h3>Common types</h3>
                <Tips>
                  Common types are types defined outside the current project and which are not yet
                  used in the project
                </Tips>
                <details>
                  <summary>
                    Global
                    <Tips>
                      Global types are defined by adminstrators in "admin/card types" tab. Such type
                      are available in any project
                    </Tips>
                  </summary>
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
                </details>
                <details>
                  <summary>
                    From other projects
                    <Tips>
                      Types published from others projects you, as specific colab user, have acces
                      to.
                    </Tips>
                  </summary>
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
                </details>
              </div>
              <div>
                <h3>Project Types</h3>
                <Tips>All types already used/defined in the project</Tips>
                <details>
                  <summary>
                    Inherited
                    <Tips>
                      Inherited types references either global types or types from others projects
                    </Tips>
                  </summary>
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
                </details>
                <details>
                  <summary>
                    Custom
                    <Tips>
                      Custom project types belong to this very project (ie you have full write
                      right)
                    </Tips>
                  </summary>
                  <div className={listOfTypeStyle}>
                    {filtered.own.map(cardType => (
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
                </details>
              </div>
              <div>
                <IconButton icon={faTimes} title="cancel" onClick={close} />
                {selectedType != null ? (
                  <IconButton
                    icon={faCheck}
                    title="create"
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
                  />
                ) : null}
              </div>
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
