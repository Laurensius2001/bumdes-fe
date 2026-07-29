'use client';

import {
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    Link as MuiLink,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import Image from '@/components/common/Image';
import { Suspense } from 'react';
import forgotPassword from 'assets/authentication-banners/forgot-password.png';
import IconifyIcon from '@/components/common/IconifyIcon';
import logo from 'assets/logo/elegant-logo.png';

const ForgotPasswordPage = () => {
    return (
        <Stack
            direction="row"
            bgcolor="background.paper"
            boxShadow={(theme) => theme.shadows[3]}
            height={560}
            width={{ md: 960 }}
            borderRadius={2}
            overflow="hidden"
        >
            <Stack width={{ md: 0.5 }} m={2.5} gap={10}>
                <Link href="/" passHref legacyBehavior>
                    <MuiLink width="fit-content">
                        <Image src={logo.src} width={82.6} />
                    </MuiLink>
                </Link>
                <Stack alignItems="center" gap={6.5} width={330} mx="auto">
                    <Typography variant="h3">Forgot Password</Typography>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel shrink htmlFor="email">
                            Email
                        </InputLabel>
                        <TextField
                            variant="filled"
                            placeholder="Enter your email"
                            id="email"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconifyIcon icon="ic:baseline-email" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </FormControl>
                    <Button variant="contained" fullWidth>
                        Send Password Reset Link
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        Back to{' '}
                        <Link href="/login" passHref legacyBehavior>
                            <MuiLink
                                underline="hover"
                                sx={{
                                    fontSize: (theme) => theme.typography.body1.fontSize,
                                }}
                            >
                                Log in
                            </MuiLink>
                        </Link>
                    </Typography>
                </Stack>
            </Stack>
            <Suspense
                fallback={
                    <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
                }
            >
                <Image
                    src={forgotPassword.src}
                    alt="Forgot Password banner"
                    sx={{
                        width: 0.5,
                        height: 1,
                        objectFit: 'cover',
                        display: { xs: 'none', md: 'block' },
                    }}
                />
            </Suspense>
        </Stack>
    );
};

export default ForgotPasswordPage;
