/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
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
export const br_sm = css({ borderRadius: br.sm });
export const br_md = css({ borderRadius: br.md });
export const br_lg = css({ borderRadius: br.lg });
export const br_xl = css({ borderRadius: br.xl });
export const br_full = css({ borderRadius: br.full });

//TEXT VARS
export const text_xs = css({ fontSize: text.xs });
export const text_sm = css({ fontSize: text.sm });
export const text_md = css({ fontSize: text.md });
export const text_lg = css({ fontSize: text.lg });
export const text_xl = css({ fontSize: text.xl });
export const text_regular = css({ fontSize: text.regular });
export const text_semibold = css({ fontSize: text.semibold });
export const text_lineHeight = css({ fontSize: text.lineHeight });

export const heading_xs = css({ fontSize: heading.xs });
export const heading_sm = css({ fontSize: heading.sm });
export const heading_md = css({ fontSize: heading.md });
export const heading_lg = css({ fontSize: heading.lg });
export const heading_xl = css({ fontSize: heading.xl });
export const heading_weight = css({ fontSize: heading.weight });
export const heading_lineHeight = css({ fontSize: heading.lineHeight });

//TEXT

export const lightTextStyle = css({
  color: 'var(--text-secondary)',
});

//TEXT MODES
export const errorTextStyle = css({
  color: 'var(--error-main)',
});
export const warningTextStyle = css({
  color: 'var(--warning-main)',
});
export const successTextStyle = css({
  color: 'var(--success-main)',
});

// TEXT ELLIPSIS

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

// GENERAL
export const forground = css({
  zIndex: 9999,
});
export const fullScreenOverlay = cx(
  css({
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'var(--blackAlpha-700)',
  }),
);

export const iconStyle = css({
  paddingLeft: space_xs,
  paddingRight: space_xs,
});

export const fullHeightStyle = css({
  height: '100%',
});

export const WIPStyle = cx(
  css({
    border: '2px solid hotpink',
  }),
);

export const disabledStyle = css({
  opacity: 0.4,
  pointerEvents: 'none',
});

//INPUTS

export const removeOutlineStyle = css({
  '&:focus': {
    outline: 'none',
  },
  '&:focus-visible': {
    outline: '1px solid var(--warning-main)',
  },
});

/**LINKS */

export const linkStyle = cx(
  removeOutlineStyle,
  css({
    cursor: 'pointer',
    color: 'inherit',
    ':hover': {
      color: 'var(--hoverFgColor)',
      textDecoration: 'underline',
    },
  }),
);

export const lightLinkStyle = cx(
  linkStyle,
  css({
    color: 'var(--darkGray)',
    textDecoration: 'none',
  }),
);

//ICON BUTTONS STYLES
export const iconButton = cx(
  iconStyle,
  css({
    cursor: 'pointer',
    ':hover': {
      color: 'var(--darkGray)',
    },
  }),
);

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

// BUTTON STYLES
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
export const activeButtonStyle = cx(
  buttonStyle,
  css({
    backgroundColor: 'var(--gray-200)',
    textDecoration: 'none',
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

// CARD
export const cardStyle = cx(
  br_md,
  css({
    border: '1px solid var(--divider-main)',
    '&:hover': {
      border: '1px solid var(--divider-dark)',
    },
  }),
);

//HEADER
export const mainHeaderHeight = '50px';


//TAG
export const labelStyle = css({
  fontWeight: 500,
});


/* export function rootViewCardsStyle(depth: number, inRootView: boolean) {
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
} */