/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Assignment } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useLoadAssignments, useMyAssignments } from '../../store/selectors/assignmentSelector';
import { heading_sm, lightTextStyle, space_lg, space_md, space_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import TaskItem from './TaskItem';

const panelStyle = cx(
  css({
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: space_lg,
    padding: space_md,
  }),
);

const sectionDivStyle = cx(
  css({
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: space_sm,
  }),
);

const sectionTitleStyle = cx(heading_sm, lightTextStyle);

export default function ProjectTasksPanel(): JSX.Element {
  const i18n = useTranslations();

  const statusAssignment = useLoadAssignments();

  // const statusCards = useLoadCardsForCurrentProject();

  // const statusCardContents = useLoadCardContentsForCurrentProject();

  const { status, assignments } = useMyAssignments();

  const { responsible, approving, support } = React.useMemo(() => {
    const responsible: Assignment[] = [];
    const approving: Assignment[] = [];
    const support: Assignment[] = [];

    assignments.forEach(assignment => {
      if (assignment.involvementLevel === 'RESPONSIBLE') {
        responsible.push(assignment);
      } else if (assignment.involvementLevel === 'ACCOUNTABLE') {
        approving.push(assignment);
      } else if (assignment.involvementLevel === 'SUPPORT') {
        support.push(assignment);
      }
    });

    return { responsible, approving, support };
  }, [assignments]);

  if (statusAssignment !== 'READY') {
    return <AvailabilityStatusIndicator status={statusAssignment} />;
  }

  // if (statusCards !== 'READY') {
  //   return <AvailabilityStatusIndicator status={statusCards} />;
  // }

  // if (statusCardContents !== 'READY') {
  //   return <AvailabilityStatusIndicator status={statusCardContents} />;
  // }

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex className={panelStyle}>
      <Flex className={sectionDivStyle}>
        <Flex className={sectionTitleStyle}>{i18n.team.assignment.labels.responsible}</Flex>
        {responsible.map(assignment => (
          <TaskItem key={assignment.id} assignment={assignment} />
        ))}
      </Flex>
      <Flex className={sectionDivStyle}>
        <Flex className={sectionTitleStyle}>{i18n.team.assignment.labels.accountable}</Flex>
        {approving.map(assignment => (
          <TaskItem key={assignment.id} assignment={assignment} />
        ))}
      </Flex>
      <Flex className={sectionDivStyle}>
        <Flex className={sectionTitleStyle}>{i18n.team.assignment.labels.support}</Flex>
        {support.map(assignment => (
          <TaskItem key={assignment.id} assignment={assignment} />
        ))}
      </Flex>
    </Flex>
  );
}
