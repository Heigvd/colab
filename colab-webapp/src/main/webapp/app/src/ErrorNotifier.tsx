/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css } from '@emotion/css';

import { TDispatch, ColabState } from './store';
import { connect } from 'react-redux';
import { HttpErrorMessage, HttpException, entityIs } from 'colab-rest-client';
import { ColabError, closeError } from './store/error';

interface StateProps {
  errors: ColabError[];
}

interface DispatchProps {
  closeError: (index: number) => void;
}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

function prettyPrintError(error: HttpException | Error): string {
  if (entityIs<'HttpErrorMessage'>(error, 'HttpErrorMessage')) {
    return translateErrorCode(error.messageCode);
  } else {
    return error.message;
  }
}

function translateErrorCode(code: HttpErrorMessage['messageCode']): string {
  switch (code) {
    case 'AUTHENTICATION_FAILED':
      return 'Authentication failed';
    case 'AUTHENTICATION_REQUIRED':
      return 'Please authenticate';
    case 'ACCESS_DENIED':
      return 'Access denied';
    case 'NOT_FOUND':
      return 'Not fouund';
    case 'USERNAME_ALREADY_TAKEN':
      return 'Please choose another username';
    case 'SMTP_ERROR':
      return 'e-mail server error';
    case 'EMAIL_MESSAGE_ERROR':
      return 'e-mail not sent';
    case 'BAD_REQUEST':
    default:
      return 'Bad request';
  }
}

function ErrorNotifier({ errors, closeError }: Props) {
  return (
    <div
      className={css({
        position: 'fixed',
        zIndex: 999,
        top: 0,
        right: 0,
      })}
    >
      {errors.map((error, index) =>
        error.status === 'OPEN' ? (
          <div
            key={index}
            className={css({
              backgroundColor: '#B00020',
              color: 'white',
              border: '1px solid black',
              padding: '10px',
              margin: '10px',
            })}
            onClick={() => closeError(index)}
          >
            {prettyPrintError(error.error)}
          </div>
        ) : null,
      )}
    </div>
  );
}

export default connect<StateProps, DispatchProps, OwnProps, ColabState>(
  state => ({
    errors: state.errors,
  }),
  (dispatch: TDispatch) => ({
    closeError: (index: number) => {
      dispatch(closeError(index));
    },
  }),
)(ErrorNotifier);
