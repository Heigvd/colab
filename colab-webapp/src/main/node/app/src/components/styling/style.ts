/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx, keyframes } from '@emotion/css';
import { br, heading, space, text } from './theme';

//SPACE VARS
export const space_xs = space.xs;
export const space_sm = space.sm;
export const space_md = space.md;
export const space_lg = space.lg;
export const space_xl = space.xl;
export const space_2xl = space['2xl'];
export const space_3xl = space['3xl'];
export const space_4xl = space['4xl'];

//BORDER RADIUS
export const br_sm = css({ borderRadius: br.sm});
export const br_md = css({ borderRadius: br.md});
export const br_lg = css({ borderRadius: br.lg});
export const br_xl = css({ borderRadius: br.xl});
export const br_full = css({ borderRadius: br.full});

//TEXT VARS
export const text_xs = css({ fontSize: text.xs});
export const text_sm = css({ fontSize: text.sm });
export const text_md = css({ fontSize: text.md});
export const text_lg = css({ fontSize: text.lg});
export const text_xl = css({ fontSize: text.xl});
export const text_regular = css({ fontSize: text.regular});
export const text_semibold = css({ fontSize: text.semibold});
export const text_lineHeight = css({ fontSize: text.lineHeight});

export const heading_xs = css({ fontSize: heading.xs});
export const heading_sm = css({ fontSize: heading.sm});
export const heading_md = css({ fontSize: heading.md});
export const heading_lg = css({ fontSize: heading.lg});
export const heading_xl = css({ fontSize: heading.xl});
export const heading_weight = css({ fontSize: heading.weight});
export const heading_lineHeight = css({ fontSize: heading.lineHeight});

//MODES
export const errorTextStyle = css({
  color: 'var(--error-main)',
});
export const warningTextStyle = css({
  color: 'var(--warning-main)',
});
export const successTextStyle = css({
  color: 'var(--success-main)',
});

// APP VARIABLES

export const fullPageStyle = cx(
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
  css({
    display: 'inline-block',
    padding: '8px 14px',
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
    padding: space_sm,
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
  padding: space_lg,
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
  padding: space_sm + ' ' + space_lg,
  lineHeight: '1.6em',
  height: '100px',
  fontFamily: 'inherit',
  fontSize: text_sm,
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
  padding: '0 ' + space_lg,
  lineHeight: '2.5em',
  fontFamily: 'inherit',
  fontSize: text_sm,
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
  padding: space_sm,
  borderRadius: '6px',
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
  padding: space_xl,
});

export const selectCreatorStyle = css({
  paddingTop: space_lg,
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'var(--darkGray)',
});

export const disabledStyle = css({
  opacity: 0.5,
  pointerEvents: 'none',
});
