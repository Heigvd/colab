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
import InlineLoading from '../../common/element/InlineLoading';
import Clickable from '../../common/layout/Clickable';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { linkStyle, space_sm } from '../../styling/style';

const breadCrumbsStyle = css({
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
  const parentId = card != null ? card.parentId : undefined;

  const { status, project: currentProject } = useAppSelector(selectCurrentProject);

  const ancestors = useAncestors(parentId);

  if (status != 'READY' || currentProject == null) {
    if (status === 'NOT_EDITING') {
      return <AvailabilityStatusIndicator status="ERROR" />;
    }

    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex align="center">
      {ancestors.map((ancestor, x) => (
        <Ancestor
          key={x}
          card={ancestor.card}
          content={ancestor.content}
          className={cx({
            [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
          })}
        />
      ))}
      <Ancestor
        card={card}
        content={cardContent}
        last
        className={cx({
          [css({ color: 'var(--primary-main)' })]: currentProject.type === 'MODEL',
        })}
      />
    </Flex>
  );
}

function Ancestor({ card, content, last, className }: AncestorType): JSX.Element {
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
          className={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {i18n.common.project}
        </Clickable>
        <Icon icon={'chevron_right'} opsz="xs" className={cx(breadCrumbsStyle, className)} />
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    //const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    //const t = match ? match[1] || 'card' : 'card';
    const t = 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
          className={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {card.title ? card.title : i18n.modules.card.untitled}
        </Clickable>
        {!last && (
          <Icon icon={'chevron_right'} opsz="xs" className={cx(breadCrumbsStyle, className)} />
        )}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}

{
  /*
  <Flex align="center" className={p_sm} justify="space-between">
    <IconButton
      title="toggle view edit"
      icon={location.pathname.includes('card') ? 'edit' : 'view_comfy'}
      onClick={() => {
        // Note : functional but not so strong
        if (location.pathname.includes('/card/')) {
          navigate(`${location.pathname.replace('/card/', '/edit/')}`);
        } else {
          navigate(`${location.pathname.replace('/edit/', '/card/')}`);
        }
      }}
      className={lightIconButtonStyle}
    />
  </Flex> 
*/
}
