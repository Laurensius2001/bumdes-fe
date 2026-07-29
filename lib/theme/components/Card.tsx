import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      height: 'min-content',
      padding: theme.spacing(2.5),
      borderRadius: (theme.shape.borderRadius as number) * 5,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing(2.5),
    }),
  },
};

export default Card;
