import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as authApi from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email is invalid');
            return false;
        }

        setEmailError('');
        return true;
    };

    const handleForgotPassword = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledKeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <StatusBar style="dark" />

            {/* Back Button */}
            <StyledTouchableOpacity
                onPress={() => navigation.goBack()}
                className="absolute left-5 top-14 z-10"
            >
                <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </StyledTouchableOpacity>

            <StyledView className="flex-1 p-6 justify-center">
                {/* Logo and Heading */}
                <StyledView className="items-center mb-8">
                    <StyledImage
                        source={require('../../../assets/logo.png')}
                        className="w-20 h-20 mb-4"
                        resizeMode="contain"
                    />
                    <StyledText className="text-2xl font-bold text-primary-500 mb-2">
                        Forgot Password
                    </StyledText>
                    <StyledText className="text-neutral-600 text-center">
                        Enter your email to receive a password reset link
                    </StyledText>
                </StyledView>

                {/* Success Message */}
                {success && (
                    <Alert
                        type="success"
                        title="Email Sent"
                        message="If an account with this email exists, password reset instructions have been sent."
                        className="mb-4"
                    />
                )}

                {/* Error Message */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        className="mb-4"
                        onClose={() => setError('')}
                    />
                )}

                {/* Forgot Password Form */}
                <StyledView className="space-y-4">
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon={<Ionicons name="mail-outline" size={20} color="#6b7280" />}
                        error={emailError}
                        touched={!!emailError}
                        editable={!success}
                    />

                    <Button
                        title="Reset Password"
                        onPress={handleForgotPassword}
                        loading={loading}
                        disabled={loading || success}
                        fullWidth
                        size="large"
                        className="mt-6"
                    />
                </StyledView>

                {/* Back to Login */}
                <StyledView className="mt-10">
                    <StyledText className="text-center text-neutral-600">
                        Remember your password?{' '}
                        <StyledText
                            className="text-primary-500 font-bold"
                            onPress={() => navigation.navigate('Login')}
                        >
                            Back to Login
                        </StyledText>
                    </StyledText>
                </StyledView>
            </StyledView>
        </StyledKeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;