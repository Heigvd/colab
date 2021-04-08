/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, keyframes, cx } from '@emotion/css';

export const darkMode = css({
  '--bgColor': '#444',
  '--fgColor': 'white',
  '--hoverBgColor': '#555',
  '--hoverFgColor': 'white',
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});

export const lightMode = css({
  '--bgColor': 'white',
  '--fgColor': '#333333',
  '--hoverBgColor': 'white',
  '--hoverFgColor': '#999',
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
    left: 0,
  }),
);

const pulseKeyframes = keyframes`
  0% {
   transform: rotate(0deg);
  }
  33% {
    transform: rotate(240deg);
  }
  66% {
    transform: rotate(480deg);
  }
  100% {
    transform: rotate(720deg);
  }
`;

export const pulseLinear = css`
  animation: ${pulseKeyframes} 3s linear infinite;
`;

export const pulseEase = css`
  animation: ${pulseKeyframes} 2s ease infinite;
`;

export const buttonStyle = css({
  cursor: 'pointer',
  ':hover': {
    color: 'var(--hoverFgColor)',
    backgroundColor: 'var(--hoverBgColor)',
  },
});

const icon = css({
  paddingLeft: '5px',
  paddingRight: '5px',
});

export const iconButton = cx(buttonStyle, icon);

export const disabledIconStyle = icon;
