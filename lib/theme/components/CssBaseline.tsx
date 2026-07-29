import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';
import scrollbar from '@/lib/theme/styles/scrollbar';
import echart from '@/lib/theme/styles/echart';
import 'simplebar-react/dist/simplebar.min.css';
import simplebar from '@/lib/theme/styles/simplebar';

const CssBaseline: Components<Omit<Theme, 'components'>>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme: Theme) => ({
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      ...scrollbar(theme),
    },
    ...echart(),
    ...simplebar(theme),
  }),
};

export default CssBaseline;
