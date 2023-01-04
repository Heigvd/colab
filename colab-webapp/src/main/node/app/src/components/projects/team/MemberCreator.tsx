/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import { emailFormat } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import { addNotification } from '../../../store/notification';
import Button from '../../common/element/Button';
import IconButtonWithLoader from '../../common/element/IconButtonWithLoader';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { inputStyle, linkStyle, space_M, textSmall, warningColor } from '../../styling/style';

interface MemberCreatorProps {
  members: TeamMember[];
  project: Project;
}
export default function MemberCreator({ members, project }: MemberCreatorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const [invite, setInvite] = React.useState('');
  const [error, setError] = React.useState<boolean | string>(false);
  const isNewMember = (newMail: string) => {
    let isNew = true;
    members.forEach(m => {
      if (m.displayName === newMail) {
        isNew = false;
      }
    });
    return isNew;
  };
  const isValidNewMember =
    invite.length > 0 && invite.match(emailFormat) != null && isNewMember(invite);
  return (
    <OpenCloseModal
      title={i18n.team.inviteNewMember}
      collapsedChildren={<Button clickable>+ {i18n.team.inviteNewMember}</Button>}
      modalBodyClassName={css({ padding: space_M })}
      showCloseButton
    >
      {() => (
        <>
          <input
            placeholder={i18n.authentication.field.emailAddress}
            type="text"
            onChange={e => setInvite(e.target.value)}
            value={invite}
            className={inputStyle}
          />
          <IconButtonWithLoader
            className={linkStyle}
            icon={faPaperPlane}
            title={i18n.common.send}
            isLoading={isValidNewMember}
            onClick={() => {
              if (isValidNewMember) {
                setError(false);
                dispatch(
                  API.sendInvitation({
                    projectId: project.id!,
                    recipient: invite,
                  }),
                ).then(() => {
                  setInvite('');
                  dispatch(
                    addNotification({
                      status: 'OPEN',
                      type: 'INFO',
                      message: `${invite} ${i18n.team.mailInvited}`,
                    }),
                  );
                });
              } else if (!isNewMember(invite)) {
                setError(i18n.team.memberAlreadyExist);
              } else {
                setError(i18n.authentication.error.emailAddressNotValid);
              }
            }}
          />
          {error && <div className={cx(css({ color: warningColor }), textSmall)}>{error}</div>}
        </>
      )}
    </OpenCloseModal>
  );
}