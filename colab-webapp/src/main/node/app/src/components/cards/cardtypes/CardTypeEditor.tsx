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
import Creatable from 'react-select/creatable';
import * as API from '../../../API/api';
import { useCardTypeTags } from '../../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../../store/hooks';
import { BlockEditorWrapper } from '../../blocks/BlockEditorWrapper';
import AutoSaveInput from '../../common/AutoSaveInput';
import IconButton from '../../common/IconButton';
import OpenClose from '../../common/OpenClose';
import { ResourceContextScope } from '../../resources/ResourceCommonType';
import ResourcesWrapper from '../../resources/ResourcesWrapper';
import {
  cardShadow,
  defaultColumnContainerStyle,
  defaultRowContainerStyle,
  inputStyle,
  sideTabButton,
} from '../../styling/style';

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

export default function CardTypeEditor({ cardType }: DisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  const allTags = useCardTypeTags();
  const options = allTags.map(tag => ({ label: tag, value: tag }));

  return (
    <>
      <div className={defaultRowContainerStyle}>
        <>
          <div className={defaultColumnContainerStyle}>
            <div className={style}>
              <AutoSaveInput
                label="Title: "
                placeholder=""
                inputType="INPUT"
                value={cardType.title || ''}
                onChange={newValue =>
                  dispatch(API.updateCardType({ ...cardType, title: newValue }))
                }
              />
              <Creatable
                className={inputStyle}
                isMulti={true}
                value={cardType.tags.map(tag => ({ label: tag, value: tag }))}
                options={options}
                onChange={tagsOptions => {
                  dispatch(
                    API.updateCardType({
                      ...cardType,
                      tags: tagsOptions.map(o => o.value),
                    }),
                  );
                }}
              />
              {cardType.purposeId && (
                <BlockEditorWrapper blockId={cardType.purposeId} allowEdition={true} />
              )}
              <IconButton
                icon={cardType.deprecated ? faCheckSquare : faSquare}
                onClick={() =>
                  dispatch(API.updateCardType({ ...cardType, deprecated: !cardType.deprecated }))
                }
              >
                Deprecated
              </IconButton>
              <IconButton
                icon={cardType.published ? faCheckSquare : faSquare}
                onClick={() =>
                  dispatch(API.updateCardType({ ...cardType, published: !cardType.published }))
                }
              >
                Published
              </IconButton>
            </div>
          </div>
          <OpenClose collapsedChildren={<span className={sideTabButton}>Resources</span>}>
            {() => (
              <>
                {cardType.id && (
                  <ResourcesWrapper
                    kind={ResourceContextScope.CardType}
                    accessLevel="WRITE"
                    cardTypeId={cardType.id}
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
