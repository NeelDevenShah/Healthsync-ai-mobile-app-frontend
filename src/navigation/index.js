import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';

const RootStack = createStackNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const Navigation = () => {
    const { isAuthenticated, user } = useAuth();

    // Handle notifications
    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const { notification } = response;
            const data = notification.request.content.data;

            // Handle notification navigation based on data
            // This would typically navigate to the relevant screen based on the notification type
            console.log('Notification data:', data);
        });

        return () => subscription.remove();
    }, []);

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                ) : user?.role === 'patient' ? (
                    <RootStack.Screen name="PatientApp" component={PatientNavigator} />
                ) : (
                    <RootStack.Screen name="DoctorApp" component={DoctorNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;