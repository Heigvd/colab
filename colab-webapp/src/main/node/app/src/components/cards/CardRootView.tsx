/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { binAccessDefaultIcon } from '../../styling/IconDefault';
import { space_sm } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import { MainMenuLink } from '../common/element/Link';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { PresenceContext } from '../presence/PresenceContext';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import SubCardsGrid from './SubCardsGrid';
import Dndwrapper from './dnd/Dndwrapper';
import Droppable from './dnd/Droppable';

export const depthMax = 2;

export default function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
  const i18n = useTranslations();

  const { touch } = React.useContext(PresenceContext);

  const subCards = useAndLoadSubCards(rootContent?.id);

  const [organize, setOrganize] = React.useState(false);

  React.useEffect(() => {
    touch({});
  }, [touch]);

  return (
    <div
      className={css({
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      })}
    >
      <Dndwrapper cards={subCards}>
        <ProjectBreadcrumbs />
        {rootContent != null && rootContent.id != null ? (
          <Flex className={css({ overflow: 'hidden' })} justify="center" direction="row" grow={1}>
            <Flex
              direction="column"
              justify="space-between"
              className={css({
                height: '100%',
                flexGrow: 1,
                marginBottom: '50px',
              })}
            >
              <CardCreatorAndOrganize
                rootContent={rootContent}
                organize={{ organize: organize, setOrganize: setOrganize }}
                cardCreatorClassName={css({ marginLeft: space_sm })}
                organizeButtonClassName={css({ margin: space_sm + ' 0 0 ' + space_sm })}
              />
              <Flex className={cx(css({ margin: ' 0 0 ' + space_sm + ' ' + space_sm }))}>
                <MainMenuLink to="./bin">
                  <Icon icon={binAccessDefaultIcon} title={i18n.common.bin.action.seeBin} />
                </MainMenuLink>
              </Flex>
            </Flex>
            <Flex
              className={css({
                height: '100%',
                overflow: 'auto',
                flexGrow: 1,
                paddingBottom: '50px',
              })}
            >
              <Droppable id={rootContent.id} data={rootContent}>
                <SubCardsGrid
                  cardContent={rootContent}
                  depth={depthMax}
                  alwaysShowAllSubCards
                  organize={organize}
                  minCardWidth={150}
                />
              </Droppable>
            </Flex>
          </Flex>
        ) : (
          <InlineLoading />
        )}
      </Dndwrapper>
    </div>
  );
}
