/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx, keyframes } from '@emotion/css';

export const pictoColours = css({
  '--pictoBlue': '#50BFD5', // main blue
  '--pictoOrange': '#E36D28', // main orange
  '--pictoYellow': '#FFE527', // main yellow
  '--pictoLightBlue': '#8CE9FB', // blue-yellow intersection
  '--pictoPeach': '#FCC08B', // yellow-orange intersection
  '--pictoSteelBlue': '#68A8C3', // blue-orange intersection
  '--pictoGrey': '#9AA4B1', // center colour
});

export const errorColor = '#e51c23';
export const warningColor = '#ff9800';
export const successColor = '#4caf50';

export const errorStyle = css({
  color: 'var(--warningColor)',
});

export const warningStyle = css({
  color: 'var(--warninggColor)',
});

export const successStyle = css({
  color: 'var(--successColor)',
});

export const darkModeColors = css({
  '--bgColor': '#444',
  '--fgColor': 'white',
  '--hoverBgColor': '#555',
  '--hoverFgColor': 'white',
  '--linkColor': 'white',
  '--linkHoverColor': 'white',
  '--linkHoverBgColor': '#555',
  '--focusColor': 'var(--pictoSteelBlue)',
  '--successColor': successColor,
  '--warningColor': warningColor,
  '--errorColor': errorColor,
});

export const darkMode = cx(
  darkModeColors,
  css({
    backgroundColor: 'var(--bgColor)',
    color: 'var(--fgColor)',
  }),
);

export const semiDarkModeColors = css({
  '--bgColor': '#d7d7d7',
  '--fgColor': '#333',
  '--hoverBgColor': '#FFF0',
  '--hoverFgColor': '#999',
  '--linkColor': 'var(--pictoSteelBlue)',
  '--linkHoverColor': 'var(--pictoBlue)',
  '--linkHoverBgColor': '#FFF0',
  '--focusColor': 'var(--pictoSteelBlue)',
  '--successColor': successColor,
  '--warningColor': warningColor,
  '--errorColor': errorColor,
});

export const semiDarkMode = cx(
  semiDarkModeColors,
  css({
    backgroundColor: 'var(--bgColor)',
    color: 'var(--fgColor)',
  }),
);

export const lightModeColors = css({
  '--bgColor': 'white',
  '--fgColor': '#333333',
  '--hoverBgColor': '#FFF0',
  '--hoverFgColor': '#999',
  '--linkColor': 'var(--pictoSteelBlue)',
  '--linkHoverColor': 'var(--pictoBlue)',
  '--linkHoverBgColor': '#FFF0',
  '--focusColor': 'var(--pictoSteelBlue)',
  '--successColor': successColor,
  '--warningColor': warningColor,
  '--errorColor': errorColor,
});

export const lightMode = cx(
  lightModeColors,
  css({
    backgroundColor: 'var(--bgColor)',
    color: 'var(--fgColor)',
  }),
);

export const fullPageStyle = cx(
  pictoColours,
  lightMode,
  css({
    backgroundColor: '#F6F1F1',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
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

export const inactiveButtonStyle = cx(
  buttonStyle,
  css({
    opacity: '0.5',
    cursor: 'default',
  }),
);

export const disabledIconStyle = iconStyle;

export const sideTabButton = css({
  writingMode: 'sideways-lr',
  textOrientation: 'sideways',
  width: '24px',
});

export const cardShadow = '0px 0px 7px rgba(0, 0, 0, 0.2)';

export const cardStyle = cx(
  lightMode,
  css({
    //    border: `1px solid lightgrey`,
    boxShadow: cardShadow,
    borderRadius: '5px',
    //    overflow: 'hidden',
  }),
);

const defaultContainerStyle = css({
  margin: '5px',
  padding: '10px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  border: '1 px solid lightgrey',
  boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.2)',
  borderRadius: '5px',
});

export const defaultRowContainerStyle = cx(
  defaultContainerStyle,
  css({
    flexDirection: 'row',
  }),
);

export const defaultColumnContainerStyle = cx(
  defaultContainerStyle,
  css({
    flexDirection: 'column',
  }),
);

export const mainHeaderHeight = '48px';

export const mainMenuLink = css({
  textDecoration: 'none',
  color: 'var(--linkColor)',
  textTransform: 'uppercase',
  fontSize: '12px',
  padding: '10px 20px 14px 5px',
  ':focus': {
    /*outlineStyle: 'inset',*/
  },
  ':hover': {
    backgroundColor: '#e6e6e6',
    color: 'var(--linkHoverColor)',
  },
});

export const labelStyle = css({
  fontWeight: 500,
  textTransform: 'capitalize',
});

export const textareaStyle = css({
  outline: 'none',
  border: 'solid 1px #d7d7d7',
  color: 'var(--secFgColor)',
  backgroundColor: 'var(--secBgColor)',
  borderRadius: '6px',
  boxSizing: 'border-box',
  //  margin: "2px 2px 2px 8px",
  transition: '.8s',
  padding: '0 24px',
  lineHeight: '24px',
  height: '144px',
});

export const inputStyle = css({
  outline: 'none',
  border: 'solid 1px #d7d7d7',
  color: 'var(--secFgColor)',
  backgroundColor: 'var(--secBgColor)',
  borderRadius: '6px',
  boxSizing: 'border-box',
  //  margin: "2px 2px 2px 8px",
  transition: '.8s',
  padding: '0 24px',
  lineHeight: '48px',
});

export const smallInputStyle = cx(
  inputStyle,
  css({
    padding: '0 24px',
    lineHeight: '24px',
    borderRadius: '12px',
  }),
);
