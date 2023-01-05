/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import useTranslations from '../../i18n/I18nContext';
import Tips from '../common/element/Tips';
import { space_M, space_S } from '../styling/style';

interface PasswordFeedbackDisplayProps {
  feedback: PasswordFeedback;
}

export default function PasswordFeedbackDisplay({
  feedback,
}: PasswordFeedbackDisplayProps): JSX.Element {
  const i18n = useTranslations();
  // TODO translate feedbacks (https://github.com/dropbox/zxcvbn/blob/master/src/feedback.coffee)

  return (
    <div className={css({ textAlign: 'left' })}>
      <span>{feedback.warning || i18n.authentication.error.passwordTooWeak}</span>
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <Tips className={css({ textAlign: 'left' })}>
          <ul className={css({ paddingLeft: space_M })}>
            {feedback.suggestions.map((s, i) => (
              <li key={i} className={css({ marginBottom: space_S })}>
                {s}
              </li>
            ))}
          </ul>
        </Tips>
      )}
    </div>
  );
}
