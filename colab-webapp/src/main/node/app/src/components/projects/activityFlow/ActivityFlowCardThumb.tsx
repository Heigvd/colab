/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import {
  ellipsisStyle,
  lightTextStyle,
  space_md,
  space_sm,
  space_xs,
  text_xs,
} from '../../../styling/style';
import CardContentStatusDisplay from '../../cards/CardContentStatusDisplay';
import CardLayout from '../../cards/CardLayout';
import { CardTitle } from '../../cards/CardTitle';
import VariantSelector from '../../cards/VariantSelector';
import DeletionStatusIndicator from '../../common/element/DeletionStatusIndicator';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { AFPlumbRef } from './ActivityFlowChartPanel';

const cardStyle = css({
  zIndex: 1,
  userSelect: 'none',
});

const assignDiv = (
  jsPlumb: BrowserJsPlumbInstance,
  refs: AFPlumbRef['divs'],
  element: Element | null,
  key: string,
) => {
  logger.debug('Assign div ', key, ' to ', element);
  if (element != null) {
    jsPlumb.manage(element);
    jsPlumb.setDraggable(element, false);
    refs[key] = element;
  } else {
    delete refs[key];
  }
};

interface CardProps {
  card: Card;
  plumbRefs: AFPlumbRef;
  jsPlumb: BrowserJsPlumbInstance;
}

export function AFCard({ card, jsPlumb, plumbRefs }: CardProps): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  //const navigate = useNavigate();

  const refCb = React.useCallback(
    (ref: HTMLDivElement | null) => {
      assignDiv(jsPlumb, plumbRefs.divs, ref, `Card-${card.id}`);
    },
    [jsPlumb, plumbRefs, card.id],
  );

  const navigateToEditPageCb = React.useCallback(
    (variant?: CardContent) => {
      navigate(`../card/${card.id}/v/${variant?.id}`);
    },
    [card.id, navigate],
  );

  const clickOnCardTitleCb = React.useCallback(
    (e: React.MouseEvent, variant?: CardContent) => {
      navigateToEditPageCb(variant);
      e.stopPropagation();
    },
    [navigateToEditPageCb],
  );

  return (
    <div
      ref={refCb}
      data-cardid={card.id}
      className={`'CardSource CardTarget ${cardStyle} ` + css({ margin: space_md })}
    >
      <VariantSelector card={card} withNav={false}>
        {(variant, variants) => (
          <CardLayout card={card} variant={variant} variants={variants}>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                height: '40px',
                width: '140px',
                cursor: 'pointer',
              })}
              onClick={e => {
                e.stopPropagation();
                clickOnCardTitleCb(e, variant);
              }}
            >
              <div
                className={css({
                  padding: space_xs + ' ' + space_md,
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  })}
                >
                  <Flex align="center" className={css({ overflow: 'hidden' })}>
                    <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                      {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                      <DeletionStatusIndicator status={card.deletionStatus} size="xs" />
                    </Flex>
                    <p className={cx(css({ fontWeight: 'bold' }), ellipsisStyle)}>
                      <CardTitle card={card} />
                    </p>
                    <Flex className={css({ margin: '0 ' + space_sm })}>
                      <CardContentStatusDisplay kind="icon_only" status={variant?.status} />
                    </Flex>
                    {variants.length > 1 && (
                      <p className={cx(text_xs, lightTextStyle, ellipsisStyle)}>
                        &#xFE58;
                        {variant?.deletionStatus != null && (
                          <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                            {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                            <DeletionStatusIndicator status={variant.deletionStatus} size="sm" />
                          </Flex>
                        )}
                        {variant?.title && variant.title.length > 0
                          ? variant.title
                          : `${i18n.modules.card.variant} ${variants.indexOf(variant!) + 1}`}
                      </p>
                    )}
                  </Flex>
                </div>
              </div>
            </div>
            <Flex
              direction="column"
              align="stretch"
              className={`CardSourceHandle ` + css({ minHeight: '1.5rem', flexGrow: 1 })}
            >
              <Icon
                icon={'trip_origin'}
                color={'var(--divider-main)'}
                className={css({
                  alignSelf: 'center',
                  '&:hover': {
                    color: 'var(--divider-dark)',
                    cursor: 'grab',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                })}
              />
            </Flex>
          </CardLayout>
        )}
      </VariantSelector>
    </div>
  );
}
