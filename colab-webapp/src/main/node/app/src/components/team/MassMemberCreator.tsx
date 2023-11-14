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
import Flex from "../common/layout/Flex";
import { inputStyle } from "../common/element/Input";
import * as API from '../../API/api';
import { useCurrentProjectId } from "../../store/selectors/projectSelector";
import OpenCloseModal from "../common/layout/OpenCloseModal";
import Button from "../common/element/Button";
import { m_md, space_lg, space_md, space_xs, warningTextStyle } from "../../styling/style";
import { css, cx } from "@emotion/css";

const textareaStyle = css({
    margin: 0,
    minHeight: '150px',
    height: '200px',
    resize: 'vertical',
})

export default function MassMemberCreator(): JSX.Element {

    const dispatch = useAppDispatch();
    const i18n = useTranslations();
    const projectId = useCurrentProjectId();

    const [error, setError] = React.useState<boolean | string>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [invalidEmails, setInvalidEmails] = React.useState<string[]>([]);

    const isValidEmail = useCallback((email: string) => {
        const isValidNewMember =
            email.length > 0 && email.match(emailFormat) != null;
        return isValidNewMember;
    }, []);

    const validateEmails = useCallback((emails: string[]): boolean => {
        let error = false;

        emails.forEach(email => {
            if (!isValidEmail(email)) {
                error = true;
                setError(i18n.team.mailInvalid);
                setInvalidEmails(current => [...current, email]);
            }
        });

        return error;
    }, [i18n.team.mailInvalid, isValidEmail]);

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
            heightMax
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
                        setError(false);
                        close();
                    }}>
                        {i18n.common.close}
                    </Button>
                    <Button onClick={() => {
                        setInvalidEmails([]);
                        const emails = inputValue.split(/[,\n;]+/).map(email => email.trim()).filter(email => email !== '');

                        if (!validateEmails(emails) && emails.length > 0) {
                            setLoading(true);
                            setError(false);
                            for (const mail of emails) {
                                dispatch(
                                    API.sendInvitation({
                                        projectId: projectId!,
                                        recipient: mail,
                                    }),
                                )
                            }
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
                    <div className={m_md}>{i18n.team.mailInstructions}</div>
                    <textarea
                        className={cx(inputStyle, m_md, textareaStyle)}
                        value={inputValue}
                        onChange={e => (setInputValue(e.target.value))}
                        placeholder="maria.meier@mail.ch,peter.huber@mail.ch"
                    />
                    {error && (
                        <>
                            <div className={cx(m_md, warningTextStyle)}>{error} :</div>
                            <ul className={css({ margin: 0 })}>
                                {invalidEmails && invalidEmails.map((mail, i) => (
                                    <li className={css({ marginLeft: space_xs, padding: 0 })} key={i}>{mail}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </OpenCloseModal>
    )
}

