/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 * */

import * as React from "react";
import {PasswordFeedback} from "react-password-strength-bar";
import Tips from "../common/Tips";

interface PasswordFeedbackDisplayProps {
  feedback: PasswordFeedback;
}

export default function PasswordFeedbackDisplay({feedback}: PasswordFeedbackDisplayProps): JSX.Element {

// TODO translate feedbacks (https://github.com/dropbox/zxcvbn/blob/master/src/feedback.coffee)
  return (<div>
    <span>{feedback.warning}</span>
    {
      feedback.suggestions && feedback.suggestions.length > 0 ?
        <Tips>
          <ul>
            {feedback.suggestions.map((s, i) =>  <li key={i}>{s}</li>)}
          </ul>
        </Tips>
        : null
    }
  </div>);
}
