/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { br, heading, space, text, textOther, ThemeType } from './theme';

//SPACE VARS
export const space_2xs = space['2xs'];
export const space_xs = space.xs;
export const space_sm = space.sm;
export const space_md = space.md;
export const space_lg = space.lg;
export const space_xl = space.xl;
export const space_2xl = space['2xl'];
export const space_3xl = space['3xl'];
export const space_4xl = space['4xl'];
// PADDING
export const p_0 = css({ padding: space['0'] });
export const p_2xs = css({ padding: space['2xs'] });
export const p_xs = css({ padding: space.xs });
export const p_sm = css({ padding: space.sm });
export const p_md = css({ padding: space.md });
export const p_lg = css({ padding: space.lg });
export const p_xl = css({ padding: space.xl });
export const p_2xl = css({ padding: space['2xl'] });
export const p_3xl = css({ padding: space['3xl'] });
export const p_4xl = css({ padding: space['4xl'] });

// MARGIN
export const m_0 = css({ margin: space['0'] });
export const m_2xs = css({ margin: space['2xs'] });
export const m_xs = css({ margin: space.xs });
export const m_sm = css({ margin: space.sm });
export const m_md = css({ margin: space.md });
export const m_lg = css({ margin: space.lg });
export const m_xl = css({ margin: space.xl });
export const m_2xl = css({ margin: space['2xl'] });
export const m_3xl = css({ margin: space['3xl'] });
export const m_4xl = css({ margin: space['4xl'] });

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
export const text_regular = css({ fontWeight: text.regular });
export const text_semibold = css({ fontWeight: text.semibold });
export const text_lineHeight = css({ lineHeight: text.lineHeight });

export const heading_xs = css({ fontSize: heading.xs, fontWeight: heading.weight });
export const heading_sm = css({ fontSize: heading.sm, fontWeight: heading.weight });
export const heading_md = css({ fontSize: heading.md, fontWeight: heading.weight });
export const heading_lg = css({ fontSize: heading.lg, fontWeight: heading.weight });
export const heading_xl = css({ fontSize: heading.xl, fontWeight: heading.weight });
export const heading_weight = css({ fontWeight: heading.weight });
export const heading_lineHeight = css({ lineHeight: heading.lineHeight });

//TEXT

export const lightTextStyle = css({
  color: 'var(--text-secondary)',
});

export const underlineTextStyle = css({
  textDecoration: 'underline',
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
export const disabledTextStyle = css({
  color: 'var(--text-disabled)',
});

export const errorborderStyle = css({
  border: '1px solid var(--error-main)',
});
export const warningborderStyle = css({
  border: '1px solid var(--warning-main)',
});
export const successborderStyle = css({
  border: '1px solid var(--success-main)',
});

// TEXT ELLIPSIS

export const multiLineEllipsisStyle = css({
  display: '-webkit-box',
  WebkitLineClamp: '2',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
export const oneLineEllipsisStyle = css({
  display: '-webkit-box',
  WebkitLineClamp: '1',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
export const ellipsisStyle = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

// GENERAL
export const foregroundStyle = css({
  zIndex: 9999,
});

export const fullScreenOverlayStyle = cx(
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

export const fullHeightStyle = css({
  height: '100%',
});

export const WIPStyle = cx(
  css({
    border: '2px solid hotpink',
  }),
);

const disabled = {
  opacity: 0.5,
  cursor: 'default',
};

export const disabledStyle = css({
  ...disabled,
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

//LINKS

export const linkStyle = cx(
  removeOutlineStyle,
  css({
    cursor: 'pointer',
    color: 'inherit',
    '&:hover': {
      color: 'var(--text-primary)',
      textDecoration: 'underline',
    },
  }),
);

export const lightLinkStyle = cx(
  linkStyle,
  css({
    color: 'var(--secondary-main)',
    textDecoration: 'none',
  }),
);

//ICON BUTTONS STYLES
export const iconButtonStyle = cx(
  p_sm,
  br_md,
  css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    '&:not(:disabled):hover': {
      color: 'var(--text-primary)',
    },
    '&:disabled': {
      ...disabled,
      pointerEvents: 'none',
    },
  }),
);

export const activeIconButtonStyle = cx(
  iconButtonStyle,
  css({
    backgroundColor: 'var(--gray-200)',
    color: 'var(--text-primary)',
    ':hover': {
      backgroundColor: 'var(--gray-200)',
    },
  }),
);

export const lightIconButtonStyle = css({
  color: 'var(--secondary-main)',
  '&:not(:disabled):hover': {
    color: 'var(--text-primary)',
  },
});

export const ghostIconButtonStyle = css({
  backgroundColor: `var(--bg-primary)`,
  color: 'var(--text-secondary)',
  ':hover': {
    backgroundColor: `var(--gray-100)`,
  },
  ':active': {
    backgroundColor: `var(--gray-200)`,
  },
});

// BUTTON STYLES
export const buttonStyle = cx(
  br_full,
  css({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    padding: `0 ${space_md}`,
    position: 'relative',
    '&:not(:disabled):hover': {
      textDecoration: 'none',
      backgroundColor: 'var(--bg-secondary)',
    },
    ':focus': {
      outline: 'none',
    },
    ':focus-visible': {
      outline: '1px solid var(--text-primary)',
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

export function SolidButtonStyle(theme: ThemeType) {
  return css({
    backgroundColor: `var(--${theme}-main)`,
    border: '1px solid transparent',
    color: `var(--${theme}-contrast)`,
    '&:not(:disabled):hover': {
      backgroundColor: `var(--${theme}-dark)`,
      color: `var(--${theme}-contrast)`,
    },
    ':active': {
      backgroundColor: `var(--${theme}-darker)`,
      color: `var(--${theme}-contrast)`,
    },
  });
}

export function OutlineButtonStyle(theme: ThemeType): string {
  return cx(
    css({
      backgroundColor: 'transparent',
      border: `1px solid var(--${theme}-main)`,
      color: `var(--primary-main)`,
      cursor: 'pointer',
      '&:not(:disabled):hover': {
        backgroundColor: `var(--${theme}-fade)`,
      },
      '&:active': {
        backgroundColor: `var(--${theme != 'primary' ? theme + '-fade' : theme + '-100'})`,
      },
    }),
  );
}

// CARD
export const cardStyle = cx(
  br_md,
  css({
    border: '1px solid var(--divider-main)',
    backgroundColor: 'var(--bg-primary)',
    '&:hover': {
      border: '1px solid var(--divider-dark)',
    },
  }),
);

//TAG
export const labelStyle = css({
  fontWeight: 500,
});

//TABLES
const titleCellStyle = css({
  fontSize: textOther.th.sm,
  fontWeight: textOther.th.weight,
  textTransform: 'uppercase',
  padding: space_xs,
  borderBottom: '1px solid var(--divider-main)',
  justifySelf: 'stretch',
  textAlign: 'left'
});
export const th_sm = cx(titleCellStyle, text_xs);
export const th_lg = cx(titleCellStyle, text_sm);

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
