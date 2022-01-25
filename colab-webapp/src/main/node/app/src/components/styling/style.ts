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
  color: 'var(--warningColor)',
});

export const successStyle = css({
  color: 'var(--successColor)',
});

export const lightTheme = cx(
  pictoColours,
  css({
    '--primaryColor': '#333',
    '--primaryColorShade': '#494949',
    '--primaryColorContrast': '#fff',
    '--primaryColorContrastShade': '#FCF9F9',

    '--secondaryColor': 'var(--pictoSteelBlue)',
    '--secondaryColorShade': 'var(--pictoBlue)',
    '--secondaryColorContrast': '#FFF',
    '--secondaryColorContrastShade': '#FFF',

    '--lightDisabledGrey': '#aaa',
    '--darkDisabledGrey': '#444',
    '--themeSuccessColor': successColor,
    '--themeWarningColor': warningColor,
    '--themeErrorColor': errorColor,
  }),
);

export const normalThemeMode = css({
  '--bgColor': 'var(--primaryColorContrast)',
  '--hoverBgColor': 'var(--primaryColorContrastShade)',
  '--fgColor': 'var(--primaryColor)',
  '--hoverFgColor': 'var(--primaryColorShade)',

  '--linkColor': 'var(--secondaryColor)',
  '--linkHoverColor': 'var(--secondaryColorShade)',
  '--linkBgColor': 'var(--secondaryColorContrast)',
  '--linkHoverBgColor': 'var(--secondaryColorContrastShade)',

  '--disabledGrey': 'var(--lightDisabledGrey)',
  '--focusColor': 'var(--secondaryColor)',
  '--successColor': 'var(--themeSuccessColor)',
  '--warningColor': 'var(--themeWarningColor)',
  '--errorColor': 'var(--themeErrorColor)',

  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
  'h1, h2, h3, h4': {
    margin: '0 0 5px 0',
  },
  h1: {
    fontSize: '1.5rem',
  },
  h2: {
    fontSize: '1.2rem',
  },
  'h3, h4': {
    fontSize: '1rem',
  },
});

export const invertedThemeMode = cx(
  normalThemeMode,
  css({
    '--bgColor': 'var(--primaryColor)',
    '--hoverBgColor': 'var(--primaryColorShade)',
    '--fgColor': 'var(--primaryColorContrast)',
    '--hoverFgColor': 'var(--primaryColorContrastShade)',

    '--linkBgColor': 'var(--primaryColor)',
    '--linkHoverBgColor': 'var(--primaryColorShade)',
    '--linkColor': 'var(--primaryColorContrast)',
    '--linkHoverColor': 'var(--primaryColorContrastShade)',

    '--disabledGrey': 'var(--darkDisabledGrey)',
  }),
);

export const shadedThemeMode = cx(
  normalThemeMode,
  css({
    '--bgColor': 'var(--primaryColorShade)',
    '--hoverBgColor': 'var(--primaryColor)',
    '--fgColor': 'var(--primaryColorContrastShade)',
    '--hoverFgColor': 'var(--primaryColorContrast)',
  }),
);

export const borderRadius = '5px';
export const boxShadow = '0px 0px 20px 0px rgba(0,0,0,0.3)';
export const space_S = '5px';
export const space_M = '15px';
export const space_L = '1.5rem';
export const flex = css({ display: 'flex' });

type blockSide = 1 | 2 | 3 | 4;
const blockMargin = {
  1: 'margin-top',
  2: 'margin-right',
  3: 'margin-bottom',
  4: 'margin-left',
};

export function marginAroundStyle(marginPos: blockSide[], marginSize: string) {
  return css`
    ${marginPos.map(pos => `${blockMargin[pos]}: ${marginSize};`).join('\n')}
  `;
}

const blockPadding = {
  1: 'padding-top',
  2: 'padding-right',
  3: 'padding-bottom',
  4: 'padding-left',
};
export function paddingAroundStyle(paddingPos: blockSide[], paddingSize: string) {
  return css`
    ${paddingPos.map(pos => `${blockPadding[pos]}: ${paddingSize};`).join('\n')}
  `;
}

export const fullPageStyle = cx(
  normalThemeMode,
  css({
    backgroundColor: 'var(--primaryColorContrastShade)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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

/**BUTTONS */

export const linkStyle = css({
  cursor: 'pointer',
  color: 'inherit',
  ':hover': {
    color: 'var(--hoverFgColor)',
    textDecoration: 'underline',
  },
  ':focus': {
    outline: 'none',
  },
  ':focus-visible': {
    outline: '1px solid blue',
  },
});

export const noOutlineStyle = css({
  verticalAlign: 'center',
  '&:focus': {
    outline: 'none',
  },
  '&:focus-visible': {
    outline: '1px solid blue',
  },
});

export const iconStyle = css({
  paddingLeft: '5px',
  paddingRight: '5px',
});

export const iconButton = cx(
  iconStyle,
  css({
    cursor: 'pointer',
    ':hover': {
      color: 'var(--hoverFgColor)',
    },
  }),
);

export const buttonStyle = cx(
  linkStyle,
  invertedThemeMode,
  css({
    padding: '8px 14px',
    borderRadius: borderRadius,
    ':hover': {
      backgroundColor: 'var(--hoverBgColor)',
      textDecoration: 'none',
    },
  }),
);

export const inactiveButtonStyle = cx(
  buttonStyle,
  css({
    opacity: '0.5',
    cursor: 'default',
  }),
);

export const invertedButtonStyle = cx(
  css({
    backgroundColor: 'transparent',
    border: '1px solid var(--primaryColor)',
    color: 'var(--primaryColor)',
    padding: '8px 14px',
    borderRadius: borderRadius,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--hoverBgColor)',
    },
    ':focus': {
      outline: 'none',
    },
    ':focus-visible': {
      outline: '1px solid blue',
    },
  }),
);

export const inactiveInvertedButtonStyle = cx(
  invertedButtonStyle,
  css({
    opacity: '0.5',
    cursor: 'default',
  }),
);

export const sideTabButton = css({
  writingMode: 'sideways-lr',
  textOrientation: 'sideways',
  width: '24px',
});

export const fixedButtonStyle = css({
  position: 'fixed',
  bottom: '2rem',
  right: '4vw',
  boxShadow: boxShadow,
});

export const lightIconButtonStyle = css({
  color: 'var(--disabledGrey)',
  '&:hover': {
    color: 'var(--hoverFgColor)',
  },
});
export const greyIconButtonChipStyle = cx(
  lightIconButtonStyle,
  css({
    padding: space_S,
    height: '20px',
    width: '20px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    border: '1px solid var(--disabledGrey)',
    '&:hover': {
      border: '1px solid var(--hoverFgColor)',
    },
  }),
);

export const cardShadow = '0px 0px 7px rgba(0, 0, 0, 0.2)';
export const cardShadowHover = '0px 0px 9px rgba(0, 0, 0, 0.2)';

export const cardStyle = cx(
  normalThemeMode,
  css({
    boxShadow: cardShadow,
    borderRadius: '5px',
    '&:hover': {
      boxShadow: cardShadowHover,
    },
  }),
);

export const paddedContainerStyle = css({
  padding: '10px',
});

const defaultContainerStyle = cx(
  paddedContainerStyle,
  css({
    margin: '5px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    border: '1 px solid lightgrey',
    boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.2)',
    borderRadius: '5px',
  }),
);

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

export const mainHeaderHeight = '50px';

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
  transition: '.8s',
  padding: '0 15px',
  lineHeight: '1.6em',
  height: '100px',
  fontFamily: 'inherit',
});
export const invisibleTextareaStyle = cx(
  textareaStyle,
  css({
    border: 'none',
    padding: 0,
    lineHeight: '120%',
    fontSize: 'inherit',
    '&:focus': { outline: 'none' },
  }),
);

export const inputStyle = css({
  outline: 'none',
  border: 'solid 1px #d7d7d7',
  color: 'var(--secFgColor)',
  backgroundColor: 'var(--secBgColor)',
  borderRadius: '6px',
  boxSizing: 'border-box',
  transition: '.8s',
  padding: '0 24px',
  lineHeight: '2.5em',
  fontFamily: 'inherit',
});
export const invisibleInputStyle = cx(
  inputStyle,
  css({
    border: 'none',
    padding: 0,
    lineHeight: '120%',
    fontSize: 'inherit',
    '&:focus': { outline: 'none' },
    width: 'fit-content',
  }),
);

export const smallInputStyle = cx(
  inputStyle,
  css({
    padding: '0 24px',
    lineHeight: '24px',
    borderRadius: '12px',
  }),
);

export const cardTitle = css({
  fontSize: '1.2em',
  fontWeight: 'bold',
});
