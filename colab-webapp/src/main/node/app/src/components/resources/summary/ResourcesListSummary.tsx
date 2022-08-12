/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import {
  useAndLoadCardTypeNbResources,
  useAndLoadNbResources,
} from '../../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import {
  CardOrCardContentContext,
  CardTypeContext,
  ResourceCallContext,
} from '../resourcesCommonType';

export default function ResourcesListSummary(context: ResourceCallContext): JSX.Element {
  if (context.kind === 'CardOrCardContent') {
    return <CardResourcesListSummary context={context} />;
  } else return <CTResourcesListSummary context={context} />;
}

interface cardResourceList {
  context: CardOrCardContentContext;
}
function CardResourcesListSummary({ context }: cardResourceList): JSX.Element {
  const { nb, status } = useAndLoadNbResources(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <FontAwesomeIcon
        icon={faPaperclip}
        title={
          !nb
            ? 'It does not contain any resource'
            : nb == 1
            ? 'It contains 1 resource'
            : 'It contains ' + nb + ' resources'
        }
      />{' '}
      {nb}
    </>
  );
}
interface CTResourceList {
  context: CardTypeContext;
}
function CTResourcesListSummary({ context }: CTResourceList): JSX.Element {
  const { nb, status } = useAndLoadCardTypeNbResources(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <FontAwesomeIcon
        icon={faPaperclip}
        title={
          !nb
            ? 'It does not contain any resource'
            : nb == 1
            ? 'It contains 1 resource'
            : 'It contains ' + nb + ' resources'
        }
      />{' '}
      {nb}
    </>
  );
}
