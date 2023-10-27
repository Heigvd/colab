/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Ancestor as AncestorType, isCardAlive, useAncestors } from '../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../store/selectors/projectSelector';
import { linkStyle, p_sm, space_sm } from '../../styling/style';
import { CardTitle } from '../cards/CardTitle';
import Droppable from '../cards/dnd/Droppable';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
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

  const ancestors = useAncestors(card);

  if (status != 'READY' || currentProject == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex align="center" className={p_sm}>
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
            navigate(`../${location.pathname.includes('hierarchy') ? 'hierarchy' : '.'}`);
          }}
          className={cx(
            linkStyle,
            breadcrumbsStyle,
            css({ paddingLeft: 0, marginLeft: 0 }),
            className,
          )}
        >
          {entityIs(content, 'CardContent') && content.id != null ? (
            <Droppable id={content.id} data={content}>
              {i18n.common.project}
            </Droppable>
          ) : (
            <>{i18n.common.project}</>
          )}
        </Clickable>
        {card != null && (
          <Icon icon={'chevron_right'} opsz="xs" className={cx(breadcrumbsStyle, className)} />
        )}
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../card/${content.cardId}/v/${content.id}`);
          }}
          className={cx(
            linkStyle,
            breadcrumbsStyle,
            {[css({ color: 'var(--error-dark)' })]: !isCardAlive(card)},
            className,
            )}
        >
          {entityIs(content, 'CardContent') && content.id != null ? (
            <Droppable id={content.id} data={content}>
              <CardTitle card={card} />
            </Droppable>
          ) : (
            <CardTitle card={card} />
          )}
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
