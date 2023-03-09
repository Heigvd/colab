/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { lightTextStyle, text_xs } from '../../styling/style';
import Flex from '../layout/Flex';

export default function ErrorPage(): JSX.Element {
    return(
        <Flex align='center' justify='center' direction='column' className={css({minHeight: '100vh'})}>
            <p className={cx(text_xs, lightTextStyle)}>Oupsi</p>
            <h1>404</h1>
            <p>Page not found</p>
        </Flex>
    )
}