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
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { Ancestor as AncestorType, useAncestors } from '../../../selectors/cardSelector';
import { selectCurrentProject } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import Clickable from '../../common/layout/Clickable';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { linkStyle, space_sm } from '../../styling/style';

const breadcrumbsStyle = css({
  fontSize: '.8em',
  color: 'var(--secondary-main)',
  margin: '0 ' + space_sm,
  alignSelf: 'center',
});

interface BreadcrumbsProps {
  card: Card;
  cardContent: CardContent;
}

export default function Breadcrumbs({ card, cardContent }: BreadcrumbsProps): JSX.Element {
  const { status, project: currentProject } = useAppSelector(selectCurrentProject);

  const ancestors = useAncestors(card.parentId);

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
      <ToggleZoomVsEdit />
    </Flex>
  );
}

function Ancestor({ card, cardContent: content, last, className }: AncestorType): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  React.useEffect(() => {
    if (typeof card === 'number') {
      dispatch(API.getCard(card));
    }

    if (typeof content === 'number') {
      dispatch(API.getCardContent(content));
    }
  }, [card, content, dispatch]);

  if (entityIs(card, 'Card') && card.rootCardProjectId != null) {
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
        <Icon icon={'chevron_right'} opsz="xs" className={cx(breadcrumbsStyle, className)} />
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

function ToggleZoomVsEdit(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <IconButton
      variant="ghost"
      title="toggle view edit"
      icon={location.pathname.includes('card') ? 'edit' : 'grid_view'}
      onClick={() => {
        // Note : functional but not so strong
        if (location.pathname.includes('/card/')) {
          navigate(`${location.pathname.replace('/card/', '/edit/')}`);
        } else {
          navigate(`${location.pathname.replace('/edit/', '/card/')}`);
        }
      }}
      className={css({ margin: '0 ' + space_sm })}
    />
  );
}
