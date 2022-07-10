/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAndLoadGlobalTypesForAdmin } from '../../../selectors/cardTypeSelector';
import { CardTypeAllInOne } from '../../../types/cardTypeDefinition';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import Flex from '../../common/layout/Flex';
import { space_L, space_S, voidStyle } from '../../styling/style';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';
import CardTypeListWithFilter from './tags/DataWithTagsListWithFilter';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
  gap: space_L,
  marginBottom: space_L,
});

export default function GlobalCardTypeList(): JSX.Element {
  const navigate = useNavigate();

  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

  const { cardTypes, status } = useAndLoadGlobalTypesForAdmin();

  React.useEffect(() => {
    if (lastCreated) {
      cardTypes.forEach(cardType => {
        if (cardType.id === lastCreated) {
          navigate(`./edit/${cardType.id}`);
          navigate(`./edit/${cardType.ownId}`), setLastCreated(null);
        }
      });
    }
  }, [lastCreated, cardTypes, navigate, setLastCreated]);

  return (
    <Routes>
      <Route path="edit/:id/*" element={<CardTypeEditor usage="global" />} />
      <Route
        path="*"
        element={
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({ alignSelf: 'stretch' })}
          >
            <Flex justify="space-between">
              <h3>Global card types</h3>
              <CardTypeCreator usage="global" onCreated={setLastCreated} />
            </Flex>
            {status !== 'READY' ? (
              <AvailabilityStatusIndicator status={status} />
            ) : cardTypes.length > 0 ? (
              <CardTypeListWithFilter
                dataWithTags={cardTypes}
                filterClassName={css({ paddingBottom: space_S })}
              >
                {filteredCardTypes => (
                  <div className={flexWrap}>
                    {(filteredCardTypes as CardTypeAllInOne[]).map(cardType => (
                      <CardTypeItem key={cardType.ownId} cardType={cardType} usage="global" />
                    ))}
                  </div>
                )}
              </CardTypeListWithFilter>
            ) : (
              <div className={voidStyle}>
                <p>Add the first global card type</p>
              </div>
            )}
          </Flex>
        }
      />
    </Routes>
  );
}
