/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, keyframes, cx } from '@emotion/css';

export const pictoColours = css({
  '--pictoBlue': '#50BFD5', // main blue
  '--pictoOrange': '#E36D28', // main orange
  '--pictoYellow': '#FFE527', // main yellow
  '--pictoLightBlue': '#8CE9FB', // blue-yellow intersection
  '--pictoPeach': '#FCC08B', // yellow-orange intersection
  '--pictoSteelBlue': '#68A8C3', // blue-orange intersection
  '--pictoGrey': '#9AA4B1', // center colour
});

export const darkMode = css({
  '--bgColor': '#444',
  '--fgColor': 'white',
  '--hoverBgColor': '#555',
  '--hoverFgColor': 'white',
  '--linkColor': 'white',
  '--linkHoverColor': 'white',
  '--linkHoverBgColor': '#555',
  '--focusColor': 'var(--pictoSteelBlue)',
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});

export const semiDarkMode = css({
  '--bgColor': '#d7d7d7',
  '--fgColor': '#333',
  '--hoverBgColor': '#FFF0',
  '--hoverFgColor': '#999',
  '--linkColor': 'var(--pictoSteelBlue)',
  '--linkHoverColor': 'var(--pictoBlue)',
  '--linkHoverBgColor': '#FFF0',
  '--focusColor': 'var(--pictoSteelBlue)',
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});

export const lightMode = css({
  '--bgColor': 'white',
  '--fgColor': '#333333',
  '--hoverBgColor': '#FFF0',
  '--hoverFgColor': '#999',
  '--linkColor': 'var(--pictoSteelBlue)',
  '--linkHoverColor': 'var(--pictoBlue)',
  '--linkHoverBgColor': '#FFF0',
  '--focusColor': 'var(--pictoSteelBlue)',
  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
});

export const fullPageStyle = cx(
  pictoColours,
  lightMode,
  css({
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 999,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    '& :focus': {
      outline: 'var(--focusColor) auto 1px',
    },
  }),
);

export const fullPageOverlayStyle = cx(
  fullPageStyle,
  css({
    backgroundColor: '#dfdfdfdf',
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
  animation: ${pulseKeyframes} 3s linear 10;
`;

export const pulseEase = css`
  animation: ${pulseKeyframes} 2s ease 10;
`;

export const linkStyle = css({
  cursor: 'pointer',
  ':hover': {
    color: 'var(--hoverFgColor)',
    backgroundColor: 'var(--hoverBgColor)',
  },
});

export const iconStyle = css({
  paddingLeft: '5px',
  paddingRight: '5px',
});

export const iconButton = cx(linkStyle, iconStyle);

export const buttonStyle = cx(
  linkStyle,
  darkMode,
  css({
    padding: '5px',
  }),
);

export const disabledIconStyle = iconStyle;
