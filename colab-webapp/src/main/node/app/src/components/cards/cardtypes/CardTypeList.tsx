/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { uniq } from 'lodash';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
  useAndLoadAvailableCardTypes,
  useAndLoadProjectCardTypes,
} from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import Collapsible from '../../common/Collapsible';
import FilterableList from '../../common/FilterableList';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import { space_L, space_M, space_S } from '../../styling/style';
import CardTypeCreator from './CardTypeCreator';
import CardTypeEditor from './CardTypeEditor';
import CardTypeItem from './CardTypeItem';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
  gap: space_L,
  marginBottom: space_L,
});

export default function CardTypeList(): JSX.Element {
  const navigate = useNavigate();
  const { project } = useProjectBeingEdited();
  const { cardTypes: projectCardTypes, status: projectCTStatus } = useAndLoadProjectCardTypes();
  const { cardTypes: availableCardTypes, status: availableCTStatus } =
    useAndLoadAvailableCardTypes();
  const projectTags = uniq(
    [...projectCardTypes].flatMap(cardType => (cardType ? cardType.tags : [])),
  );
  const availableTags = uniq(
    [...availableCardTypes].flatMap(cardType => (cardType ? cardType.tags : [])),
  );

  // set all tags on true by default doesn t work
  const [pTagState, setPTagState] = React.useState<Record<string, boolean> | undefined>();

  const [aTagState, setATagState] = React.useState<Record<string, boolean> | undefined>();

  const [selectAllPTags, setSelectAllPTags] = React.useState<boolean>(true);
  const [selectAllATags, setSelectAllATags] = React.useState<boolean>(true);

  const ePTags = Object.keys(pTagState || []).filter(tag => pTagState && pTagState[tag]);
  const eATags = Object.keys(aTagState || []).filter(tag => aTagState && aTagState[tag]);

  const projectCardTypeFilteredByTag = projectCardTypes.filter(ty => {
    const hasNoTag = ty.tags.length == 0;
    const hasMatchingTag = ty.tags.find(tag => ePTags.includes(tag));

    return hasNoTag || hasMatchingTag;
  });

  const availableCardTypeFilteredByTag = availableCardTypes.filter(ty => {
    const hasNoTag = ty.tags.length == 0;
    const hasMatchingTag = ty.tags.find(tag => eATags.includes(tag));

    return hasNoTag || hasMatchingTag;
  });

  const toggleAllPTags = (val: boolean) => {
    setSelectAllPTags(val);
    setPTagState(
      projectTags.reduce<Record<string, boolean>>((acc, cur) => {
        acc[cur] = val;
        return acc;
      }, {}),
    );
  };

  const toggleAllATags = (val: boolean) => {
    setSelectAllATags(val);
    setATagState(
      availableTags.reduce<Record<string, boolean>>((acc, cur) => {
        acc[cur] = val;
        return acc;
      }, {}),
    );
  };

  React.useEffect(() => {
    if (projectCTStatus === 'READY') {
      toggleAllPTags(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCTStatus /* no effect when toggleAllPTags changes */]);

  React.useEffect(() => {
    if (availableCTStatus === 'READY') {
      toggleAllATags(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCTStatus /* no effect when toggleAllTags changes */]);

  if (project == null) {
    return <i>No project</i>;
  } else {
    if (projectCTStatus !== 'READY') {
      return <AvailabilityStatusIndicator status={projectCTStatus} />;
    } else if (availableCTStatus !== 'READY') {
      return <AvailabilityStatusIndicator status={availableCTStatus} />;
    } else {
      return (
        <>
          <Routes>
            <Route path="edit/:id/*" element={<CardTypeEditor />} />
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
                    <h2>Card Types</h2>
                    <CardTypeCreator />
                  </Flex>
                  <h4>Project types</h4>
                  <FilterableList
                    tags={projectTags}
                    onChange={(t, cat) =>
                      setPTagState(state => {
                        return { ...state, [cat]: t };
                      })
                    }
                    tagState={pTagState}
                    stateSelectAll={selectAllPTags}
                    toggleAllTags={t => toggleAllPTags(t)}
                    className={css({ paddingBottom: space_S })}
                  />
                  <div className={flexWrap}>
                    {projectCardTypeFilteredByTag.map(cardType => (
                      <CardTypeItem key={cardType.ownId} cardType={cardType} />
                    ))}
                  </div>
                  <Collapsible
                    title="Out of project types"
                    contentClassName={css({ flexDirection: 'column', alignItems: 'stretch' })}
                  >
                    <FilterableList
                      tags={availableTags}
                      onChange={(t, cat) =>
                        setATagState(state => {
                          return { ...state, [cat]: t };
                        })
                      }
                      tagState={aTagState}
                      stateSelectAll={selectAllATags}
                      toggleAllTags={t => toggleAllATags(t)}
                      className={css({ paddingBottom: space_S })}
                    />
                    <div className={flexWrap}>
                      {availableCardTypeFilteredByTag
                        //.filter(ct => ct.projectIdCT != null)
                        .map(cardType => (
                          <CardTypeItem
                            key={cardType.ownId}
                            cardType={cardType}
                            readOnly
                            notUsedInProject
                          />
                        ))}
                    </div>
                    {/* <div>
                      <h4>Global</h4>
                      <div className={flexWrap}>
                        {availableCardTypes
                          .filter(ct => ct.projectIdCT == null)
                          .map(cardType => (
                            <CardTypeItem
                              key={cardType.ownId}
                              cardType={cardType}
                              readOnly
                              notUsedInProject
                            />
                          ))}
                      </div>
                    </div> */}
                  </Collapsible>
                </Flex>
              }
            />
          </Routes>
        </>
      );
    }
  }
}
