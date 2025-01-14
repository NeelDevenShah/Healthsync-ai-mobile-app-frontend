import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorAppointmentsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [activeFilter, setActiveFilter] = useState('today');

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);

            let filters = {};
            if (activeFilter === 'today') {
                const today = dayjs().format('YYYY-MM-DD');
                filters.startDate = today;
                filters.endDate = today;
                filters.status = 'scheduled';
            } else if (activeFilter === 'upcoming') {
                const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
                filters.startDate = tomorrow;
                filters.status = 'scheduled';
            } else if (activeFilter === 'completed') {
                filters.status = 'completed';
            } else if (activeFilter === 'cancelled') {
                filters.status = 'cancelled';
            }

            const response = await doctorApi.getDoctorAppointments(filters);
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const onRefresh = () => {
        setRefreshing(true);
        loadAppointments();
    };

    const handleFilterChange = (filter) => {
        if (filter !== activeFilter) {
            setActiveFilter(filter);
        }
    };

    const renderAppointmentItem = ({ item }) => {
        const appointment = item;
        console.log(appointment._id)
        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointmentId: appointment._id })}
            >
                <StyledView className="flex-row items-center">
                    <StyledView className={`
            ${getAppointmentStatusColor(appointment.status)} 
            rounded-lg p-3 mr-3
          `}>
                        <Ionicons
                            name={getAppointmentStatusIcon(appointment.status)}
                            size={24}
                            color={getAppointmentStatusIconColor(appointment.status)}
                        />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {appointment.patientId?.name?.first} {appointment.patientId?.name?.last}
                        </StyledText>

                        <StyledView className="flex-row items-center mt-1">
                            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                            <StyledText className="text-neutral-500 ml-1">
                                {formatDate(appointment.date)}
                            </StyledText>
                            <StyledText className="text-neutral-400 mx-1">•</StyledText>
                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                            <StyledText className="text-neutral-500 ml-1">
                                {appointment.time.start}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <Badge
                        text={formatStatus(appointment.status)}
                        variant={getStatusVariant(appointment.status)}
                        size="small"
                    />
                </StyledView>

                {appointment.requiredReports && appointment.requiredReports.length > 0 && (
                    <StyledView className="mt-3 pt-3 border-t border-neutral-100">
                        <StyledView className="flex-row justify-between items-center">
                            <StyledText className="text-neutral-600 text-sm">
                                <Ionicons name="document-text-outline" size={14} color="#6b7280" /> Required Reports: {appointment.requiredReports.length}
                            </StyledText>
                            <Badge
                                text={getReportsStatusText(appointment.requiredReports)}
                                variant={getReportsStatusVariant(appointment.requiredReports)}
                                size="small"
                            />
                        </StyledView>
                    </StyledView>
                )}
            </Card>
        );
    };

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 flex-row justify-between items-center border-b border-neutral-200">
                <StyledText className="text-xl font-bold text-neutral-800">
                    Appointments
                </StyledText>

                <Button
                    title="Schedule"
                    variant="primary"
                    icon={<Ionicons name="add" size={18} color="white" />}
                    onPress={() => navigation.navigate('DoctorCreateAppointment')}
                    size="small"
                />
            </StyledView>

            {/* Filter Tabs */}
            <StyledView className="flex-row justify-around border-b border-neutral-200 py-2 bg-white">
                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${activeFilter === 'today' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('today')}
                >
                    <StyledText className={activeFilter === 'today' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Today
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${activeFilter === 'upcoming' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('upcoming')}
                >
                    <StyledText className={activeFilter === 'upcoming' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Upcoming
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${activeFilter === 'completed' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('completed')}
                >
                    <StyledText className={activeFilter === 'completed' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Completed
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${activeFilter === 'cancelled' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('cancelled')}
                >
                    <StyledText className={activeFilter === 'cancelled' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Cancelled
                    </StyledText>
                </StyledTouchableOpacity>
            </StyledView>

            {/* Appointments List */}
            {loading && !refreshing ? (
                <LoadingSpinner text="Loading appointments..." />
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointmentItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title={`No ${activeFilter} appointments`}
                            message={getEmptyStateMessage(activeFilter)}
                            icon={<Ionicons name="calendar-outline" size={60} color="#9ca3af" />}
                            actionLabel={activeFilter !== 'today' ? "Schedule New Appointment" : undefined}
                            onAction={activeFilter !== 'today' ? () => navigation.navigate('DoctorCreateAppointment') : undefined}
                        />
                    }
                />
            )}
        </StyledView>
    );
};

// Helper functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatStatus = (status) => {
    switch (status) {
        case 'scheduled':
            return 'Scheduled';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        case 'no_show':
            return 'No Show';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

const getStatusVariant = (status) => {
    switch (status) {
        case 'scheduled':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        case 'no_show':
            return 'warning';
        default:
            return 'neutral';
    }
};

const getAppointmentStatusColor = (status) => {
    switch (status) {
        case 'scheduled':
            return 'bg-primary-100';
        case 'completed':
            return 'bg-green-100';
        case 'cancelled':
            return 'bg-red-100';
        case 'no_show':
            return 'bg-amber-100';
        default:
            return 'bg-neutral-100';
    }
};

const getAppointmentStatusIcon = (status) => {
    switch (status) {
        case 'scheduled':
            return 'calendar';
        case 'completed':
            return 'checkmark-circle';
        case 'cancelled':
            return 'close-circle';
        case 'no_show':
            return 'alert-circle';
        default:
            return 'calendar';
    }
};

const getAppointmentStatusIconColor = (status) => {
    switch (status) {
        case 'scheduled':
            return '#1766da';
        case 'completed':
            return '#10b981';
        case 'cancelled':
            return '#ef4444';
        case 'no_show':
            return '#f59e0b';
        default:
            return '#6b7280';
    }
};

const getReportsStatusText = (reports) => {
    const uploadedCount = reports.filter(report => report.isReviewed).length;
    return `${uploadedCount}/${reports.length} Received`;
};

const getReportsStatusVariant = (reports) => {
    const uploadedCount = reports.filter(report => report.isReviewed).length;
    if (uploadedCount === 0) return 'error';
    if (uploadedCount === reports.length) return 'success';
    return 'warning';
};

const getEmptyStateMessage = (filter) => {
    switch (filter) {
        case 'today':
            return 'You don\'t have any appointments scheduled for today.';
        case 'upcoming':
            return 'You don\'t have any upcoming appointments scheduled.';
        case 'completed':
            return 'You don\'t have any completed appointments yet.';
        case 'cancelled':
            return 'You don\'t have any cancelled appointments.';
        default:
            return 'No appointments found.';
    }
};

export default DoctorAppointmentsScreen;