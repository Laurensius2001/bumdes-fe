import { ThemeOptions } from '@mui/material/styles';
import pxToRem from './functions/px-to-rem';

const typography: ThemeOptions['typography'] = {
  fontFamily: ['Nunito', 'sans-serif'].join(','),
  h1: {
    fontSize: pxToRem(40),
    fontWeight: 700,
    fontFamily: 'Nunito',
  },
  h2: {
    fontSize: pxToRem(28),
    fontWeight: 700,
    fontFamily: 'Nunito',
  },
  h3: {
    fontSize: pxToRem(25),
    fontWeight: 700,
    fontFamily: 'Nunito',
  },
  h4: {
    fontSize: pxToRem(22),
    fontWeight: 700,
    fontFamily: 'Nunito',
  },
  h5: {
    fontSize: pxToRem(20),
    fontWeight: 500,
    fontFamily: 'Nunito',
  },
  h6: {
    fontSize: pxToRem(18),
    fontWeight: 500,
    fontFamily: 'Nunito',
  },
  subtitle1: {
    fontSize: pxToRem(16),
    fontWeight: 500,
    fontFamily: 'Nunito',
  },
  subtitle2: {
    fontSize: pxToRem(16),
    fontWeight: 400,
    fontFamily: 'Nunito',
  },
  body1: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    fontFamily: 'Nunito',
  },
  body2: {
    fontSize: pxToRem(12),
    fontWeight: 400,
    fontFamily: 'Nunito',
  },
  caption: {
    fontFamily: 'Nunito',
  },
  button: {
    fontFamily: 'Nunito',
  },
};

export default typography;
