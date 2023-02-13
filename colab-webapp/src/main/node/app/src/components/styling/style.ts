/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx, keyframes } from '@emotion/css';
//import '../../fonts/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2';
//import '../../fonts/PublicSans[wght].ttf';

export const errorColor = '#e51c23';
export const warningColor = '#ff9800';
export const successColor = '#4caf50';
export const primaryColor = '#333';
export const secondaryColor = '#50BFD5';

export const errorStyle = css({
  color: 'var(--warningColor)',
});

export const warningStyle = css({
  color: 'var(--warningColor)',
});

export const successStyle = css({
  color: 'var(--successColor)',
});

export const normalThemeMode = css({
  '--bgColor': 'var(--primaryColorContrast)',
  '--hoverBgColor': 'var(--primaryColorContrastShade)',
  '--fgColor': 'var(--primaryColor)',
  '--hoverFgColor': 'var(--primaryColorShade)',

  '--linkColor': 'var(--secondaryColor)',
  '--linkHoverColor': 'var(--secondaryColorShade)',
  '--linkBgColor': 'var(--secondaryColorContrast)',
  '--linkHoverBgColor': 'var(--secondaryColorContrastShade)',

  '--lighterGray': 'var(--superLightGray)',
  '--darkGray': 'var(--darkDisabledGray)',
  '--lightGray': 'var(--lightDisabledGray)',
  '--focusColor': 'var(--secondaryColor)',
  '--successColor': 'var(--themeSuccessColor)',
  '--warningColor': 'var(--themeWarningColor)',
  '--errorColor': 'var(--themeErrorColor)',

  backgroundColor: 'var(--bgColor)',
  color: 'var(--fgColor)',
  p: {
    margin: '0 0 5px 0',
  },
  'h1, h2, h3, h4': {
    margin: '0 0 0 0',
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

    '--superLightGray': 'rgb(15, 15, 15)',
    '--darkGray': 'var(--lightDisabledGray)',
    '--lightGray': 'var(--darkDisabledGray)',
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
export const smallFontSize = '0.85rem';
export const textSmall = css({ fontSize: smallFontSize });

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

const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

export const spinningStyle = css({
  animation: `${spinning} 1s linear 0s infinite`,
});

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

export const lightLinkStyle = cx(
  linkStyle,
  css({
    color: 'var(--darkGray)',
    textDecoration: 'none',
  }),
);

export const iconStyle = css({
  paddingLeft: '5px',
  paddingRight: '5px',
});

export const iconButton = cx(
  iconStyle,
  css({
    cursor: 'pointer',
    ':hover': {
      color: 'var(--darkGray)',
    },
  }),
);

export const buttonStyle = cx(
  linkStyle,
  invertedThemeMode,
  css({
    display: 'inline-block',
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
  top: '3rem',
  right: '1rem',
});

export const lightIconButtonStyle = css({
  color: 'var(--darkGray)',
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
    border: '1px solid var(--darkGray)',
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

export function rootViewCardsStyle(depth: number, inRootView: boolean) {
  if (inRootView) {
    if (depth === 1) {
      return css`
        min-width: fit-content;
      `;
    }
    if (depth === 0) {
      return css`
        width: calc(50% - 20px);
        max-width: 150px;
      `;
    }
  } else {
    if (depth === 2) {
      return css`
        flex-grow: 1;
      `;
    }
    if (depth === 1) {
      return css`
        width: calc(33.3% - 20px);
      `;
    }
    if (depth === 0) {
      return css`
        width: auto;
        flex-grow: 1;
      `;
    }
  }
}

export const paddedContainerStyle = css({
  padding: space_M,
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

export const modelBGColor = css({
  backgroundColor: '#EEF9FC',
});

export const mainHeaderHeight = '50px';

export const fullHeightStyle = css({
  height: '100%',
});

export const labelStyle = css({
  fontWeight: 500,
});

export const textareaStyle = css({
  outline: 'none',
  border: 'solid 1px #d7d7d7',
  color: 'var(--secFgColor)',
  backgroundColor: 'var(--secBgColor)',
  borderRadius: '6px',
  boxSizing: 'border-box',
  transition: '.8s',
  padding: space_S + ' ' + space_M,
  lineHeight: '1.6em',
  height: '100px',
  fontFamily: 'inherit',
  fontSize: smallFontSize,
  maxWidth: '100%',
  '&:focus': { border: 'solid 1px var(--darkGray)', outline: 'solid 1px var(--darkGray)' },
  '&:hover': { border: 'solid 1px var(--darkGray)' },
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
  border: 'solid 1px var(--lightGray)',
  color: 'var(--secFgColor)',
  backgroundColor: 'var(--secBgColor)',
  borderRadius: '6px',
  boxSizing: 'border-box',
  transition: '.2s',
  padding: '0 ' + space_M,
  lineHeight: '2.5em',
  fontFamily: 'inherit',
  fontSize: smallFontSize,
  '&:focus': { border: 'solid 1px var(--darkGray)', outline: 'solid 1px var(--darkGray)' },
  '&:hover': { border: 'solid 1px var(--darkGray)' },
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

export const localTitleStyle = css({
  fontSize: '1.1em',
  fontWeight: 'bold',
});

export const variantTitle = css({
  fontSize: 'inherit',
  color: 'var(--darkGray)',
});

export const workInProgressStyle = cx(
  css({
    border: '2px solid hotpink',
    boxShadow: '0px 0px 25px 7px greenyellow',
  }),
);

export const editableBlockStyle = css({
  border: '1px solid var(--superLightGray)',
  margin: '3px 0',
  padding: space_S,
  borderRadius: borderRadius,
  '&:hover': {
    cursor: 'pointer',
    border: '1px solid var(--lightGray)',
  },
});

export const lightItalicText = css({
  color: 'var(--darkGray)',
  fontStyle: 'italic',
});
export const lightText = css({
  color: 'var(--darkGray)',
});

export const multiLineEllipsis = css({
  display: '-webkit-box',
  WebkitLineClamp: '2',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
export const oneLineEllipsis = css({
  display: '-webkit-box',
  WebkitLineClamp: '1',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
export const ellipsis = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const voidStyle = css({
  minHeight: '150px',
  background:
    'repeating-Linear-gradient(45deg,transparent,transparent 5px,#e4e4e4 5px,#e4e4e4 10px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: space_L,
});

export const selectCreatorStyle = css({
  paddingTop: space_M,
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'var(--darkGray)',
});

export const disabledStyle = css({
  opacity: 0.5,
  pointerEvents: 'none',
});


// new UI
const basics = css({
  '--white': '#FFF', 
  '--black': '#000', 
  '--transparent': 'transparent', 
});
const primary = css({
  '--primary-50': '#E6FFFA', 
  '--primary-100': '#B2F5EA', 
  '--primary-300': '#4FD1C5', 
  '--primary-400': '#38B2AC', 
  '--primary-500': '#2C7A7B', 
  '--primary-700': '#285E61', 
});
const gray = css({
  '--gray-50': '#F7FAFC', 
  '--gray-100': '#EDF2F7', 
  '--gray-200': '#DDE4EE', 
  '--gray-300': '#C8CEDA', 
  '--gray-400': '#A0A2AB', 
  '--gray-500': '#787C87', 
  '--gray-600': '#43444B', 
  '--gray-700': '#28292D', 
});
const blackAlpha = css({
  '--blackAlpha-50': '#000000a', 
  '--blackAlpha-100': '#000000f', 
  '--blackAlpha-200': '#00000014', 
  '--blackAlpha-300': '#00000029', 
  '--blackAlpha-400': '#0000003D', 
  '--blackAlpha-500': '#0000005C', 
  '--blackAlpha-600': '#0000007A', 
  '--blackAlpha-700': '#000000A3', 
  '--blackAlpha-800': '#000000CC', 
  '--blackAlpha-900': '#000000EB', 
});
const whiteAlpha = css({
  '--whiteAlpha-50': '#FFFFFFA', 
  '--whiteAlpha-100': '#FFFFFFF', 
  '--whiteAlpha-200': '#FFFFFF14', 
  '--whiteAlpha-300': '#FFFFFF29', 
  '--whiteAlpha-400': '#FFFFFF3D', 
  '--whiteAlpha-500': '#FFFFFF5C', 
  '--whiteAlpha-600': '#FFFFFF7A', 
  '--whiteAlpha-700': '#FFFFFFA3', 
  '--whiteAlpha-800': '#FFFFFFCC', 
  '--whiteAlpha-900': '#FFFFFFEB', 
});
const green = css({
  '--green-100': '#C2F0D8', 
  '--green-200': '#99E6BD', 
  '--green-400': '#47D189', 
  '--green-500': '#2EB86F', 
  '--green-600': '#238F56', 
  '--green-700': '#19663E', 
});
const red = css({
  '--red-100': '#FED7D7', 
  '--red-400': '#EA6262', 
  '--red-500': '#E53E3E', 
  '--red-600': '#C53030', 
  '--red-700': '#9B2C2C', 
});
const orange = css({
  '--orange-100': '#FEEBC8', 
  '--orange-400': '#E68D52', 
  '--orange-500': '#DD6B20', 
  '--orange-600': '#C05621', 
  '--orange-700': '#9C4221', 
});
const blue = css({
  '--blue-100': '#BEE3F8', 
  '--blue-400': '#5F9ED9', 
  '--blue-500': '#3182CE', 
  '--blue-600': '#2B6CB0', 
  '--blue-700': '#2C5282', 
});
const otherColors = css({
  '--cyan-400': '#0BC5EA', 
  '--purple-400': '#9F7AEA', 
  '--pink-400': '#ED64A6', 
  '--teal-400': '#38B2AC', 
  '--yellow-400': '#ECC94B', 
});

export const colabTheme = cx(
  basics,
  primary,
  gray,
  blackAlpha,
  whiteAlpha,
  green,
  red,
  orange,
  blue,
  otherColors
);

export const lightMode = css({
  //TEXT
  '--text-primary': 'var(--gray-700)',
  '--text-secondary': 'var(--gray-400)',
  '--text-disabled': 'var(--gray-200)',
//BACKGROUND
  '--bg-primary': 'var(--white)',
  '--bg-secondary': 'var(--gray-50)',
  '--bg-tertiary': 'var(--bg-100)',
//PRIMARY
  '--primary-main': 'var(--primary-400)',
  '--primary-fade': 'var(--primary-50)',
  '--primary-dark': 'var(--primary-500)',
  '--primary-darker': 'var(--primary-700)',
  '--primary-contrast': 'var(--white)',
//SECONDARY
'--secondary-main': 'var(--gray-400)',
'--secondary-fade': 'var(--gray-50)',
'--secondary-dark': 'var(--gray-500)',
'--secondary-darker': 'var(--gray-700)',
'--secondary-contrast': 'var(--white)',
//ERROR
'--error-main': 'var(--red-500)',
'--error-fade': 'var(--red-100)',
'--error-dark': 'var(--red-600)',
'--error-darker': 'var(--red-700)',
'--error-contrast': 'var(--white)',
//WARNING
'--warning-main': 'var(--orange-500)',
'--warning-fade': 'var(--orange-100)',
'--warning-dark': 'var(--orange-600)',
'--warning-darker': 'var(--orange-700)',
'--warning-contrast': 'var(--white)',
//SUCCESS
'--success-main': 'var(--green-500)',
'--success-fade': 'var(--green-100)',
'--success-dark': 'var(--green-600)',
'--success-darker': 'var(--green-700)',
'--success-contrast': 'var(--white)',
//DIVIDER
'--divider-main': 'var(--gray-200)',
'--divider-fade': 'var(--gray-50)',
'--divider-dark': 'var(--gray-400)',
})

//SPACE
export const space = {
  0: '0',
  '2xs': '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '36px',
  '3xl': '48px',
  '4xl': '64px',
};
//BORDER RADIUS
export const br = {
  sm: css({borderRadius:'2px'}),
  md: css({borderRadius:'6px'}),
  lg: css({borderRadius:'8px'}),
  xl: css({borderRadius:'12px'}),
  full: css({borderRadius:'9999px'}),
};

/* @font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    src: url('../../fonts/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2') format('woff2'),
  } */

/* export const fonts = css`
  @font-face {
    font-family: 'Public Sans';
    font-style: normal;
    src: url('../../fonts/PublicSans[wght].ttf') format('truetype'),
  }

  @font-face {
    font-family: 'Public Sans Italic';
    font-style: normal;
    src: url('../../fonts/PublicSans-Italic[wght].ttf') format('truetype'),
  }

  font-family: 'Public Sans', 'serif';
  `; */

  export const fonts = css({
    fontFamily: "'Public Sans', 'serif'",
  })