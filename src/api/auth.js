import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerPatient = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    console.log(response)
    const { token, refreshToken, user } = response.data.data;

    // Store tokens and user data
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.log('Logout error:', error);
    } finally {
        // Clear stored data regardless of API success
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
    }

    return { success: true };
};

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/auth/me', profileData);

    // Update stored user data
    const updatedUser = response.data;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (resetToken, newPassword) => {
    const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword
    });
    return response.data;
};