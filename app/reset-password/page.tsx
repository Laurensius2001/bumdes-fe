'use client';

import { ReactElement, Suspense, useState } from 'react';
import {
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Link as MuiLink,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import logo from 'assets/logo/elegant-logo.png';
import resetPassword from 'assets/authentication-banners/reset-password.png';
import passwordUpdated from 'assets/authentication-banners/password-updated.png';
import successTick from 'assets/authentication-banners/successTick.png';
import Image from '@/components/common/Image';
import IconifyIcon from '@/components/common/IconifyIcon';

const ResetPasswordPage = (): ReactElement => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const [resetSuccessful, setResetSuccessful] = useState(false);

    const handleResetPassword = () => {
        const passwordField: HTMLInputElement = document.getElementById(
            'new-password',
        ) as HTMLInputElement;
        const confirmPasswordField: HTMLInputElement = document.getElementById(
            'confirm-password',
        ) as HTMLInputElement;

        if (passwordField.value !== confirmPasswordField.value) {
            alert("Passwords don't match");
            return;
        }
        setResetSuccessful(true);
    };

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
                {!resetSuccessful ? (
                    <Stack alignItems="center" gap={3.75} width={330} mx="auto">
                        <Typography variant="h3">Reset Password</Typography>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel shrink htmlFor="new-password">
                                Password
                            </InputLabel>
                            <TextField
                                variant="filled"
                                placeholder="Enter new password"
                                type={showNewPassword ? 'text' : 'password'}
                                id="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowNewPassword}
                                                edge="end"
                                                sx={{
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {showNewPassword ? (
                                                    <IconifyIcon icon="ic:baseline-key-off" />
                                                ) : (
                                                    <IconifyIcon icon="ic:baseline-key" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel shrink htmlFor="confirm-password">
                                Password
                            </InputLabel>
                            <TextField
                                variant="filled"
                                placeholder="Confirm password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirm-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowConfirmPassword}
                                                edge="end"
                                                sx={{
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {showConfirmPassword ? (
                                                    <IconifyIcon icon="ic:baseline-key-off" />
                                                ) : (
                                                    <IconifyIcon icon="ic:baseline-key" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                        <Button variant="contained" fullWidth onClick={handleResetPassword}>
                            Reset Password
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
                ) : (
                    <Stack alignItems="center" gap={3.75} width={330} mx="auto">
                        <Image src={successTick.src} />
                        <Typography variant="h3">Reset Successfully</Typography>
                        <Typography variant="body1" textAlign="center" color="text.secondary">
                            Your Elegent log in password has been updated successfully
                        </Typography>
                        <Link href="/login" passHref legacyBehavior>
                            <Button variant="contained" fullWidth>
                                Continue to Login
                            </Button>
                        </Link>
                    </Stack>
                )}
            </Stack>
            <Suspense
                fallback={
                    <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
                }
            >
                <Image
                    alt={resetSuccessful ? 'Reset done' : 'Login banner'}
                    src={resetSuccessful ? passwordUpdated.src : resetPassword.src}
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

export default ResetPasswordPage;
