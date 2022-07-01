/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Resource } from 'colab-rest-client';
import * as React from 'react';

interface TargetResourceSummaryProps {
  resource: Resource;
  iconClassName?: string;
}

export default function TargetResourceSummary({
  resource,
  iconClassName,
}: TargetResourceSummaryProps): JSX.Element {
  return (
    <>
      {resource.cardContentId && <ResourceOfCardContentSummary className={iconClassName} />}
      {resource.abstractCardTypeId && <ResourceOfCardTypeSummary className={iconClassName} />}
    </>
  );
}

function ResourceOfCardContentSummary({ className }: { className?: string }): JSX.Element {
  return (
    <FontAwesomeIcon
      icon={faCircle}
      size='xs'
      title={'Available only for this variant'}
      className={className}
    />
  );
}

function ResourceOfCardTypeSummary({ className }: { className?: string }): JSX.Element {
  return (
    <FontAwesomeIcon
      icon={faCircleDot}
      title={'Provided by the card type'}
      className={className}
    />
  );
}
