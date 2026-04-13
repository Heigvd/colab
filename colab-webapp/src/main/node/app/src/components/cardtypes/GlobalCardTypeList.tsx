/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadGlobalTypesForAdmin } from '../../store/selectors/cardTypeSelector';
import { space_sm, space_xl } from '../../styling/style';
import { CardTypeAllInOne } from '../../types/cardTypeDefinition';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';
import CardTypeListWithFilter from './tags/DataWithTagsListWithFilter';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
  gap: space_xl,
  marginBottom: space_xl,
});

export default function GlobalCardTypeList(): JSX.Element {
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

  const { cardTypes, status } = useAndLoadGlobalTypesForAdmin();

  React.useEffect(() => {
    if (lastCreated) {
      cardTypes.forEach(cardType => {
        if (cardType.id === lastCreated) {
          navigate(`./card-type/${cardType.id}`);
          navigate(`./card-type/${cardType.ownId}`), setLastCreated(null);
        }
      });
    }
  }, [lastCreated, cardTypes, navigate, setLastCreated]);

  return (
    <Routes>
      <Route path="card-type/:id/*" element={<CardTypeEditor usage="global" />} />
      {/* TODO : stabilize the routes ! Now : easy path to make it work*/}
      <Route path="card-types/card-type/:id/*" element={<CardTypeEditor usage="global" />} />
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
              <h3> {i18n.modules.cardType.globalTypes}</h3>
              <CardTypeCreator usage="global" onCreated={setLastCreated} />
            </Flex>
            {status !== 'READY' ? (
              <AvailabilityStatusIndicator status={status} />
            ) : cardTypes.length > 0 ? (
              <CardTypeListWithFilter
                dataWithTags={cardTypes}
                filterClassName={css({ paddingBottom: space_sm })}
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
              <div>
                <p>{i18n.modules.cardType.info.createFirstGlobalType}</p>
              </div>
            )}
          </Flex>
        }
      />
    </Routes>
  );
}
