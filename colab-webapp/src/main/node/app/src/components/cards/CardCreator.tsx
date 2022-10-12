/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectCardTypes } from '../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import CustomElementsList from '../common/collection/CustomElementsList';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import { AsyncButtonWithLoader } from '../common/element/ButtonWithLoader';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import { greyIconButtonChipStyle, marginAroundStyle, space_M, space_S } from '../styling/style';
import CardTypeThumbnail from './cardtypes/CardTypeThumbnail';

export const cardTypeThumbnailStyle = css({
  padding: space_M,
  //width: `calc(50% - 8px - 4*${space_S} - ${space_M})`,
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
  const { project } = useProjectBeingEdited();
  const [showCardTypeSelector, setShowCardTypeSelector] = React.useState(false);

  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  //const mainButtonRef = React.useRef<HTMLDivElement>(null);

  const resetData = React.useCallback(() => {
    setSelectedType(null);
  }, []);

  const createCard = React.useCallback(async () => {
    return dispatch(
      API.createSubCardWithTextDataBlock({
        parent: parentCardContent,
        cardTypeId: selectedType,
      }),
    ).then(() => {
      resetData();
    });
  }, [dispatch, parentCardContent, resetData, selectedType]);

  const onClickCb = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (e.ctrlKey) {
        setShowCardTypeSelector(true);
      } else {
        createCard();
      }
      e.stopPropagation();
    },
    [createCard],
  );

  if (showCardTypeSelector) {
    // modalClassName={css({height: '580px'})}
    return (
      <Modal
        title={i18n.modules.card.createNew(parentCardContent.title)}
        className={cx(className, css({ width: '800px' }))}
        onClose={() => {
          resetData();
          setShowCardTypeSelector(false);
        }}
        modalBodyClassName={css({ paddingTop: space_S })}
        footer={close => (
          <Flex
            justify="space-between"
            align="center"
            grow={1}
            className={css({ padding: space_M, alignSelf: 'stretch' })}
          >
            <Button
              onClick={() => {
                if (project?.id) {
                  navigate(`/editor/${project.id}/docs/cardTypes`);
                }
              }}
              invertedButton
              className={cx(marginAroundStyle([2], space_S), css({ justifySelf: 'flex-start' }))}
            >
              {i18n.modules.cardType.route.manageTypes}
            </Button>
            <Flex>
              <Button onClick={close} invertedButton className={marginAroundStyle([2], space_S)}>
                {i18n.common.cancel}
              </Button>

              <AsyncButtonWithLoader onClick={createCard}>
                {i18n.modules.card.createCard}
              </AsyncButtonWithLoader>
            </Flex>
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
                <Flex grow={1} className={css({ paddingTop: space_S })}>
                  <h2>{i18n.modules.card.action.chooseACardType}</h2>
                </Flex>
                <CustomElementsList
                  items={cardTypes}
                  thumbnailContent={item => {
                    return <CardTypeThumbnail cardType={item} usage="currentProject" />;
                  }}
                  customThumbnailStyle={cx(cardTypeThumbnailStyle)}
                  customOnClick={item => setSelectedType(item?.id ? item.id : null)}
                  customOnDblClick={() => {
                    createCard().then(() => close());
                  }}
                  addEmptyItem
                  selectionnable
                />
              </div>
            );
          }
        }}
      </Modal>
    );
  } else {
    return customButton ? (
      customButton
    ) : (
      <IconButton
        icon={faPlus}
        onClick={onClickCb}
        className={greyIconButtonChipStyle}
        title={i18n.modules.card.createCard}
      />
    );
  }
}
