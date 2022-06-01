/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useAndLoadProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import Button from '../common/Button';
import CustomElementsList from '../common/CustomElementsList';
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
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';

export const cardTypeThumbnailStyle = css({
  padding: space_M,
  width: `calc(50% - 8px - 4*${space_S} - ${space_M})`,
  minHeight: '85px',
  maxHeight: '85px',
  margin: space_S,
});

export interface CardCreatorProps {
  parentCardContent: CardContent;
  customButton?: ReactJSXElement;
  className?: string;
}

export default function CardCreator({
  parentCardContent,
  customButton,
  className,
}: CardCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { cardTypes, status } = useAndLoadProjectCardTypes();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = React.useState<number | null>(null);

  const createCard = () => {
    dispatch(
      API.createSubCardWithTextDataBlock({
        parent: parentCardContent,
        cardTypeId: selectedType,
      }),
    );
  };

  const resetData = React.useCallback(() => {
    setSelectedType(null);
  }, []);

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
      modalClassName={css({ height: '580px' })}
      modalBodyClassName={css({ paddingTop: space_S })}
      widthMax
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
              createCard();
              resetData();
              close();
            }}
          >
            Add a card
          </Button>
        </Flex>
      )}
      showCloseButton
    >
      {close => {
        if (status !== 'READY') {
          return <AvailabilityStatusIndicator status={status} />;
        } else {
          return (
            <div className={css({ width: '100%', textAlign: 'left' })}>
              <CustomElementsList
                items={cardTypes}
                loadingStatus={status}
                thumbnailContent={item => {
                  return <CardTypeThumbnail cardType={item} usage="currentProject" />;
                }}
                customThumbnailStyle={cx(cardTypeThumbnailStyle)}
                customOnClick={item => setSelectedType(item?.id ? item.id : null)}
                customOnDblClick={() => {
                  createCard();
                  resetData();
                  close();
                }}
                addEmptyItem
                selectionnable
              />
            </div>
          );
        }
      }}
    </OpenCloseModal>
  );
}
