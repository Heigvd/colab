/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { Assignment } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useLoadAssignments, useMyAssignments } from '../../../selectors/assignmentSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Flex from '../../common/layout/Flex';
import { heading_xs, lightTextStyle, p_md, space_sm } from '../../styling/style';
import Task from './TaskItem';

const sectionTitleStyle = cx(heading_xs, lightTextStyle);
interface ProjectTaskListProps {
  className?: string;
}

export default function ProjectTasksList({ className }: ProjectTaskListProps): JSX.Element {
  const i18n = useTranslations();

  const statusAssignment = useLoadAssignments();

  // const statusCards = useLoadCardsForCurrentProject();

  // const statusCardContents = useLoadCardContentsForCurrentProject();

  const { status, assignments } = useMyAssignments();

  const { responsible, approver, others } = React.useMemo(() => {
    const responsible: Assignment[] = [];
    const approver: Assignment[] = [];
    const others: Assignment[] = [];

    assignments.forEach(assignment => {
      if (assignment.involvementLevel === 'RESPONSIBLE') {
        responsible.push(assignment);
      } else if (assignment.involvementLevel === 'ACCOUNTABLE') {
        approver.push(assignment);
      } else {
        others.push(assignment);
      }
    });

    return { responsible, approver, others };
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
    return <AvailabilityStatusIndicator status={'READY'} />; //status} />;
  }

  return (
    <Flex align="stretch" direction="column" gap={space_sm} className={cx(p_md, className)}>
      <p className={sectionTitleStyle}>{i18n.team.raci.responsible}</p>
      {responsible.map(assignment => (
        <Task key={assignment.id} assignment={assignment} />
      ))}
      <p className={sectionTitleStyle}>{i18n.team.raci.approver}</p>
      {approver.map(assignment => (
        <Task key={assignment.id} assignment={assignment} />
      ))}
      <p className={sectionTitleStyle}>{i18n.team.raci.support}</p>
      {others.map(assignment => (
        <Task key={assignment.id} assignment={assignment} />
      ))}
    </Flex>
  );
}
