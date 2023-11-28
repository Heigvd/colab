/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import useTranslations from "../i18n/I18nContext";
import {Link, useNavigate} from "react-router-dom";
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

export default function TermsOfUseEN(): React.ReactElement {
    const i18n = useTranslations();
    const navigate = useNavigate();

    return (
        <Flex direction="column" align="stretch">
            <IconButton
                icon={'arrow_back'}
                title={i18n.common.back}
                onClick={() => {
                    navigate(-1);
                }}
                className={css({alignSelf: 'flex-start'})}
            />
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
                            <h2>Terms of use of co.LAB</h2>
                            <p>
                                Please read this Agreement carefully. It contains important terms that affect you and
                                your
                                use of the <Link to="../">co.LAB web platform</Link> (hereafter
                                “co.LAB
                                platform” or “platform”). Please note that
                                there is a separate page for our <Link to="../privacy-policy">Privacy Policy</Link>.
                            </p>
                            <p>
                                By clicking “I agree” or by installing, copying or using co.LAB platform, you agree to
                                be
                                bound both by the terms of this Agreement including the disclaimers contained herein, as
                                well as the mentioned <Link to="../privacy-policy">Privacy Policy</Link>. If you do not
                                agree to these terms, do not install,
                                copy or use co.LAB platform.
                            </p>
                            <p>
                                <a href="https://www.albasim.ch/">AlbaSim</a> is a research unit at Media Engineering
                                Institute (MEI) of <a
                                href="https://www.heig-vd.ch/">HEIG-VD</a>, <a href="https://www.hes-so.ch/">HES-SO</a>,
                                (hereafter “we” or “HEIG-VD“). This Agreement is concluded between HEIG-VD and you
                                (“you” or
                                “user”), as a user of the co.LAB platform.
                            </p></Flex>
                        <Collapsible label="Our services">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>The co.LAB platform aims at supporting collaborative work and content creation.</p>
                                <h3>Our role</h3>
                                <p>We host content and facilitate collaboration between users. We do not have an
                                    editorial
                                    role, and thus do not take any responsibility for the content created by users.</p>
                                <h3>Your responsibilities</h3>
                                <p>As a user of the platform, your responsibility includes that you will not use the
                                    platform for any illegal or unauthorised purpose, or violate any laws in your or our
                                    jurisdiction. You are solely responsible for data, text, information, links,
                                    graphics,
                                    photos, profiles, audio, video, items or other materials that you submit, post,
                                    display,
                                    or transmit through the platform. </p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Disclaimer of warranty">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>To the maximum extent permitted by applicable law and subject to the express
                                    provisions of this Agreement: </p>
                                <ol>
                                    <li>We provides the co.LAB platform “AS IS” and with all faults, and hereby disclaim
                                        all representations and warranties, either express, implied or statutory,
                                        including, but not limited to, any implied warranties of fitness for a
                                        particular purpose, of lack of viruses, of accuracy or completeness of content,
                                        and of lack of negligence or lack of workmanlike effort.
                                    </li>
                                    <li>You assume the entire risk as to the quality, use or performance of the co.LAB
                                        platform.
                                    </li>
                                    <li>We do not warrant that the co.LAB platform and content contained in its Project
                                        Models will be error-free, or that defects will be corrected.
                                    </li>
                                </ol>
                                <p>We do not guarantee that our service will meet users' needs, be safe and secure, or
                                    be error-free. By using the co.LAB platform, you agree that we have no
                                    responsibility or liability for any form of content deletion, storage failure or any
                                    other form of service interruption.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Exclusion of incidental, consequential and other damages">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>To the maximum extent permitted by applicable law, in no event shall HEIG-VD be
                                    liable for:</p>
                                <ol>
                                    <li>Any special, incidental, indirect, or consequential damages whatsoever.</li>
                                    <li>Any direct or indirect damages for loss of profits or confidential or other
                                        information, business interruption, personal injury, loss of privacy, failure to
                                        meet any duty including of good faith or reasonable care or negligence.
                                    </li>
                                    <li>Any other pecuniary or other loss whatsoever, arising out of or in any way
                                        related to the use of or inability to use the co.LAB platform, or otherwise
                                        under or in connection with any provision of this Agreement, even in the event
                                        of default, tort (including negligence), strict liability, breach of contract or
                                        breach of warranty, even if HEIG-VD has been advised of the possibility of such
                                        damages.
                                    </li>
                                </ol>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Limitation of liability and remedies">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>
                                    Notwithstanding any damages that you might incur for any reason whatsoever
                                    (including, without limitation, all damages referenced above and all other direct or
                                    indirect damages), the entire liability of HEIG-VD under or in connection with any
                                    provision of this Agreement and your exclusive remedy for all of the foregoing shall
                                    be limited to the greater of the amount actually paid by you for the use of the
                                    co.LAB platform. The foregoing limitations, exclusions and disclaimers shall apply
                                    to the maximum extent permitted by applicable law, even if any remedy fails its
                                    essential purpose.
                                </p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Termination">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>HEIG-VD may terminate this Agreement at any time if you act in any way in breach of
                                    this Agreement. In the event of the termination of this Agreement, articles about
                                    Disclaimers of Warranty, Collection of traces and privacy, Exclusion of incidental,
                                    consequential and other damages, Limitation of Liability and Remedies, Governing Law
                                    and Jurisdiction and General provisions will survive any such termination.</p>
                                <p>Otherwise the agreement can be terminated within 3 months from written notice sent by
                                    one party to another.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Governing law and jurisdiction">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>This Agreement is governed by the laws of Switzerland, without regard to any conflict
                                    of law principles to the contrary. Any action arising out of or in connection with
                                    the use of co.LAB platform, whether in tort or in contract, shall be submitted to
                                    the exclusive jurisdiction of the competent courts in Yverdon-les-Bains,
                                    Switzerland.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="General provisions">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>If any provision of this Agreement is held by a court of competent jurisdiction to be
                                    invalid, illegal or unenforceable, the remainder of this Agreement will remain in
                                    full force and effect. The headings of articles of this Agreement are for
                                    convenience of reference only and are not intended to restrict, affect or be of any
                                    weight in the interpretation or construction of the provisions of such articles. You
                                    may not assign this Agreement or any of your rights under this Agreement without the
                                    prior written consent of HEIG-VD, and any attempted assignment without such consent
                                    shall be void. This Agreement sets forth our entire agreement with respect to co.LAB
                                    platform and supersedes all prior and contemporaneous understandings and agreements
                                    whether written or oral. No amendment, modification or waiver of any of the
                                    provisions of the Agreement will be valid unless set forth in a written instrument
                                    signed by the party to be bound thereby.</p>
                            </Flex>
                        </Collapsible>
                        <Collapsible label="Successor agreements">
                            <Flex direction="column" gap={space_sm} className={m_md}>
                                <p>This Agreement may be amended in the future with publication of the revised version
                                    on the co.LAB platform. We may provide any other form of notification, which we may
                                    choose in our sole discretion. Upon notification of changes to this Agreement, you
                                    will be considered to have accepted such revised version unless and until we receive
                                    written notification from you that you have deleted your account on the co.LAB
                                    platform and deleted any copy of the code on your computer.</p>
                            </Flex>
                        </Collapsible>
                    </div>
                </Flex>
            </Flex>
        </Flex>
    )
}