import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const Collapse: Components<Omit<Theme, 'components'>>['MuiCollapse'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      width: '100%',
      borderRadius: (theme.shape.borderRadius as number) * 2,
    }),
  },
};

export default Collapse;
