/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';


const materialBaseStyle = css({
    fontFamily: 'Material Symbols Outlined',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: '24px',  /* Preferred icon size */
    display: 'inline-block',
    lineHeight: 1,
    textTransform: 'none',
    letterSpacing: 'normal',
    wordWrap: 'normal',
    whiteSpace: 'nowrap',
    direction: 'ltr',
});
interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    icon: string;
    className?: string;
}
export default function Icon(props: IconProps): JSX.Element {
  return (
    <span {...props} className={materialBaseStyle}>
       {props.icon}
    </span>
  );
}
