/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';
import { Card } from 'colab-rest-client';
import React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import logger from '../../../../logger';
import CardContentStatus from '../../../cards/CardContentStatus';
import CardLayout from '../../../cards/CardLayout';
import VariantSelector from '../../../cards/VariantSelector';
import Flex from '../../../common/layout/Flex';
import { space_M, space_S, variantTitle } from '../../../styling/style';
import { AFPlumbRef } from './ActivityFlowChart';

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
  //const navigate = useNavigate();

  const refCb = React.useCallback(
    (ref: HTMLDivElement | null) => {
      assignDiv(jsPlumb, plumbRefs.divs, ref, `Card-${card.id}`);
    },
    [jsPlumb, plumbRefs, card.id],
  );

  /*   const navigateToEditPageCb = React.useCallback((card: Card) => {
    const path = `edit/${card.id}/`;
    if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
      navigate(`../${path}`);
    } else {
      navigate(path);
    }
  }, [navigate]); */

  return (
    <div
      ref={refCb}
      data-cardid={card.id}
      className={`CardSource CardTarget ${cardStyle} ` + css({ margin: space_M })}
    >
      <VariantSelector card={card}>
        {(variant, variants) => (
          <CardLayout card={card} variant={variant} variants={variants}>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                borderTop:
                  card.color && card.color != '#ffffff' ? '5px solid ' + card.color : 'none',
                width: '100%',
              })}
            >
              <div
                className={css({
                  padding: space_S + ' ' + space_M,
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  })}
                >
                  <div>
                    <CardContentStatus mode="icon" status={variant?.status || 'ACTIVE'} />
                    <span className={css({ fontWeight: 'bold' })}>
                      {card.title || i18n.modules.card.untitled}
                    </span>
                    {variants.length > 1 && (
                      <span className={variantTitle}>
                        &#xFE58;
                        {variant?.title && variant.title.length > 0
                          ? variant.title
                          : `${i18n.modules.card.variant} ${variants.indexOf(variant!) + 1}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Flex
              direction="column"
              align="center"
              className={`CardSourceHandle ` + css({ minHeight: '1.5rem', flexGrow: 1 })}
            >
               <Icon icon={faProjectDiagram} className={css({ margin: 'auto' })} />
            </Flex>
          </CardLayout>
        )}
      </VariantSelector>
    </div>
  );
}
