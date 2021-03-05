/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {css, keyframes, cx} from "@emotion/css";


export const darkMode = css({
  "--bgColor": "grey",
  "--fgColor": "white",
  "--hoverColor": "hotpink",
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});


export const lightMode = css({
  "--bgColor": "white",
  "--fgColor": "#2c2c2c",
  "--hoverColor": "pink",
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});

export const fullPageStyle = cx(
  lightMode,
  css({
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }));

const pulseKeyframes = keyframes`
  0% {
   transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const pulseLinear = css`
    animation: ${pulseKeyframes} 1s linear infinite;
`;

export const pulseEase = css`
    animation: ${pulseKeyframes} 1s ease infinite;
`;


export const button = css({
  cursor: "pointer",
  ":hover": {
    backgroundColor: "var(--hoverColor)"
  }
});

export const iconButton = css({
  cursor: "pointer",
  paddingLeft: "5px",
  paddingRight: "5px",
  ":hover": {
    color: "var(--hoverColor)"
  }
});

export const disabledIconStyle = cx(iconButton, css({
  cursor: "default",
  ":hover": {
    color: "var(--fgColor)"
  }
}));