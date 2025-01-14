import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as authApi from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ResetPasswordScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { resetToken } = route.params || {};

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        let isValid = true;

        // Validate password
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        // Validate confirm password
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            // In a real application, the resetToken would come from a URL parameter
            // For this demo, we'll pretend to reset password
            await authApi.resetPassword(resetToken || 'fake-token', password);

            Alert.alert(
                'Password Reset',
                'Your password has been successfully reset. Please login with your new password.',
                [
                    {
                        text: 'Login',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error) {
            console.error('Password reset error:', error);
            Alert.alert('Error', 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Resetting password..." />;
    }

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

            <StyledView className="flex-1 justify-center p-6">
                {/* Logo and Heading */}
                <StyledView className="items-center mb-8">
                    <Ionicons name="lock-open" size={64} color="#1766da" />
                    <StyledText className="text-2xl font-bold text-primary-500 mb-2 mt-4">
                        Reset Password
                    </StyledText>
                    <StyledText className="text-neutral-600 text-center">
                        Please enter your new password
                    </StyledText>
                </StyledView>

                {/* Reset Password Form */}
                <StyledView className="space-y-4">
                    <Input
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter new password"
                        secureTextEntry
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                        error={passwordError}
                        touched={!!passwordError}
                    />

                    <Input
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        secureTextEntry
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                        error={confirmPasswordError}
                        touched={!!confirmPasswordError}
                    />

                    <Button
                        title="Reset Password"
                        onPress={handleResetPassword}
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

export default ResetPasswordScreen;