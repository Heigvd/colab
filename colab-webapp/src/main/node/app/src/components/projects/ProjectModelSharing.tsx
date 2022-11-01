/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { addNotification } from '../../store/notification';
import Form, { Field } from '../common/element/Form';

export interface ProjectModelSharingProps {
  projectId: number;
}

interface FormData {
  email: string;
}

const defaultData: FormData = { email: '' };

export default function ProjectModelSharing({ projectId }: ProjectModelSharingProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const formFields: Field<FormData>[] = [
    {
      key: 'email',
      label: i18n.authentication.field.emailAddress,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.email.match(emailFormat) == null,
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
  ];

  const sendSharing = React.useCallback(
    ({ email }: FormData) => {
      startLoading();

      dispatch(API.shareModel({ projectId, recipient: email })).then(() => {
        stopLoading();
      });

      dispatch(
        addNotification({
          status: 'OPEN',
          type: 'INFO',
          message: i18n.modules.project.info.mailSentToShare(email),
        }),
      );
    },
    [dispatch, i18n.modules.project.info, projectId, startLoading, stopLoading],
  );

  return (
    <div>
      <Form
        fields={formFields}
        value={defaultData}
        resetDataAfterSubmit
        onSubmit={sendSharing}
        isSubmitInProcess={isLoading}
        submitLabel="share"
      />
    </div>
  );
}
