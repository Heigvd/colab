/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import useTranslations from '../../i18n/I18nContext';
import Tips from '../common/element/Tips';

interface PasswordFeedbackDisplayProps {
  feedback: PasswordFeedback;
}

export default function PasswordFeedbackDisplay({
  feedback,
}: PasswordFeedbackDisplayProps): JSX.Element {
  const i18n = useTranslations();
  // TODO translate feedbacks (https://github.com/dropbox/zxcvbn/blob/master/src/feedback.coffee)

  return (
    <div>
      <span>{feedback.warning || i18n.authentication.error.passwordTooWeak}</span>
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <Tips>
          <ul>
            {feedback.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Tips>
      )}
    </div>
  );
}
