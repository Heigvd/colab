/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import 'react-reflex/styles.css';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useAndLoadSubCards, useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useAndLoadIfOnlyEmptyDocuments } from '../../store/selectors/documentSelector';
import { space_sm } from '../../styling/style';
import { cardColors } from '../../styling/theme';
import { Item } from '../common/layout/SideCollapsiblePanel';
import { DocumentOwnership } from '../documents/documentCommonType';
import { defaultDocEditorContext } from '../documents/DocumentEditorToolbox';
import { ResourceAndRef, ResourceOwnership } from '../resources/resourcesCommonType';
import { ResourcesMainViewHeader, ResourcesMainViewPanel } from '../resources/ResourcesMainView';
import CardAssignmentsPanel from '../team/CardAssignments';
import { computeNav } from './VariantSelector';

interface CardEditorSideBarProps {
  card: Card;
  variant: CardContent;
}

export default function CardEditorSideBar({ card, variant }: CardEditorSideBarProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  //const location = useLocation();

  //const { currentUser } = useCurrentUser();

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && variant != null;
  //const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;

  const contents = useVariantsOrLoad(card);

  const subCards = useAndLoadSubCards(variant.id);

  const variantPager = computeNav(contents, variant.id);

  const { canRead, canWrite } = useCardACLForCurrentUser(card.id);
  const readOnly = !canWrite || variant.frozen;
  //const [showTypeDetails, setShowTypeDetails] = React.useState(false);
  const [selectedDocId, setSelectedDocId] = React.useState<number | null>(null);
  const [lastCreatedDocId, setLastCreatedDocId] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState(defaultDocEditorContext.editMode);
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setMarkDownMode] = React.useState(false);
  const [editToolbar, setEditToolbar] = React.useState(defaultDocEditorContext.editToolbar);
  const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);

  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const [lastCreatedResourceId, setLastCreatedResourceId] = React.useState<number | null>(null);

  const TXToptions = {
    showTree: showTree,
    setShowTree: setShowTree,
    markDownMode: markDownMode,
    setMarkDownMode: setMarkDownMode,
  };
  //const { isLoading, startLoading, stopLoading } = useLoadingState();

  const hasNoSubCard = !subCards || subCards.length < 1;

  const deliverableDocContext: DocumentOwnership = {
    kind: 'DeliverableOfCardContent',
    ownerId: variant.id!,
  };

  const { empty: hasNoDeliverableDoc } = useAndLoadIfOnlyEmptyDocuments(deliverableDocContext);

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: variant.id,
    hasSeveralVariants: hasVariants,
  };

  const sideBarItems: Record<string, Item> = {
    resources: {
      icon: 'menu_book',
      // nextToIconElement: (
      //   <div className={text_sm}>
      //     <ResourcesListNb resourcesOwnership={resourceOwnership} />
      //   </div>
      // ),
      title: i18n.modules.resource.documentation,
      header: (
        <ResourcesMainViewHeader
          title={<h3>{i18n.modules.resource.documentation}</h3>}
          helpTip={i18n.modules.resource.help.documentationExplanation}
        />
      ),
      children: (
        <ResourcesMainViewPanel
          accessLevel={!readOnly ? 'WRITE' : canRead ? 'READ' : 'DENIED'}
          showLevels
        />
      ),
      className: css({ overflow: 'auto' }),
    },
    team: {
      icon: 'group',
      title: i18n.team.assignment.labels.assignments,
      children: (
        <div className={css({ overflow: 'auto' })}>
          <CardAssignmentsPanel cardId={card.id!} />
        </div>
      ),
      className: css({ overflow: 'auto' }),
    },
    colors: {
      icon: 'palette',
      title: i18n.modules.card.settings.color,
      children: (
        <CirclePicker
          colors={Object.values(cardColors)}
          onChangeComplete={newColor => {
            dispatch(API.updateCard({ ...card, color: newColor.hex }));
          }}
          color={card.color || 'white'}
          width={'auto'}
          className={css({
            marginTop: space_sm,
            padding: space_sm,
            'div[title="#FFFFFF"]': {
              background: '#FFFFFF !important',
              boxShadow:
                (card.color || '#FFFFFF').toUpperCase() === '#FFFFFF'
                  ? 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px inset !important'
                  : 'rgba(0, 0, 0, 0.1) 0px 0px 6px 3px !important',
            },
          })}
        />
      ),
    },
  };

  return <></>;
}
