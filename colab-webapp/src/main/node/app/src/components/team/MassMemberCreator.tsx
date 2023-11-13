/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import React, { useCallback } from "react";
import useTranslations from "../../i18n/I18nContext";
import { emailFormat } from "../../helper";
import { useAppDispatch } from "../../store/hooks";
import { addNotification } from "../../store/slice/notificationSlice";
import Flex from "../common/layout/Flex";
import { inputStyle } from "../common/element/Input";
import * as API from '../../API/api';
import { useCurrentProjectId } from "../../store/selectors/projectSelector";
import OpenCloseModal from "../common/layout/OpenCloseModal";
import Button from "../common/element/Button";
import { m_md, space_lg, space_md } from "../../styling/style";
import { css, cx } from "@emotion/css";
import { useTeamMembers } from "../../store/selectors/teamMemberSelector";

export default function MassMemberCreator(): JSX.Element {

    const dispatch = useAppDispatch();
    const i18n = useTranslations();
    const projectId = useCurrentProjectId();
    const { members } = useTeamMembers();

    const [error, setError] = React.useState<boolean | string>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState<string>('');

    const isNewMember = useCallback((email: string) => {
        let isNew = true;
        members.forEach(m => {
            if (m.displayName === email) {
                isNew = false;
            }
        });
        return isNew;
    }, [members]);

    const isValidEmail = useCallback((email: string) => {
        const isValidNewMember =
            email.length > 0 && email.match(emailFormat) != null;
        return isValidNewMember;
    }, []);

    const handleSend = () => {
        let error = false;

        const emails = inputValue.split(/[,\n]+/).map(email => email.trim());

        emails.forEach(email => {
            if (!isValidEmail(email)) {
                error = true;
                setError(i18n.authentication.error.emailAddressNotValid);
            } else if (!(isNewMember(email))) {
                error = true;
                setError(i18n.team.memberAlreadyExists);
            }
        });

        if (!error && emails.length > 0) {
            setLoading(true);
            setError(false);
            for (const mail of emails) {
                dispatch(
                    API.sendInvitation({
                        projectId: projectId!,
                        recipient: mail,
                    }),
                ).then(() => {
                    dispatch(
                        addNotification({
                            status: 'OPEN',
                            type: 'INFO',
                            message: `${mail} ${i18n.team.mailInvited}`,
                        }),
                    );
                    setLoading(false);
                });
            }
        }
    }

    return (
        <OpenCloseModal
            title={i18n.team.inviteNewMember}
            collapsedChildren={
                <Button kind="outline" icon="add" size="sm">
                    {i18n.team.inviteNewMember}
                </Button>
            }
            modalBodyClassName={css({ padding: space_lg, alignItems: 'stretch' })}
            widthMax
            footer={close => (
                <Flex
                    justify="space-between"
                    align="center"
                    grow={1}
                    gap={space_md}
                    className={css({ padding: space_lg, justifyContent: 'flex-end' })}
                >
                    <Button onClick={() => {
                        setInputValue('');
                        close();
                    }}>
                        {i18n.common.close}
                    </Button>
                    <Button onClick={handleSend} isLoading={loading}>
                        {i18n.common.send}
                    </Button>
                </Flex>
            )}
        >
            {() => (
                <>
                    {i18n.team.mailInstructions}
                    <textarea
                        className={cx(inputStyle, m_md)}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="maria.meier@mail.ch,peter.huber@mail.ch"
                    />
                    {error && (
                        <div className={m_md}>{error}</div>
                    )}
                </>
            )}
        </OpenCloseModal>
    )
}

