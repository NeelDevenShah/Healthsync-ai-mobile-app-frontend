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

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register, loading, error } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: {
            first: '',
            last: '',
        },
        phone: '',
        gender: '',
        dateOfBirth: '',
    });

    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [field]: value,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Validate password
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Validate name
        if (!formData.name.first.trim()) {
            newErrors['name.first'] = 'First name is required';
        }
        if (!formData.name.last.trim()) {
            newErrors['name.last'] = 'Last name is required';
        }

        // Validate phone (optional)
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Phone number is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = formData;

            await register(registrationData);

            navigation.navigate('Login', {
                message: 'Registration successful. Please log in with your credentials.'
            });
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
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
                            Create Account
                        </StyledText>
                        <StyledText className="text-neutral-600 text-center">
                            Sign up to get started with HealthCare
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

                    {/* Registration Form */}
                    <StyledView className="space-y-4">
                        <StyledView className="flex-row space-x-2">
                            <StyledView className="flex-1">
                                <Input
                                    label="First Name"
                                    value={formData.name.first}
                                    onChangeText={(value) => handleChange('name.first', value)}
                                    placeholder="John"
                                    error={errors['name.first']}
                                    touched={!!errors['name.first']}
                                />
                            </StyledView>
                            <StyledView className="flex-1">
                                <Input
                                    label="Last Name"
                                    value={formData.name.last}
                                    onChangeText={(value) => handleChange('name.last', value)}
                                    placeholder="Doe"
                                    error={errors['name.last']}
                                    touched={!!errors['name.last']}
                                />
                            </StyledView>
                        </StyledView>

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="johndoe@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Ionicons name="mail-outline" size={20} color="#6b7280" />}
                            error={errors.email}
                            touched={!!errors.email}
                        />

                        <Input
                            label="Phone Number (Optional)"
                            value={formData.phone}
                            onChangeText={(value) => handleChange('phone', value)}
                            placeholder="(555) 555-5555"
                            keyboardType="phone-pad"
                            leftIcon={<Ionicons name="call-outline" size={20} color="#6b7280" />}
                            error={errors.phone}
                            touched={!!errors.phone}
                        />

                        <Input
                            label="Password"
                            value={formData.password}
                            onChangeText={(value) => handleChange('password', value)}
                            placeholder="Create a strong password"
                            secureTextEntry
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                            error={errors.password}
                            touched={!!errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(value) => handleChange('confirmPassword', value)}
                            placeholder="Confirm your password"
                            secureTextEntry
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                            error={errors.confirmPassword}
                            touched={!!errors.confirmPassword}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                            size="large"
                            className="mt-6"
                        />
                    </StyledView>

                    {/* Login Link */}
                    <StyledView className="mt-10">
                        <StyledText className="text-center text-neutral-600">
                            Already have an account?{' '}
                            <StyledText
                                className="text-primary-500 font-bold"
                                onPress={() => navigation.navigate('Login')}
                            >
                                Sign In
                            </StyledText>
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledKeyboardAvoidingView>
    );
};

export default RegisterScreen;