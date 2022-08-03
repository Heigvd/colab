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
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import CustomElementsList from '../common/collection/CustomElementsList';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
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
  const navigate = useNavigate();
  const i18n = useTranslations();

  const { cardTypes, status } = useAndLoadProjectCardTypes();

  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  //const mainButtonRef = React.useRef<HTMLDivElement>(null);

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
        i18n.modules.card.createNew(parentCardContent.title)
      }
      collapsedChildren={
        customButton ? (
          customButton
        ) : (
          <IconButton icon={faPlus} className={greyIconButtonChipStyle} title={i18n.modules.card.addCard} />
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
            title={i18n.modules.cardType.manageTypes}
            icon={faCog}
            className={lightIconButtonStyle}
          />
          <Button onClick={close} invertedButton className={marginAroundStyle([2], space_S)}>
            {i18n.common.cancel}
          </Button>

          <Button
            onClick={() => {
              createCard();
              resetData();
              close();
            }}
          >
            {i18n.modules.card.addCard}
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
