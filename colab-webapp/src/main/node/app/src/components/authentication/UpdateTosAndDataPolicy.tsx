/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { Link } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { space_lg, text_md } from '../../styling/style';
import { UserDropDown } from '../MainNav';
import Form, { Field } from '../common/element/Form';
import Flex from '../common/layout/Flex';

interface FormData {
  agreed: false;
}

const defaultData: FormData = {
  agreed: false,
};

export default function UpdateTosAndDataPolicyForm() {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  const [error, setError] = React.useState<string | undefined>(undefined);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const submit = React.useCallback(() => {
    startLoading();
    setError(undefined);

    if (currentUser && currentUser.id) {
      dispatch(API.updateUserAgreedTime(currentUser.id)).then(() => stopLoading());
      dispatch(API.reloadCurrentUser());
    } else {
      setError(i18n.common.error.sorryError);
    }
  }, [currentUser, dispatch, startLoading, stopLoading, i18n.common.error.sorryError]);

  const formFields: Field<FormData>[] = [
    {
      key: 'agreed',
      label: (
        <span>
          {i18n.authentication.label.iAccept + ' '}
          <Link to="../terms-of-use">{i18n.authentication.label.termOfUse}</Link>
          {' ' + i18n.common.and + ' '}
          <Link to="../data-policy">{i18n.authentication.label.dataPolicy}</Link>
        </span>
      ),
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
      isErroneous: data => !data.agreed,
      errorMessage: i18n.authentication.error.notAgreed,
    },
  ];

  return (
    <>
      <Flex direction="row" justify={'flex-end'}>
        <UserDropDown mode="LITE" />
      </Flex>
      <Flex
        direction="column"
        align="center"
        justify="center"
        className={css({ margin: 'auto', maxWidth: '500px' })}
      >
        <p className={text_md}>{i18n.authentication.info.updatedToSAndDataPolicy}</p>
        <Form
          fields={formFields}
          value={defaultData}
          onSubmit={submit}
          submitLabel={i18n.authentication.label.iAccept}
          globalErrorMessage={error}
          className={css({ width: '250px' })}
          buttonClassName={css({ margin: space_lg + ' auto' })}
          isSubmitInProcess={isLoading}
        ></Form>
      </Flex>
    </>
  );
}
