/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { space_sm } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { PresenceContext } from '../presence/PresenceContext';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import SubCardsGrid from './SubCardsGrid';

export const depthMax = 2;

export default function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
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
      <ProjectBreadcrumbs />
      {rootContent != null ? (
        <Flex className={css({ overflow: 'hidden' })} justify="center" direction="row">
          {subCards && subCards.length > 0 && (
            <CardCreatorAndOrganize
              rootContent={rootContent}
              organize={{ organize: organize, setOrganize: setOrganize }}
              cardCreatorClassName={css({ marginLeft: space_sm })}
              organizeButtonClassName={css({ margin: space_sm + ' 0 0 ' + space_sm })}
            />
          )}
          <SubCardsGrid
            cardContent={rootContent}
            depth={depthMax}
            showEmptiness={true}
            organize={organize}
            minCardWidth={150}
            className={css({ height: '100%', overflow: 'auto', flexGrow: 1 })}
          />
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}
