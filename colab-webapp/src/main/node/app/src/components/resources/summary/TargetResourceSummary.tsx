/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { faBook, faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Resource } from 'colab-rest-client';
import * as React from 'react';
import { iconStyle } from '../../styling/style';

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
      icon={faLocationPin}
      title={'It is available just for this card content'}
      className={cx(iconStyle, className)}
    />
  );
}

function ResourceOfCardTypeSummary({ className }: { className?: string }): JSX.Element {
  return (
    <FontAwesomeIcon
      icon={faBook}
      title={'It is provided by the card type'}
      className={cx(iconStyle, className)}
    />
  );
}
