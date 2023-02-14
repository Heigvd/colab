/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
  IconName,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useCard, useCardContent } from '../../../selectors/cardSelector';
import { useAndLoadCardType } from '../../../selectors/cardTypeSelector';
import { useCurrentProject, useProject } from '../../../selectors/projectSelector';
import { useAppSelector } from '../../../store/hooks';
import { referenceIcon } from '../../cards/cardtypes/summary/TargetCardTypeSummary';
import Icon from '../../common/layout/Icon';

import { ResourceAndRef } from '../resourcesCommonType';

type ShowText = 'tooltip' | 'short' | 'full';

interface ProvidedByProps {
  showText: ShowText;
  iconClassName?: string;
  hideIcon?: boolean;
  direct?: boolean;
}

interface ProvidedByCardTypeProps extends ProvidedByProps {
  abstractCardTypeId: number;
}

/**
 * Indicates the resource is provided by a card type
 */
export function ProvidedByCardType({
  abstractCardTypeId,
  iconClassName,
  showText,
  direct = false,
  hideIcon = false,
}: ProvidedByCardTypeProps): JSX.Element {
  const i18n = useTranslations();

  const { cardType } = useAndLoadCardType(abstractCardTypeId);
  const projectId = cardType?.projectId;

  const { project: currentProject } = useCurrentProject();

  const { project } = useProject(projectId || 0); // TODO Sandra 01.2023 : avoid || 0

  let icon =  <Icon icon={referenceIcon} />;

  const cardTypeName = (cardType && cardType.title) || '';
  let fullText = '';
  let shortText = cardTypeName;

  if (projectId == null) {
    // Global type
    fullText = i18n.modules.resource.info.providedByGlobalCardType(cardTypeName);

    icon = (
       <Icon
        className={iconClassName}
        icon={'globe'}
        color={'var(--secondaryColor)'}
        title={showText !== 'full' ? fullText : undefined}
      />
    );
  } else if (currentProject != project) {
    const projectName = (entityIs(project, 'Project') && project.name) || '';

    fullText = i18n.modules.resource.info.providedByExternalCardType(cardTypeName, projectName);
    shortText = `${projectName} / ${cardTypeName};`;

    icon = (
       <FontAwesomeIcon
        className={iconClassName}
        icon={
          project?.illustration
            ? {
                prefix: project.illustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
                iconName: project.illustration.iconKey as IconName,
              }
            : referenceIcon
        }
        color={project?.illustration ? project.illustration.iconBkgdColor : 'var(--lightGray)'}
        title={showText !== 'full' ? fullText : undefined}
      />
    );
  } else {
    fullText = direct
      ? i18n.modules.resource.info.providedByCardType(cardTypeName)
      : i18n.modules.resource.info.providedByCardType(cardTypeName);

    icon = (
       <Icon
        icon={'menu_book'}
        className={iconClassName}
        title={showText !== 'full' ? fullText : undefined}
      />
    );
  }
  return (
    <>
      {!hideIcon && icon} {showText === 'full' ? fullText : ''}
      {showText === 'short' ? shortText : ''}
    </>
  );
}

interface ProvidedByCardProps extends ProvidedByProps {
  cardId: number;
}

/**
 * Indicates the resource is provided by a card
 */
export function ProvidedByCard({
  cardId,
  iconClassName,
  showText,
  direct = false,
  hideIcon = false,
}: ProvidedByCardProps): JSX.Element {
  const i18n = useTranslations();

  const isRootCard = useAppSelector(state => {
    return state.cards.rootCardId === cardId;
  });

  const card = useCard(cardId);
  const cardName = entityIs(card, 'Card') ? card.title : '';

  const fullText = isRootCard
    ? i18n.modules.resource.info.providedByTheCurrentProject
    : direct
    ? i18n.modules.resource.info.ownedByThisCard
    : i18n.modules.resource.info.providedByUpperCard(cardName || '');

  const shortText = isRootCard ? 'Project' : cardName;

  const { project } = useCurrentProject();

  const icon = isRootCard ? (
     <FontAwesomeIcon
      className={iconClassName}
      icon={
        project?.illustration
          ? {
              prefix: project.illustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
              iconName: project.illustration.iconKey as IconName,
            }
          : referenceIcon
      }
      color={project?.illustration ? project.illustration.iconBkgdColor : 'var(--lightGray)'}
      title={showText !== 'full' ? fullText : undefined}
    />
  ) : (
     <Icon
      icon={direct ? 'table_rows' : 'my_location'}
      className={iconClassName}
      title={showText !== 'full' ? fullText : undefined}
    />
  );
  return (
    <>
      {!hideIcon && icon} {showText === 'full' ? fullText : ''}
      {showText === 'short' ? shortText : ''}
    </>
  );
}

interface ProvidedByCardContentProps extends ProvidedByProps {
  cardContentId: number;
}

/**
 * Indicates the resource is provided by a card
 */
export function ProvidedByCardContent({
  cardContentId,
  iconClassName,
  showText,
  direct = false,
  hideIcon = false,
}: ProvidedByCardContentProps): JSX.Element {
  const i18n = useTranslations();

  const cardContent = useCardContent(cardContentId);

  const card = useCard((entityIs(cardContent, 'CardContent') && cardContent.cardId) || -1);

  const name = `${entityIs(card, 'Card') ? card.title : ''} ${
    entityIs(cardContent, 'CardContent') ? cardContent.title : ''
  }`;

  // use CardType and resolve
  // belongs to external project or not ?

  const fullText = direct
    ? i18n.modules.resource.info.ownedByThisCardContent
    : i18n.modules.resource.info.providedByUpperCard(name);
  const shortText = name;
  const icon = (
     <Icon
      icon={direct ? 'table_rows' : 'my_location'}
      title={showText !== 'full' ? fullText : undefined}
      className={iconClassName}
    />
  );
  return (
    <>
      {!hideIcon && icon} {showText === 'full' ? fullText : ''}
      {showText === 'short' ? shortText : ''}
    </>
  );
}

interface TargetResourceSummaryProps {
  resource: ResourceAndRef;
  showText?: ShowText;
  iconClassName?: string;
  hideIcon?: boolean;
}

export default function TargetResourceSummary({
  resource,
  iconClassName,
  showText = 'tooltip',
  hideIcon,
}: TargetResourceSummaryProps): JSX.Element {
  if (resource.isDirectResource) {
    // resource "belongs" to the current location
    if (resource.targetResource.cardContentId != null) {
      // this variant only
      return (
        <ProvidedByCardContent
          cardContentId={resource.targetResource.cardContentId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
          direct
        />
      );
    } else if (resource.targetResource.cardId != null) {
      // this card only
      return (
        <ProvidedByCard
          cardId={resource.targetResource.cardId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
          direct
        />
      );
    } else if (resource.targetResource.abstractCardTypeId != null) {
      // all cards which use the type + goto link
      return (
        <ProvidedByCardType
          abstractCardTypeId={resource.targetResource.abstractCardTypeId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
          direct
        />
      );
    }
  } else {
    // resource is owned by some upper level
    if (resource.targetResource.cardContentId != null) {
      // provided by a parent variant
      return (
        <ProvidedByCardContent
          cardContentId={resource.targetResource.cardContentId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
        />
      );
    } else if (resource.targetResource.cardId != null) {
      // provided by a parent card
      return (
        <ProvidedByCard
          cardId={resource.targetResource.cardId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
        />
      );
    } else if (resource.targetResource.abstractCardTypeId != null) {
      // all cards which use the type + goto link
      return (
        <ProvidedByCardType
          abstractCardTypeId={resource.targetResource.abstractCardTypeId}
          iconClassName={iconClassName}
          showText={showText}
          hideIcon={hideIcon}
        />
      );
    }
  }
  return <></>;
}
