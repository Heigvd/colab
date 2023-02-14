/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { injectGlobal } from '@emotion/css';
import { heading, text } from './theme';

injectGlobal`
    * {
        box-sizing: border-box;
        font-size: ${text.sm};
        line-height: ${text.lineHeight};
        font-weight: ${text.regular};
        color: 'var(--text-primary)';
    }
    h1, h2, h3, h4, h5, h6 {
        font-weight: ${heading.weight};
        line-height: ${heading.lineHeight};
    }
    h1 {
        font-size: ${heading.xl};
    }
    h2 {
        font-size: ${heading.lg};
    }
    h3 {
        font-size: ${heading.md};
    }
    h4 {
        font-size: ${heading.sm};
    }
    h5 {
        font-size: ${heading.xs};
    }
`;
