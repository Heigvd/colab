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
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { greyIconButtonChipStyle, invertedButtonStyle, space_M, space_S } from '../styling/style';

export const cardTypeThumbnailStyle = css({
  padding: space_M,
  //width: `calc(50% - 8px - 4*${space_S} - ${space_M})`,
  minHeight: '85px',
  maxHeight: '85px',
  margin: space_S,
});

export interface CardCreatorProps {
  parentCardContent: CardContent;
  display?: string;
  customButton?: ReactJSXElement;
  className?: string;
}

export default function CardCreator({
  parentCardContent,
  display,
}: // customButton,
// className,
CardCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  const i18n = useTranslations();

  // const { cardTypes, status } = useAndLoadProjectCardTypes();
  // const { project } = useProjectBeingEdited();

  const { startLoading, stopLoading } = useLoadingState();

  // const [selectedType, setSelectedType] = React.useState<number | null>(null);
  //const mainButtonRef = React.useRef<HTMLDivElement>(null);

  const createCard = (_close: () => void) => {
    startLoading();

    dispatch(
      API.createSubCardWithTextDataBlock({
        parent: parentCardContent,
        cardTypeId: null,
      }),
    ).then(() => {
      stopLoading();

      // resetData();

      // close();
    });
  };

  // const resetData = React.useCallback(() => {
  //   setSelectedType(null);
  // }, []);

  return display === '1' ? (
    <Button
      icon={faPlus}
      className={invertedButtonStyle}
      clickable
      onClick={e => {
        e.stopPropagation();
        createCard(close);
      }}
      // isLoading={isLoading}
    >
      {i18n.modules.card.createCard}
    </Button>
  ) : display === '2' ? (
    <Button
      icon={faPlus}
      clickable
      onClick={e => {
        e.stopPropagation();
        createCard(close);
      }}
    >
      {i18n.modules.card.infos.createFirstCard}
    </Button>
  ) : (
    <IconButton
      icon={faPlus}
      className={cx(greyIconButtonChipStyle, css({display: 'none'}))}
      title={i18n.modules.card.createCard}
      onClick={e => {
        e.stopPropagation();
        createCard(close);
      }}
    />
  );
  // <OpenCloseModal
  //   title={i18n.modules.card.createNew(parentCardContent.title)}
  //   collapsedChildren={
  //     customButton ? (
  //       customButton
  //     ) : (
  //       <IconButton
  //         icon={faPlus}
  //         className={greyIconButtonChipStyle}
  //         title={i18n.modules.card.createCard}
  //       />
  //     )
  //   }
  //   className={className}
  //   modalClassName={css({ height: '580px' })}
  //   modalBodyClassName={css({ paddingTop: space_S })}
  //   widthMax
  //   footer={close => (
  //     <Flex
  //       justify="space-between"
  //       align="center"
  //       grow={1}
  //       className={css({ padding: space_M, alignSelf: 'stretch' })}
  //     >
  //       <Button
  //         onClick={() => {
  //           if (project?.id) {
  //             navigate(`/editor/${project.id}/docs/cardTypes`);
  //           }
  //         }}
  //         invertedButton
  //         className={cx(marginAroundStyle([2], space_S), css({ justifySelf: 'flex-start' }))}
  //       >
  //         {i18n.modules.cardType.route.manageTypes}
  //       </Button>
  //       <Flex>
  //         <Button onClick={close} invertedButton className={marginAroundStyle([2], space_S)}>
  //           {i18n.common.cancel}
  //         </Button>

  //         <ButtonWithLoader
  //           onClick={() => {
  //             createCard(close);
  //           }}
  //           isLoading={isLoading}
  //         >
  //           {i18n.modules.card.createCard}
  //         </ButtonWithLoader>
  //       </Flex>
  //     </Flex>
  //   )}
  //   showCloseButton
  // >
  //   {close => {
  //     if (status !== 'READY') {
  //       return <AvailabilityStatusIndicator status={status} />;
  //     } else {
  //       return (
  //         <div className={css({ width: '100%', textAlign: 'left' })}>
  //           <Flex grow={1} className={css({ paddingTop: space_S })}>
  //             <h2>{i18n.modules.card.action.chooseACardType}</h2>
  //           </Flex>
  //           <CustomElementsList
  //             items={cardTypes}
  //             thumbnailContent={item => {
  //               return <CardTypeThumbnail cardType={item} usage="currentProject" />;
  //             }}
  //             customThumbnailStyle={cx(cardTypeThumbnailStyle)}
  //             customOnClick={item => setSelectedType(item?.id ? item.id : null)}
  //             customOnDblClick={() => {
  //               createCard(close);
  //             }}
  //             addEmptyItem
  //             selectionnable
  //           />
  //         </div>
  //       );
  //     }
  //   }}
  // </OpenCloseModal>
}
