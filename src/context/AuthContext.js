import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in on app start
        const loadStoredUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load user from storage', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.login(email, password);
            setUser(response.data.user);

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Failed to login. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.registerPatient(userData);

            // Don't automatically login after registration
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Failed to register. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authApi.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.updateProfile(profileData);
            setUser(response.data);

            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const refreshUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.getProfile();
            setUser(response.data);

            // Update stored user
            await AsyncStorage.setItem('user', JSON.stringify(response.data));

            return response.data;
        } catch (error) {
            console.error('Refresh profile error:', error);
            setError(error.response?.data?.message || 'Failed to refresh profile data.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                updateUserProfile,
                refreshUserProfile,
                isAuthenticated: !!user,
                isPatient: user?.role === 'patient',
                isDoctor: user?.role === 'doctor',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;