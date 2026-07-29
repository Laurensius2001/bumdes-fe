import { Stack, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      sx={{ mt: 4, opacity: 0.7 }}
    >
      <Typography variant="subtitle2" fontFamily={'Poppins'} color="text.secondary">
        @ 2026 Bumdes Tirta Sejahtera
      </Typography>
    </Stack>
  );
};

export default Footer;
