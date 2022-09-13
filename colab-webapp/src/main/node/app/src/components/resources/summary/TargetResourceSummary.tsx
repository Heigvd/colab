/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Resource } from 'colab-rest-client';
import _ from 'lodash';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';

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
      {/* at card leved is the nothing-special way */}
      {resource.abstractCardTypeId && <ResourceOfCardTypeSummary className={iconClassName} />}
    </>
  );
}

function ResourceOfCardContentSummary({ className }: { className?: string }): JSX.Element {
  const i18n = useTranslations();
  return (
    <FontAwesomeIcon
      icon={faCircle}
      size="xs"
      title={i18n.modules.resource.onlyForVariant}
      className={className}
    />
  );
}

function ResourceOfCardTypeSummary({ className }: { className?: string }): JSX.Element {
  const i18n = useTranslations();

  return (
    <FontAwesomeIcon
      icon={faCircleDot}
      title={i18n.modules.cardType.info.providedByCardType}
      className={className}
    />
  );
}
