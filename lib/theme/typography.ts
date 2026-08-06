import { ThemeOptions } from '@mui/material/styles';
import pxToRem from './functions/px-to-rem';

const typography: ThemeOptions['typography'] = {
  fontFamily: ['Inter', 'sans-serif'].join(','),
  h1: {
    fontSize: pxToRem(40),
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  h2: {
    fontSize: pxToRem(28),
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  h3: {
    fontSize: pxToRem(25),
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  h4: {
    fontSize: pxToRem(22),
    fontWeight: 700,
    fontFamily: 'Inter',
  },
  h5: {
    fontSize: pxToRem(20),
    fontWeight: 500,
    fontFamily: 'Inter',
  },
  h6: {
    fontSize: pxToRem(18),
    fontWeight: 500,
    fontFamily: 'Inter',
  },
  subtitle1: {
    fontSize: pxToRem(16),
    fontWeight: 500,
    fontFamily: 'Inter',
  },
  subtitle2: {
    fontSize: pxToRem(16),
    fontWeight: 400,
    fontFamily: 'Inter',
  },
  body1: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    fontFamily: 'Inter',
  },
  body2: {
    fontSize: pxToRem(12),
    fontWeight: 400,
    fontFamily: 'Inter',
  },
  caption: {
    fontFamily: 'Inter',
  },
  button: {
    fontFamily: 'Inter',
  },
};

export default typography;

