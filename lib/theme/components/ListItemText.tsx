import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const ListItemText: Components<Omit<Theme, 'components'>>['MuiListItemText'] = {
  defaultProps: {},
  styleOverrides: {
    primary: ({ theme }) => ({
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
      fontFamily: theme.typography.fontFamily,
    }),
  },
};

export default ListItemText;
