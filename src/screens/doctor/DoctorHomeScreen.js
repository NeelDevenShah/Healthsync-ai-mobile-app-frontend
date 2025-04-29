import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorHomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [pendingDiagnoses, setPendingDiagnoses] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Get today's appointments
            const today = new Date();
            const todayString = today.toISOString().split('T')[0];

            const appointmentsResponse = await doctorApi.getDoctorAppointments({
                startDate: todayString,
                endDate: todayString,
                status: 'scheduled'
            });
            setTodayAppointments(appointmentsResponse.data || []);

            // Get pending diagnoses
            const diagnosesResponse = await doctorApi.getPendingDiagnoses();
            setPendingDiagnoses(diagnosesResponse.data || []);

            // Get pending reports
            const reportsResponse = await doctorApi.getPendingReports();
            setPendingReports(reportsResponse.data || []);
        } catch (error) {
            console.error('Error loading doctor home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-primary-500 pt-14 pb-4 px-4">
                <StyledView className="flex-row justify-between items-center">
                    <StyledView>
                        <StyledText className="text-white text-base">Good {getTimeOfDay()},</StyledText>
                        <StyledText className="text-white text-xl font-bold">Dr. {user?.name?.last || 'Doctor'}</StyledText>
                    </StyledView>

                    <StyledView className="flex-row">
                        <StyledTouchableOpacity
                            className="mr-4 bg-white/20 p-2 rounded-full"
                            onPress={() => navigation.navigate('DoctorNotifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="white" />
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white/20 p-2 rounded-full"
                            onPress={() => navigation.navigate('DoctorProfileTab')}
                        >
                            <Ionicons name="person-outline" size={24} color="white" />
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>
            </StyledView>

            <StyledScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Today's Quick Stats */}
                <StyledView className="px-4 py-6 flex-row">
                    <StyledView className="flex-1 bg-primary-50 rounded-xl p-4 mr-2">
                        <StyledView className="flex-row items-center">
                            <StyledView className="bg-primary-100 p-2 rounded-full mr-2">
                                <Ionicons name="calendar" size={20} color="#1766da" />
                            </StyledView>
                            <StyledText className="text-lg font-bold text-primary-800">
                                {todayAppointments.length}
                            </StyledText>
                        </StyledView>
                        <StyledText className="text-primary-700 mt-1">
                            Today's Appointments
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-1 bg-secondary-50 rounded-xl p-4 mr-2">
                        <StyledView className="flex-row items-center">
                            <StyledView className="bg-secondary-100 p-2 rounded-full mr-2">
                                <Ionicons name="medkit" size={20} color="#2d9d91" />
                            </StyledView>
                            <StyledText className="text-lg font-bold text-secondary-800">
                                {pendingDiagnoses.length}
                            </StyledText>
                        </StyledView>
                        <StyledText className="text-secondary-700 mt-1">
                            Pending Diagnoses
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-1 bg-accent-50 rounded-xl p-4">
                        <StyledView className="flex-row items-center">
                            <StyledView className="bg-accent-100 p-2 rounded-full mr-2">
                                <Ionicons name="document-text" size={20} color="#ff7d00" />
                            </StyledView>
                            <StyledText className="text-lg font-bold text-accent-800">
                                {pendingReports.length}
                            </StyledText>
                        </StyledView>
                        <StyledText className="text-accent-700 mt-1">
                            Pending Reports
                        </StyledText>
                    </StyledView>
                </StyledView>

                {/* Today's Appointments */}
                <StyledView className="px-4 py-2">
                    <StyledView className="flex-row justify-between items-center mb-2">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            Today's Appointments
                        </StyledText>
                        <StyledTouchableOpacity onPress={() => navigation.navigate('DoctorAppointmentsTab')}>
                            <StyledText className="text-primary-500">See All</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>

                    {todayAppointments.length === 0 ? (
                        <Card elevation={1} className="items-center py-6">
                            <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
                            <StyledText className="text-neutral-500 text-center mt-2">
                                No appointments scheduled for today
                            </StyledText>
                            <Button
                                title="View Schedule"
                                variant="outline"
                                size="small"
                                onPress={() => navigation.navigate('DoctorProfileTab', { screen: 'DoctorSchedule' })}
                                className="mt-3"
                            />
                        </Card>
                    ) : (
                        todayAppointments.slice(0, 3).map((appointment) => (
                            <Card
                                key={appointment._id}
                                elevation={1}
                                className="mb-2"
                                onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointmentId: appointment._id })}
                            >
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-primary-100 rounded-lg p-3 mr-3">
                                        <Ionicons name="calendar" size={24} color="#1766da" />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="text-lg font-bold text-neutral-800">
                                            {appointment.patientId?.name?.first} {appointment.patientId?.name?.last}
                                        </StyledText>

                                        <StyledView className="flex-row items-center mt-1">
                                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                                            <StyledText className="text-neutral-500 ml-1">
                                                {appointment.time.start}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>

                                    <Button
                                        title="Details"
                                        variant="outline"
                                        size="small"
                                        onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointmentId: appointment._id })}
                                    />
                                </StyledView>
                            </Card>
                        ))
                    )}
                </StyledView>

                {/* Pending Diagnoses */}
                {pendingDiagnoses.length > 0 && (
                    <StyledView className="px-4 py-2">
                        <StyledView className="flex-row justify-between items-center mb-2">
                            <StyledText className="text-lg font-bold text-neutral-800">
                                Pending Diagnoses
                            </StyledText>
                            <StyledTouchableOpacity onPress={() => navigation.navigate('DoctorDiagnoses')}>
                                <StyledText className="text-primary-500">See All</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>

                        {pendingDiagnoses.slice(0, 2).map((diagnosis) => (
                            <Card
                                key={diagnosis._id}
                                elevation={1}
                                className="mb-2"
                                onPress={() => navigation.navigate('DoctorDiagnosisDetail', { diagnosisId: diagnosis._id })}
                            >
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-secondary-100 rounded-lg p-3 mr-3">
                                        <Ionicons name="medkit" size={24} color="#2d9d91" />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="text-lg font-bold text-neutral-800">
                                            {diagnosis.patientId?.name?.first} {diagnosis.patientId?.name?.last}
                                        </StyledText>
                                        <StyledText className="text-neutral-600 line-clamp-1">
                                            {truncateSummary(diagnosis.aiSummary, 60)}
                                        </StyledText>
                                        <StyledText className="text-xs text-neutral-500 mt-1">
                                            Received: {formatTimeSince(diagnosis.updatedAt)}
                                        </StyledText>
                                    </StyledView>

                                    <Badge
                                        text="Review"
                                        variant="secondary"
                                        size="small"
                                    />
                                </StyledView>
                            </Card>
                        ))}

                        <Button
                            title="Review All Pending Diagnoses"
                            variant="secondary"
                            icon={<Ionicons name="medkit-outline" size={16} color="white" />}
                            onPress={() => navigation.navigate('DoctorDiagnoses')}
                            className="mt-2"
                            fullWidth
                        />
                    </StyledView>
                )}

                {/* Pending Reports */}
                {pendingReports.length > 0 && (
                    <StyledView className="px-4 py-2 mb-4">
                        <StyledView className="flex-row justify-between items-center mb-2">
                            <StyledText className="text-lg font-bold text-neutral-800">
                                Pending Reports
                            </StyledText>
                            <StyledTouchableOpacity onPress={() => navigation.navigate('DoctorReports')}>
                                <StyledText className="text-primary-500">See All</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>

                        {pendingReports.slice(0, 2).map((report) => (
                            <Card
                                key={report._id}
                                elevation={1}
                                className="mb-2"
                                onPress={() => navigation.navigate('DoctorReportDetail', { reportId: report._id })}
                            >
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-accent-100 rounded-lg p-3 mr-3">
                                        <Ionicons name="document-text" size={24} color="#ff7d00" />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="text-lg font-bold text-neutral-800">
                                            {report.name}
                                        </StyledText>
                                        <StyledText className="text-neutral-600">
                                            {report.patientId?.name?.first} {report.patientId?.name?.last}
                                        </StyledText>
                                        <StyledText className="text-xs text-neutral-500 mt-1">
                                            Uploaded: {formatTimeSince(report.uploadedDate)}
                                        </StyledText>
                                    </StyledView>

                                    <Badge
                                        text="Review"
                                        variant="accent"
                                        size="small"
                                    />
                                </StyledView>
                            </Card>
                        ))}

                        <Button
                            title="Review All Pending Reports"
                            variant="accent"
                            icon={<Ionicons name="document-text-outline" size={16} color="white" />}
                            onPress={() => navigation.navigate('DoctorReports')}
                            className="mt-2"
                            fullWidth
                        />
                    </StyledView>
                )}

                {/* Quick Actions */}
                <StyledView className="px-4 py-4 mb-8">
                    <StyledText className="text-lg font-bold text-neutral-800 mb-3">
                        Quick Actions
                    </StyledText>

                    <StyledView className="flex-row flex-wrap justify-between">
                        <StyledTouchableOpacity
                            className="bg-white shadow rounded-xl p-4 w-[48%] mb-4 items-center"
                            onPress={() => navigation.navigate('DoctorAppointmentsTab', { screen: 'DoctorCreateAppointment' })}
                        >
                            <StyledView className="bg-primary-100 p-3 rounded-full mb-2">
                                <Ionicons name="calendar" size={24} color="#1766da" />
                            </StyledView>
                            <StyledText className="text-neutral-800 font-medium text-center">
                                Schedule Appointment
                            </StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white shadow rounded-xl p-4 w-[48%] mb-4 items-center"
                            onPress={() => navigation.navigate('DoctorPatientsList')}
                        >
                            <StyledView className="bg-secondary-100 p-3 rounded-full mb-2">
                                <Ionicons name="people" size={24} color="#2d9d91" />
                            </StyledView>
                            <StyledText className="text-neutral-800 font-medium text-center">
                                View Patients
                            </StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white shadow rounded-xl p-4 w-[48%] mb-4 items-center"
                            onPress={() => navigation.navigate('DoctorSchedule')}
                        >
                            <StyledView className="bg-accent-100 p-3 rounded-full mb-2">
                                <Ionicons name="time" size={24} color="#ff7d00" />
                            </StyledView>
                            <StyledText className="text-neutral-800 font-medium text-center">
                                Manage Schedule
                            </StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white shadow rounded-xl p-4 w-[48%] mb-4 items-center"
                            onPress={() => navigation.navigate('DoctorProfileMain')}
                        >
                            <StyledView className="bg-neutral-100 p-3 rounded-full mb-2">
                                <Ionicons name="settings" size={24} color="#6b7280" />
                            </StyledView>
                            <StyledText className="text-neutral-800 font-medium text-center">
                                Settings
                            </StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white shadow rounded-xl p-4 w-[48%] mb-4 items-center"
                            onPress={() => navigation.navigate('DoctorReports')}
                        >
                            <StyledView className="bg-neutral-100 p-3 rounded-full mb-2">
                                <Ionicons name="pencil" size={24} color="#6b7280" />
                            </StyledView>
                            <StyledText className="text-neutral-800 font-medium text-center">
                                Peding Reports
                            </StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledView>
    );
};

// Helper Functions
const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Morning';
    if (hours < 17) return 'Afternoon';
    return 'Evening';
};

const truncateSummary = (text, maxLength) => {
    if (!text) return 'No summary available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
};

export default DoctorHomeScreen;