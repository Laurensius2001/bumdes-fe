import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';
import { forwardRef } from 'react';
import NextLink from 'next/link';

const LinkBehavior = forwardRef<any, { href?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  (props, ref) => {
    const { href = '/', ...other } = props;
    return <NextLink href={href} ref={ref as any} {...other} />;
  },
);

LinkBehavior.displayName = 'LinkBehavior';

const Link: Components<Omit<Theme, 'components'>>['MuiLink'] = {
  defaultProps: {
    underline: 'none',
    component: LinkBehavior,
  },
  styleOverrides: {},
};

export default Link;
