/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAllProjectCards } from '../../../selectors/cardSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch } from '../../../store/hooks';
import Flex from '../../common/layout/Flex';
import Loading from '../../common/layout/Loading';
import { heading_xs, lightTextStyle, p_md, space_sm } from '../../styling/style';
import Task from './TaskItem';

const sectionTitleStyle = cx(heading_xs, lightTextStyle)
interface ProjectTaskListProps {
  className?: string;
}

export default function ProjectTaskList({className}: ProjectTaskListProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const cards = useAllProjectCards();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  //const { project: projectBeingEdited } = useProjectBeingEdited();

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  if (currentUserStatus === 'NOT_INITIALIZED') {
    return <Loading />;
  } else if (currentUserStatus == 'LOADING') {
    return <Loading />;
  } else {
    return (
      <Flex align="stretch" direction='column' gap={space_sm} className={cx(p_md, className)}>
        {currentUser?.affiliation}
        <p className={sectionTitleStyle}>{i18n.team.raci.responsible}</p>
        {cards.filter(card => card.defaultInvolvementLevel === 'RESPONSIBLE').map(card => (<Task key={card.id} card={card} />))}
        <p className={sectionTitleStyle}>{i18n.team.raci.approver}</p>
        {cards.filter(card => card.defaultInvolvementLevel === 'ACCOUNTABLE').map(card => (<Task key={card.id} card={card} />))}
        <p className={sectionTitleStyle}>{i18n.team.raci.support}</p>
        {cards.filter(card => card.defaultInvolvementLevel === 'INFORMED_READWRITE').map(card => (<Task key={card.id} card={card} />))}
      </Flex>
    );
  }
}
