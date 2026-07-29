import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const ListItemIcon: Components<Omit<Theme, 'components'>>['MuiListItemIcon'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      width: theme.spacing(2.25),
      height: theme.spacing(2.25),
      color: 'inherit',
      minWidth: 'auto',
      alignItems: 'center',
    }),
  },
};

export default ListItemIcon;
