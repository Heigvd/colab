/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React, { useCallback } from 'react';
import * as API from '../../API/api';
import { emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import { m_md, space_lg, space_md, space_xs, warningTextStyle } from '../../styling/style';
import Button from '../common/element/Button';
import { BlockInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import OpenModalOnClick from '../common/layout/OpenModalOnClick';

interface MassMemberCreatorProps {
  mode: 'INVITE' | 'SHARE';
}

export default function MassMemberCreator({ mode }: MassMemberCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const projectId = useCurrentProjectId();

  const [error, setError] = React.useState<boolean | string>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [invalidEmails, setInvalidEmails] = React.useState<string[]>([]);

  const isValidEmail = useCallback((email: string) => {
    return email.length > 0 && email.match(emailFormat) != null;
  }, []);

  const validateEmails = useCallback(
    (emails: string[]): boolean => {
      let error = false;

      emails.forEach(email => {
        if (!isValidEmail(email)) {
          error = true;
          setError(i18n.team.mailInvalid);
          setInvalidEmails(current => [...current, email]);
        }
      });

      return error;
    },
    [i18n.team.mailInvalid, isValidEmail],
  );

  return (
    <OpenModalOnClick
      title={mode === 'INVITE' ? i18n.common.invite : i18n.common.share}
      collapsedChildren={
        <Button kind="outline" icon="add" size="sm">
          {mode === 'INVITE' ? i18n.common.invite : i18n.common.share}
        </Button>
      }
      modalBodyClassName={css({ padding: space_lg, alignItems: 'stretch' })}
      size="lg"
      footer={close => (
        <Flex
          justify="space-between"
          align="center"
          grow={1}
          gap={space_md}
          className={css({ padding: space_lg, justifyContent: 'flex-end' })}
        >
          <Button
            kind={'outline'}
            onClick={() => {
              setInputValue('');
              setError(false);
              close();
            }}
          >
            {i18n.common.close}
          </Button>
          <Button
            onClick={() => {
              setInvalidEmails([]);
              const emails = inputValue
                .split(/[,\n;]+/)
                .map(email => email.trim())
                .filter(email => email !== '');

              if (!validateEmails(emails) && emails.length > 0) {
                setLoading(true);
                setError(false);
                for (const mail of emails) {
                  if (mode === 'INVITE') {
                    dispatch(
                      API.sendInvitation({
                        projectId: projectId!,
                        recipient: mail,
                      }),
                    );
                  } else if (mode === 'SHARE') {
                    dispatch(
                      API.shareModel({
                        projectId: projectId!,
                        recipient: mail,
                      }),
                    );
                  }
                }
                dispatch(
                  addNotification({
                    status: 'OPEN',
                    type: 'INFO',
                    message: `${i18n.team.mailsInvited}`,
                  }),
                );
                setInputValue('');
                setLoading(false);
                close();
              }
            }}
            isLoading={loading}
          >
            {i18n.common.send}
          </Button>
        </Flex>
      )}
    >
      {() => (
        <>
          <Flex direction={'column'} className={m_md} gap={space_md} align={'stretch'}>
            {i18n.team.mailInstructions}
            <BlockInput
              inputType={'textarea'}
              saveMode={'ON_BLUR'}
              value={inputValue}
              onChange={e => setInputValue(e)}
              placeholder="maria.meier@mail.ch,peter.huber@mail.ch"
            />
          </Flex>
          {error && (
            <>
              <div className={cx(m_md, warningTextStyle)}>{error} :</div>
              <ul className={css({ margin: 0 })}>
                {invalidEmails &&
                  invalidEmails.map((mail, i) => (
                    <li className={css({ marginLeft: space_xs, padding: 0 })} key={i}>
                      {mail}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </>
      )}
    </OpenModalOnClick>
  );
}
