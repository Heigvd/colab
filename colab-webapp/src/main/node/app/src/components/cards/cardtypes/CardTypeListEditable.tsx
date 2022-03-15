/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import * as React from 'react';
import Creatable from 'react-select/creatable';
import * as API from '../../../API/api';
import { useCardTypeTags } from '../../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import { BlockEditorWrapper } from '../../blocks/BlockEditorWrapper';
import Button from '../../common/Button';
import InlineInput from '../../common/InlineInput';
import OpenClose from '../../common/OpenClose';
import ResourcesWrapper from '../../resources/ResourcesWrapper';
import {
  cardShadow,
  defaultColumnContainerStyle,
  defaultRowContainerStyle,
  inputStyle,
  sideTabButton,
} from '../../styling/style';

// Note: not used any longer

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

export default function CardTypeListEditable({ cardType }: DisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  const allTags = useCardTypeTags();
  const options = allTags.map(tag => ({ label: tag, value: tag }));

  return (
    <>
      <div className={defaultRowContainerStyle}>
        <>
          <div className={defaultColumnContainerStyle}>
            <div className={style}>
              <InlineInput
                label="Title: "
                placeholder=""
                value={cardType.title || ''}
                onChange={newValue =>
                  dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                }
                autosave={false}
              />
              <Creatable
                className={inputStyle}
                isMulti={true}
                value={cardType.tags.map(tag => ({ label: tag, value: tag }))}
                options={options}
                onChange={tagsOptions => {
                  dispatch(
                    API.updateCardTypeTags({
                      ...cardType,
                      tags: tagsOptions.map(o => o.value),
                    }),
                  );
                }}
              />
              {cardType.purposeId && (
                <BlockEditorWrapper blockId={cardType.purposeId} allowEdition={true} />
              )}
              <Button
                icon={cardType.deprecated ? faCheckSquare : faSquare}
                onClick={() =>
                  dispatch(
                    API.updateCardTypeDeprecated({ ...cardType, deprecated: !cardType.deprecated }),
                  )
                }
              >
                Deprecated
              </Button>
              <Button
                icon={cardType.published ? faCheckSquare : faSquare}
                onClick={() =>
                  dispatch(
                    API.updateCardTypePublished({ ...cardType, published: !cardType.published }),
                  )
                }
              >
                Published
              </Button>
            </div>
          </div>
          <OpenClose collapsedChildren={<span className={sideTabButton}>Resources</span>}>
            {() => (
              <>
                {cardType.ownId && (
                  <ResourcesWrapper
                    kind={'CardType'}
                    accessLevel="WRITE"
                    cardTypeId={cardType.ownId}
                  />
                )}
              </>
            )}
          </OpenClose>
        </>
      </div>
    </>
  );
}
