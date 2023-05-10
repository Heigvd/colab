/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
export type GeneralSizeType = 'xs' | 'sm' | 'md' | 'lg';
export type ThemeType = 'primary' | 'success' | 'warning' | 'error';
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

export const projectColors = {
  yellow: '#ECC94B',
  orange: '#E68D52',
  red: '#EA6262',
  pink: '#ED64A6',
  purple: '#9F7AEA',
  blue: '#5F9ED9',
  teal: '#38B2AC',
  green: '#47D189',
};

export const cardColors = {
  white: '#FFFFFF',
  yellow: '#FBF4DB',
  pink: '#FBE0ED',
  blue: '#CCF5FD',
  green: '#DAF6E7',
  gray: '#EDF2F7',
};

export const cardProgressColors = {
  white: '--gray-400',
  yellow: '--yellow-400',
  pink: '--pink-400',
  blue: '--blue-400',
  green: '--green-400',
  gray: '--gray-400',
};

const otherColors = css({
  '--purple-400': projectColors.purple,
  '--pink-400': projectColors.pink,
  '--teal-400': projectColors.teal,
  '--yellow-400': projectColors.yellow,
});

const colabTheme = cx(
  basics,
  primary,
  gray,
  blackAlpha,
  whiteAlpha,
  green,
  red,
  orange,
  blue,
  otherColors,
);

export const lightMode = cx(
  colabTheme,
  css({
    //TEXT
    '--text-primary': 'var(--gray-700)',
    '--text-secondary': 'var(--gray-400)',
    '--text-disabled': 'var(--gray-200)',
    //BACKGROUND
    '--bg-primary': 'var(--white)',
    '--bg-secondary': 'var(--gray-50)',
    '--bg-tertiary': 'var(--gray-100)',
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
  }),
);

//FONT
export const fonts = css({
  fontFamily: "'Public Sans', 'sans serif'",
});

//TEXT SIZE
export const text = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  lineHeight: '120%',
  semibold: 700,
  regular: 400,
};
export const heading = {
  xs: '14px',
  sm: '16px',
  md: '20px',
  lg: '28px',
  xl: '36px',
  lineHeight: '120%',
  weight: 700,
};
export const textOther = {
  code: '14px',
  button: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    underline: 'underline',
    weight: 600,
  },
  tag: {
    sm: '12px',
    md: '14px',
    lg: '16px',
    weight: 600,
  },
  th: {
    sm: text.xs,
    lg: text.sm,
    weight: 700,
  },
  avatar: {
    xs: '10px',
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '36px',
  },
  lineHeight: '120%',
};

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
  sm: '2px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

//SHADOWS
export const BS_xs = '0px 0px 0px 1px rgba(0, 0, 0, 0.05);';
export const BS_sm = '0px 1px 2px rgba(0, 0, 0, 0.05);';
export const BS_md = '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)';
export const BS_lg = '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)';
export const BS_base = '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06);';
