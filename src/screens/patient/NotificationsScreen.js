import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as notificationApi from '../../api/notification';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const NotificationsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationApi.getNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationApi.markNotificationRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId
                        ? { ...notif, read: true, readAt: new Date() }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await notificationApi.deleteNotification(notificationId);

            // Update local state
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationPress = (notification) => {
        // Mark as read
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }

        // Navigate based on notification type and reference
        if (notification.data?.referenceType === 'appointment') {
            navigation.navigate('AppointmentDetail', { appointmentId: notification.data.referenceId });
        } else if (notification.data?.referenceType === 'diagnosis') {
            navigation.navigate('DiagnosisDetail', { diagnosisId: notification.data.referenceId });
        } else if (notification.data?.referenceType === 'report') {
            navigation.navigate('ReportDetail', { reportId: notification.data.referenceId });
        } else if (notification.data?.referenceType === 'medication') {
            navigation.navigate('MedicationDetail', { medicationId: notification.data.referenceId });
        } else if (notification.data?.referenceType === 'healthMetric') {
            navigation.navigate('HealthDashboard');
        }
    };

    const renderNotificationItem = ({ item }) => {
        const notification = item;

        return (
            <StyledTouchableOpacity
                className={`
          p-4 border-b border-neutral-200
          ${notification.read ? 'bg-white' : 'bg-primary-50'}
        `}
                onPress={() => handleNotificationPress(notification)}
            >
                <StyledView className="flex-row">
                    <StyledView className={`
            w-10 h-10 rounded-full items-center justify-center mr-3
            ${getNotificationIconBackground(notification.type)}
          `}>
                        <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color="white"
                        />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className={`text-base ${notification.read ? 'font-medium text-neutral-800' : 'font-bold text-neutral-900'}`}>
                            {notification.title}
                        </StyledText>
                        <StyledText className={`mt-1 ${notification.read ? 'text-neutral-600' : 'text-neutral-700'}`}>
                            {notification.body}
                        </StyledText>
                        <StyledText className="text-xs text-neutral-500 mt-1">
                            {formatTimestamp(notification.sentAt)}
                        </StyledText>
                    </StyledView>

                    {!notification.read && (
                        <StyledView className="w-3 h-3 rounded-full bg-primary-500 mt-1" />
                    )}
                </StyledView>

                <StyledView className="flex-row justify-end mt-2">
                    {!notification.read && (
                        <StyledTouchableOpacity
                            className="mr-4"
                            onPress={() => handleMarkAsRead(notification._id)}
                        >
                            <StyledText className="text-primary-500 font-medium">Mark as read</StyledText>
                        </StyledTouchableOpacity>
                    )}

                    <StyledTouchableOpacity
                        onPress={() => handleDeleteNotification(notification._id)}
                    >
                        <StyledText className="text-neutral-500">Delete</StyledText>
                    </StyledTouchableOpacity>
                </StyledView>
            </StyledTouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading notifications..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 flex-row items-center border-b border-neutral-200">
                <StyledTouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-4"
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </StyledTouchableOpacity>

                <StyledView className="flex-1">
                    <StyledText className="text-xl font-bold text-neutral-800">
                        Notifications
                    </StyledText>
                </StyledView>

                {notifications.some(n => !n.read) && (
                    <StyledTouchableOpacity
                        className="ml-2"
                        onPress={async () => {
                            const unreadNotifications = notifications.filter(n => !n.read);
                            for (const notif of unreadNotifications) {
                                await handleMarkAsRead(notif._id);
                            }
                        }}
                    >
                        <StyledText className="text-primary-500 font-medium">Mark all as read</StyledText>
                    </StyledTouchableOpacity>
                )}
            </StyledView>

            <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Notifications"
                        message="You don't have any notifications at the moment."
                        icon={<Ionicons name="notifications-off-outline" size={60} color="#9ca3af" />}
                    />
                }
            />
        </StyledView>
    );
};

// Helper functions
const getNotificationIcon = (type) => {
    switch (type) {
        case 'appointment':
            return 'calendar';
        case 'report':
            return 'document-text';
        case 'diagnosis':
            return 'medkit';
        case 'medication':
            return 'medical';
        case 'health_alert':
            return 'alert-circle';
        default:
            return 'notifications';
    }
};

const getNotificationIconBackground = (type) => {
    switch (type) {
        case 'appointment':
            return 'bg-primary-500';
        case 'report':
            return 'bg-accent-500';
        case 'diagnosis':
            return 'bg-secondary-500';
        case 'medication':
            return 'bg-green-500';
        case 'health_alert':
            return 'bg-red-500';
        default:
            return 'bg-neutral-500';
    }
};

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
        return date.toLocaleDateString();
    } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};

export default NotificationsScreen;