/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Ancestor as AncestorType, useAncestors } from '../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../store/selectors/projectSelector';
import { activeIconButtonStyle, br_md, linkStyle, space_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';
import Clickable from '../common/layout/Clickable';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

const breadcrumbsStyle = css({
  fontSize: '.8em',
  color: 'var(--secondary-main)',
  margin: '0 ' + space_sm,
  alignSelf: 'center',
});

interface ProjectBreadcrumbsProps {
  card?: Card;
  cardContent?: CardContent;
}

export default function ProjectBreadcrumbs({
  card,
  cardContent,
}: ProjectBreadcrumbsProps): JSX.Element {
  const { status, project: currentProject } = useAppSelector(selectCurrentProject);

  const ancestors = useAncestors(card?.parentId);

  if (status != 'READY' || currentProject == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex align="center">
      {ancestors.map((ancestor, x) => (
        <Ancestor
          key={x}
          card={ancestor.card}
          cardContent={ancestor.cardContent}
          className={cx({
            [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
          })}
        />
      ))}
      <Ancestor
        card={card}
        cardContent={cardContent}
        last
        className={cx({
          [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
        })}
      />
      {/* visibility hidden is there to maintain the height even if not displayed */}
      <ToggleZoomVsEdit className={cx({ [css({ visibility: 'hidden' })]: card == null })} />
    </Flex>
  );
}

function Ancestor({ card, cardContent: content, last, className }: AncestorType): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (typeof card === 'number') {
      dispatch(API.getCard(card));
    }

    if (typeof content === 'number') {
      dispatch(API.getCardContent(content));
    }
  }, [card, content, dispatch]);

  if (card == null || (entityIs(card, 'Card') && card.rootCardProjectId != null)) {
    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${location.pathname.includes('hierarchy') ? 'hierarchy' : ''}`);
          }}
          className={cx(linkStyle, breadcrumbsStyle, className)}
        >
          {i18n.common.project}
        </Clickable>
        {card != null && (
          <Icon icon={'chevron_right'} opsz="xs" className={cx(breadcrumbsStyle, className)} />
        )}
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    // if we want to stay in the same mode edit vs card when navigating
    // const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    // const t = match ? match[1] || 'card' : 'card';
    const t = 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
          className={cx(linkStyle, breadcrumbsStyle, className)}
        >
          {card.title ? card.title : i18n.modules.card.untitled}
        </Clickable>
        {!last && (
          <Icon icon={'chevron_right'} opsz="xs" className={cx(breadcrumbsStyle, className)} />
        )}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}

function ToggleZoomVsEdit({ className }: { className?: string }): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();

  const isSubCardMode: boolean = location.pathname.includes('/card/');

  return (
    <Flex
      className={cx(
        css({ margin: '0 ' + space_sm }),
        br_md,
        css({
          alignItems: 'center',
          border: '1px solid var(--divider-main)',
        }),
        className,
      )}
      wrap="nowrap"
    >
      <IconButton
        kind="ghost"
        title={i18n.modules.card.navigation.toggleViewZoomToEdit}
        icon={'edit'}
        onClick={() => {
          // Note : functional but not so strong
          navigate(`${location.pathname.replace('/card/', '/edit/')}`);
        }}
        className={cx({
          [activeIconButtonStyle]: !isSubCardMode,
        })}
      />
      <IconButton
        kind="ghost"
        title={i18n.modules.card.navigation.toggleViewEditToZoom}
        icon={'grid_view'}
        onClick={() => {
          // Note : functional but not so strong
          navigate(`${location.pathname.replace('/edit/', '/card/')}`);
        }}
        className={cx({
          [activeIconButtonStyle]: isSubCardMode,
        })}
      />
    </Flex>
  );
}
