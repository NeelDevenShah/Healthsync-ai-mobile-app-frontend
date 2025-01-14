import api from './axios';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export const getNotifications = async (filters = {}) => {
    const response = await api.get('/notifications', {
        params: filters
    });
    return response.data;
};

export const markNotificationRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

export const deleteNotification = async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

export const registerDeviceForPushNotifications = async () => {
    if (!Device.isDevice) {
        throw new Error('Push notifications require a physical device');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for push notifications');
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.manifest.extra.eas.projectId,
    });

    // Register token with backend
    const response = await api.post('/notifications/register-device', {
        token: pushToken.data,
        deviceType: Device.osName.toLowerCase()
    });

    return response.data;
};

export const unregisterDevice = async (token) => {
    const response = await api.post('/notifications/unregister-device', { token });
    return response.data;
};