/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCircle, faCircleDot, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { ResourceAndRef } from '../resourcesCommonType';

interface TargetResourceSummaryProps {
  resource: ResourceAndRef;
  iconClassName?: string;
}

export default function TargetResourceSummary({
  resource,
  iconClassName,
}: TargetResourceSummaryProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      {/* only on card content => show "only for variant" */}
      {resource.isDirectResource && resource.targetResource.cardContentId != null && (
        <FontAwesomeIcon
          icon={faCircle}
          size="xs"
          title={i18n.modules.resource.onlyForVariant}
          className={iconClassName}
        />
      )}
      {/* not direct => say where it comes from */}
      {!resource.isDirectResource &&
        (resource.targetResource.abstractCardTypeId != null ? (
          <FontAwesomeIcon
            icon={faCircleDot}
            title={i18n.modules.resource.info.providedByCardType}
            className={iconClassName}
          />
        ) : (
          <FontAwesomeIcon
            icon={faSquare}
            title={i18n.modules.resource.info.providedByUpperCard}
            className={iconClassName}
          />
        ))}
    </>
  );
}
