/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { AccessControl } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useLoadAcls, useMyAcls } from '../../../selectors/aclSelector';
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

  const statusAcl = useLoadAcls();

  // const statusCards = useLoadCardsForCurrentProject();

  // const statusCardContents = useLoadCardContentsForCurrentProject();

  const { status, acls } = useMyAcls();

  const { responsible, approver, others } = React.useMemo(() => {
    const responsible: AccessControl[] = [];
    const approver: AccessControl[] = [];
    const others: AccessControl[] = [];

    acls.forEach(acl => {
      if (acl.cairoLevel === 'RESPONSIBLE') {
        responsible.push(acl);
      } else if (acl.cairoLevel === 'ACCOUNTABLE') {
        approver.push(acl);
      } else {
        others.push(acl);
      }
    });

    return { responsible, approver, others };
  }, [acls]);

  if (statusAcl !== 'READY') {
    return <AvailabilityStatusIndicator status={statusAcl} />;
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
      {responsible.map(acl => (
        <Task key={acl.id} acl={acl} />
      ))}
      <p className={sectionTitleStyle}>{i18n.team.raci.approver}</p>
      {approver.map(acl => (
        <Task key={acl.id} acl={acl} />
      ))}
      <p className={sectionTitleStyle}>{i18n.team.raci.support}</p>
      {others.map(acl => (
        <Task key={acl.id} acl={acl} />
      ))}
    </Flex>
  );
}
