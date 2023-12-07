/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import useTranslations from "../i18n/I18nContext";
import {Link, useLocation, useNavigate} from "react-router-dom";
import React from "react";
import Flex from "./common/layout/Flex";
import IconButton from "./common/element/IconButton";
import {css} from "@emotion/css";
import {m_md, space_lg, space_md, space_sm} from "../styling/style";
import Logo from "../styling/Logo";
import Collapsible from "./common/layout/Collapsible";

/*********************************************************
 *
 *  If modified, update TosAndDataPolicy.java timestamp!
 *
 *********************************************************/

export default function DataPolicyEN(): React.ReactElement {
    const i18n = useTranslations();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Flex direction="column" align="stretch">
            {!(location.key === 'default') && (
                <IconButton
                    icon={'arrow_back'}
                    title={i18n.common.back}
                    onClick={() => {
                        navigate(-1);
                    }}
                    className={css({alignSelf: 'flex-start'})}
                />
            )}
            <Flex direction="column" align="center">
                <Logo
                    className={css({
                        width: '25vw',
                        minWidth: '200px',
                        padding: space_lg,
                        alignSelf: 'center',
                        marginBottom: space_lg,
                    })}
                />
                <Flex direction="column" gap={space_lg} className={css({maxWidth: '800px', width: '100%'})}>
                    <div>
                        <Flex direction="column" gap={space_sm} className={css({marginBottom: space_md})}>
                            <p>This policy contains important terms that affect you and your use of the <Link to="../">co.LAB
                                web
                                platform</Link> (hereafter “co.LAB platform”), including any project provided by the
                                co.LAB
                                platform (hereafter “Embedded Projects”). Please note that there is a separate page for
                                our <Link to="../terms-of-use">general terms of use</Link>.</p>
                        </Flex>
                        <Collapsible label="Who is responsible for your data?">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>The data processor is the <a href="https://www.albasim.ch/">AlbaSim group</a> of <a
                                    href="https://www.heig-vd.ch/">HEIG-VD</a>, <a
                                    href="https://www.hes-so.ch/">HES-SO</a>, Yverdon-les-Bains,
                                    Switzerland (hereafter "we" or “HEIG-VD”).</p><p>The AlbaSim group is represented by
                                <a href="https://www.albasim.ch/en/team/jaccard/"> Prof. Dominique Jaccard</a>.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="What data is collected and for what purposes?">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>
                                    Firstly, as a unit belonging to a public institution, and being financed by public
                                    funds, we commit ourselves never to use your data for commercial purposes nor to
                                    transfer them to a third party who might do so.
                                </p>
                                <p>We store and collect three types of data on you as a user of the co.LAB platform:</p>
                                <ol>
                                    <li><strong>Your user account with the following personal data: first name, last
                                        name,
                                        email
                                        address.</strong>
                                        <p>This data enables team members to collaborate and communicate.
                                            HEIG-VD may also exceptionally use your email address to contact you for
                                            administrative or research purposes.
                                        </p>
                                    </li>
                                    <br/>
                                    <li><strong>Anonymized traces of your actions inside the co.LAB platform.</strong>
                                        <p>Your actions on the co.LAB platform may be recorded as anonymous traces for
                                            the following reasons:</p>
                                        <ul>
                                            <li>For research activities.</li>
                                            <li>For improving the co.LAB platform itself.</li>
                                        </ul>
                                    </li>
                                    <br/>
                                    <li><strong>Temporary data (cookies and site storage) for managing your preferences
                                        and
                                        login status.</strong>
                                        <p>These are pieces of temporary information, which are stored inside your
                                            browser and are deleted when you log out of the co.LAB platform. Site
                                            storage records contain user preferences (such as the language chosen for
                                            the user interface) and items required for pushing updated information to
                                            you when you are on the co.LAB platform. You can delete all this data
                                            whenever you want. To this end, open the "options" or "settings" page of
                                            your browser and look for items such as "privacy" and "security".</p>
                                    </li>
                                </ol>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Who has access to your data?">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>A small number of well-identified persons (such as members of your project team as
                                    well as HEIG-VD, as administrators of the co.LAB platform) have access to your data.
                                    Other interested parties may receive anonymized versions of this data (anonymous
                                    activity traces), e.g. in scientific publications.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="For how long do we keep your data?">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>Personal data will not be stored for more than 10 years after the last login by the
                                    user. Anonymous trace data (“usage logs”) are not affected by this deletion.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="How do we protect your data?">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>All our servers are physically located in Switzerland in a data centre compliant with
                                    the <a href="https://en.wikipedia.org/wiki/General_Data_Protection_Regulation">EU
                                        GDPR regulation</a> and having certifications such as ISO27001.</p><p>All
                                communications are encrypted with SSH, SSL or similar technologies designed to ensure
                                confidentiality.</p><p>Your activity traces are anonymized to guarantee that one cannot
                                identify you on the basis of these traces.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Your rights">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>According to current regulations, you have various rights, which you can exert by
                                    getting in touch with us through <a href="https://www.albasim.ch/en/2693-2/">this
                                        contact form</a>. You are entitled to:</p>
                                <ul>
                                    <li>receive a copy of your data in a textual format;</li>
                                    <li>have your data corrected;</li>
                                    <li>have your data deleted;</li>
                                    <li>have your user account deleted;</li>
                                    <li>oppose to profiling on the co.Lab platform;</li>
                                    <li>withdraw your consent at any time</li>
                                </ul>
                            </Flex>
                        </Collapsible>
                    </div>
                </Flex>
            </Flex>
        </Flex>
    )
}