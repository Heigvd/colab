/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {css, cx} from '@emotion/css';
import * as React from 'react';
import Logo from '../../styling/Logo';
import Flex from '../common/layout/Flex';
import Monkeys from '../debugger/monkey/Monkeys';
import {m_md} from "../../styling/style";
import {Link} from "react-router-dom";

interface PublicEntranceContainerProps {
    children: React.ReactNode;
}

export default function PublicEntranceContainer({
                                                    children,
                                                }: PublicEntranceContainerProps): JSX.Element {
    return (
        <>
            <Flex
                direction="column"
                align="center"
                justify="center"
                className={cx(
                    css({
                        margin: 'auto'
                    }),
                )}
            >
                <Flex align="center">
                    <a
                        onClick={() => window.open(`#/about-colab`, '_blank')}
                        className={css({'&:hover': {cursor: 'pointer'}})}
                    >
                        <Logo
                            className={css({
                                height: '110px',
                                width: '200px',
                                margin: '10px',
                            })}
                        />
                    </a>
                </Flex>
                <Monkeys/>
                <Flex
                    direction="column"
                    align="center"
                    className={css({
                        padding: '10px',
                    })}
                >
                    {children}
                </Flex>
            </Flex>
            <Flex align="center" justify="center" className={m_md}>
                <i>The use of this service implies that you agree to <Link to="../terms-of-use" target="_blank">the
                    general terms of use</Link> and <Link to="../data-policy" target="_blank">the
                    data management
                    policy</Link>.</i>
            </Flex>
        </>
    );
}
