/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
  useAndLoadAvailableCardTypes,
  useAndLoadProjectCardTypes,
} from '../../../selectors/cardTypeSelector';
import { CardTypeAllInOne } from '../../../types/cardTypeDefinition';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import Collapsible from '../../common/Collapsible';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import { space_L, space_M, space_S, voidStyle } from '../../styling/style';
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

/**
 * Allow to handle card types of a project :
 *
 * - see what exists, filtered by tag
 * - edit a card type
 * - create a new card type
 * - reference existing published in other projects
 * - reference existing published outside projects
 * - remove referenced card type from project
 * - delete card type owned by project
 *
 * @returns Component to deal with the project's card types
 */
export default function ProjectCardTypeList(): JSX.Element {
  const navigate = useNavigate();

  const { cardTypes: projectCardTypes, status: projectCTStatus } = useAndLoadProjectCardTypes();
  const { cardTypes: availableCardTypes, status: availableCTStatus } =
    useAndLoadAvailableCardTypes();

  return (
    <Routes>
      <Route path="edit/:id/*" element={<CardTypeEditor usage="currentProject" />} />
      <Route
        path="*"
        element={
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({ alignSelf: 'stretch' })}
          >
            <IconButton
              icon={faArrowLeft}
              title={'Back'}
              iconColor="var(--darkGray)"
              onClick={() => navigate('../')}
              className={css({ display: 'inline', marginBottom: space_M })}
            />
            <Flex justify="space-between">
              <h2>Card types</h2>
              <CardTypeCreator usage="currentProject" />
            </Flex>
            {projectCTStatus !== 'READY' ? (
              <AvailabilityStatusIndicator status={projectCTStatus} />
            ) : projectCardTypes.length > 0 ? (
              <CardTypeListWithFilter
                dataWithTags={projectCardTypes}
                filterClassName={css({ paddingBottom: space_S })}
              >
                {filteredCardTypes => (
                  <div className={flexWrap}>
                    {(filteredCardTypes as CardTypeAllInOne[]).map(cardType => (
                      <CardTypeItem
                        key={cardType.ownId}
                        cardType={cardType}
                        usage="currentProject"
                      />
                    ))}
                  </div>
                )}
              </CardTypeListWithFilter>
            ) : (
              <div className={voidStyle}>
                <p>
                  Add the first card type to the project.
                  <br />
                  <br />
                  You can create an empty type with the button
                  <br />
                  or add a "shared available type" to the project.
                </p>
              </div>
            )}
            <Collapsible
              title="Shared available types"
              contentClassName={css({ flexDirection: 'column', alignItems: 'stretch' })}
            >
              {availableCTStatus !== 'READY' ? (
                <AvailabilityStatusIndicator status={availableCTStatus} />
              ) : availableCardTypes.length > 0 ? (
                <CardTypeListWithFilter
                  dataWithTags={availableCardTypes}
                  filterClassName={css({ paddingBottom: space_S })}
                >
                  {filteredCardTypes => (
                    <div className={flexWrap}>
                      {(filteredCardTypes as CardTypeAllInOne[]).map(cardType => (
                        <CardTypeItem key={cardType.ownId} cardType={cardType} usage="available" />
                      ))}
                    </div>
                  )}
                </CardTypeListWithFilter>
              ) : (
                <div className={voidStyle}>
                  <p>There are no available external card types</p>
                </div>
              )}
            </Collapsible>
          </Flex>
        }
      />
    </Routes>
  );
}
