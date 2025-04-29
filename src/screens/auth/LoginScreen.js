import React, { useState } from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const LoginScreen = () => {
    const navigation = useNavigation();
    const { login, loading, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');

    const validateForm = () => {
        let isValid = true;

        setEmailError('');
        setPasswordError('');
        setFormError('');

        // Validate email
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email is invalid');
            isValid = false;
        }

        // Validate password
        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            await login(email, password);
            // Navigation is handled by the auth context observer
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials and try again.';
            setFormError(errorMessage);
        }
    };

    return (
        <StyledKeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <StatusBar style="dark" />

            <StyledScrollView contentContainerClassName="flex-grow">
                {/* Back Button */}
                <StyledTouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute left-5 top-14 z-10"
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </StyledTouchableOpacity>

                <StyledView className="flex-1 p-6 mt-20">
                    {/* Logo and Heading */}
                    <StyledView className="items-center mb-8">
                        <StyledImage
                            source={require('../../../assets/logo.png')}
                            className="w-20 h-20 mb-4"
                            resizeMode="contain"
                        />
                        <StyledText className="text-3xl font-bold text-primary-500 mb-2">
                            Welcome Back
                        </StyledText>
                        <StyledText className="text-neutral-600 text-center">
                            Sign in to your account to continue
                        </StyledText>
                    </StyledView>

                    {/* Form Error */}
                    {(formError || error) && (
                        <Alert
                            type="error"
                            message={formError || error}
                            className="mb-4"
                            onClose={() => setFormError('')}
                        />
                    )}

                    {/* Login Form */}
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
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                            error={passwordError}
                            touched={!!passwordError}
                        />

                        <StyledTouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            className="self-end"
                        >
                            <StyledText className="text-primary-500 font-medium">
                                Forgot Password?
                            </StyledText>
                        </StyledTouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                            size="large"
                            className="mt-6"
                        />
                    </StyledView>

                    {/* Register Link */}
                    <StyledView className="mt-10">
                        <StyledText className="text-center text-neutral-600">
                            Don't have an account?{' '}
                            <StyledText
                                className="text-primary-500 font-bold"
                                onPress={() => navigation.navigate('Register')}
                            >
                                Register Now
                            </StyledText>
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledKeyboardAvoidingView>
    );
};

export default LoginScreen;