import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';
import pxToRem from '@/lib/theme/functions/px-to-rem';

const TextField: Components<Omit<Theme, 'components'>>['MuiTextField'] = {
  defaultProps: {
    variant: 'filled',
  },
  styleOverrides: {
    root: {
      gap: pxToRem(10),
    },
  },
};

export default TextField;
