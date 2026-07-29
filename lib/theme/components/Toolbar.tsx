import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const Toolbar: Components<Omit<Theme, 'components'>>['MuiToolbar'] = {
  defaultProps: {
    disableGutters: true,
  },
  styleOverrides: {
    root: () => ({
      display: 'flex',
      justifyContent: 'space-between',
    }),
  },
};

export default Toolbar;
