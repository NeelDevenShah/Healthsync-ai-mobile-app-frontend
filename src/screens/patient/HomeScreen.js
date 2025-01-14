import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { styled } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import * as patientApi from '../../api/patient';
import * as healthMetricApi from '../../api/healthMetric';
import * as medicationApi from '../../api/medication';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [upcomingMedications, setUpcomingMedications] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState(null);
    const [abnormalReadings, setAbnormalReadings] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch upcoming appointments
            const appointmentsResponse = await patientApi.getPatientAppointments({
                status: 'scheduled',
                limit: 3
            });
            setUpcomingAppointments(appointmentsResponse.data || []);

            // Fetch upcoming medications
            const medicationsResponse = await medicationApi.getUpcomingMedications(1);
            setUpcomingMedications(medicationsResponse.data || []);

            // Fetch health dashboard summary
            const dashboardResponse = await healthMetricApi.getDashboard('7d');
            setHealthMetrics(dashboardResponse.data || null);

            // Fetch abnormal readings
            const abnormalResponse = await healthMetricApi.getAbnormalReadings('7d');
            setAbnormalReadings(abnormalResponse.data || []);

            // Fetch pending reports
            const reportsResponse = await patientApi.getPatientReports({
                isReviewed: false,
            });
            setPendingReports(reportsResponse.data || []);

        } catch (error) {
            console.error('Error loading home data:', error);
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
        return <LoadingSpinner fullScreen text="Loading your health dashboard..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-primary-500 pt-14 pb-4 px-4">
                <StyledView className="flex-row justify-between items-center">
                    <StyledView>
                        <StyledText className="text-white text-base">Good {getTimeOfDay()},</StyledText>
                        <StyledText className="text-white text-xl font-bold">{user?.name?.first || 'Patient'}</StyledText>
                    </StyledView>

                    <StyledView className="flex-row">
                        <StyledTouchableOpacity
                            className="mr-4 bg-white/20 p-2 rounded-full"
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="white" />
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="bg-white/20 p-2 rounded-full"
                            onPress={() => navigation.navigate('Profile')}
                        >
                            {user?.profilePicture ? (
                                <StyledImage
                                    source={{ uri: user.profilePicture }}
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <Ionicons name="person-outline" size={24} color="white" />
                            )}
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
                {/* Quick Actions */}
                <StyledView className="px-4 py-4 bg-white">
                    <StyledView className="flex-row justify-between">
                        <StyledTouchableOpacity
                            className="items-center bg-primary-50 p-3 rounded-xl w-[31%]"
                            onPress={() => navigation.navigate('DiagnosisChat', { isNew: true })}
                        >
                            <Ionicons name="medkit" size={24} color="#1766da" />
                            <StyledText className="text-primary-700 text-xs font-medium mt-1">AI Diagnosis</StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="items-center bg-secondary-50 p-3 rounded-xl w-[31%]"
                            onPress={() => navigation.navigate('Appointments')}
                        >
                            <Ionicons name="calendar" size={24} color="#2d9d91" />
                            <StyledText className="text-secondary-700 text-xs font-medium mt-1">Appointments</StyledText>
                        </StyledTouchableOpacity>

                        <StyledTouchableOpacity
                            className="items-center bg-accent-50 p-3 rounded-xl w-[31%]"
                            onPress={() => navigation.navigate('UploadPrescription')}
                        >
                            <Ionicons name="document-text" size={24} color="#ff7d00" />
                            <StyledText className="text-accent-700 text-xs font-medium mt-1">Add Prescription</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>

                {/* Health Status */}
                {abnormalReadings.length > 0 && (
                    <StyledView className="px-4 py-2">
                        <Card elevation={1} className="border-l-4 border-l-error bg-red-50">
                            <StyledView className="flex-row items-start">
                                <Ionicons name="alert-circle" size={24} color="#ef4444" className="mr-2" />
                                <StyledView className="flex-1">
                                    <StyledText className="font-bold text-red-800">Attention Needed</StyledText>
                                    <StyledText className="text-red-700">
                                        You have {abnormalReadings.length} abnormal health {abnormalReadings.length === 1 ? 'reading' : 'readings'} that may require attention.
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                            <Button
                                title="View Details"
                                variant="error"
                                size="small"
                                onPress={() => navigation.navigate('HealthDashboard')}
                                className="mt-2 self-end"
                            />
                        </Card>
                    </StyledView>
                )}

                {/* Upcoming Appointment */}
                <StyledView className="px-4 py-2">
                    <StyledView className="flex-row justify-between items-center mb-2">
                        <StyledText className="text-lg font-bold text-neutral-800">Upcoming Appointments</StyledText>
                        <StyledTouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                            <StyledText className="text-primary-500">See All</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>

                    {upcomingAppointments.length === 0 ? (
                        <Card elevation={1} className="items-center py-6">
                            <Ionicons name="calendar-outline" size={40} color="#9ca3af" />
                            <StyledText className="text-neutral-500 mt-2">No upcoming appointments</StyledText>
                            <Button
                                title="View Past Appointments"
                                variant="outline"
                                size="small"
                                onPress={() => navigation.navigate('Appointments')}
                                className="mt-3"
                            />
                        </Card>
                    ) : (
                        upcomingAppointments.slice(0, 2).map((appointment) => (
                            <Card
                                key={appointment._id}
                                elevation={1}
                                className="mb-2"
                                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment._id })}
                            >
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-primary-100 rounded-lg p-3 mr-3">
                                        <Ionicons name="calendar" size={24} color="#1766da" />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="text-lg font-bold text-neutral-800">
                                            Dr. {appointment.doctorId?.name?.last || 'Doctor'}
                                        </StyledText>
                                        <StyledText className="text-neutral-600">
                                            {appointment.doctorId?.specialization || 'Specialist'}
                                        </StyledText>
                                        <StyledView className="flex-row items-center mt-1">
                                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                                            <StyledText className="text-neutral-500 ml-1">
                                                {formatDate(appointment.date)} • {appointment.time.start}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>

                                    <Badge
                                        text="Upcoming"
                                        variant="primary"
                                        size="small"
                                    />
                                </StyledView>
                            </Card>
                        ))
                    )}
                </StyledView>

                {/* Medication Reminders */}
                <StyledView className="px-4 py-2">
                    <StyledView className="flex-row justify-between items-center mb-2">
                        <StyledText className="text-lg font-bold text-neutral-800">Medication Reminders</StyledText>
                        <StyledTouchableOpacity onPress={() => navigation.navigate('Medications')}>
                            <StyledText className="text-primary-500">See All</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>

                    {upcomingMedications.length === 0 ? (
                        <Card elevation={1} className="items-center py-6">
                            <Ionicons name="medical-outline" size={40} color="#9ca3af" />
                            <StyledText className="text-neutral-500 mt-2">No upcoming medications</StyledText>
                            <Button
                                title="Add Prescription"
                                variant="outline"
                                size="small"
                                onPress={() => navigation.navigate('UploadPrescription')}
                                className="mt-3"
                            />
                        </Card>
                    ) : (
                        upcomingMedications.slice(0, 3).map((medication, index) => (
                            <Card
                                key={`${medication.medicationId}-${index}`}
                                elevation={1}
                                className="mb-2"
                                onPress={() => navigation.navigate('MedicationDetail', {
                                    medicationId: medication.medicationId,
                                    medicationIndex: medication.medicationIndex
                                })}
                            >
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-secondary-100 rounded-lg p-3 mr-3">
                                        <Ionicons name="medical" size={24} color="#2d9d91" />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="text-lg font-bold text-neutral-800">
                                            {medication.name}
                                        </StyledText>
                                        <StyledText className="text-neutral-600">
                                            {medication.dosage || 'Take as directed'}
                                        </StyledText>
                                        <StyledView className="flex-row items-center mt-1">
                                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                                            <StyledText className="text-neutral-500 ml-1">
                                                {formatTime(medication.scheduledTime)}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>

                                    <Button
                                        title="Take"
                                        variant="secondary"
                                        size="small"
                                        onPress={() => navigation.navigate('MedicationDetail', {
                                            medicationId: medication.medicationId,
                                            medicationIndex: medication.medicationIndex,
                                            action: 'take'
                                        })}
                                    />
                                </StyledView>
                            </Card>
                        ))
                    )}
                </StyledView>

                {/* Health Metrics */}
                <StyledView className="px-4 py-2 mb-4">
                    <StyledView className="flex-row justify-between items-center mb-2">
                        <StyledText className="text-lg font-bold text-neutral-800">Health Overview</StyledText>
                        <StyledTouchableOpacity onPress={() => navigation.navigate('HealthDashboard')}>
                            <StyledText className="text-primary-500">See Details</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>

                    <Card elevation={1}>
                        <StyledView className="flex-row flex-wrap justify-between">
                            <StyledView className="w-[48%] bg-primary-50 rounded-lg p-3 mb-3">
                                <StyledText className="text-neutral-600 text-xs">Heart Rate</StyledText>
                                <StyledText className="text-2xl font-bold text-primary-800">
                                    {healthMetrics?.heart_rate?.data?.slice(-1)[0]?.value || '--'}
                                    <StyledText className="text-base font-normal">bpm</StyledText>
                                </StyledText>
                                {healthMetrics?.heart_rate?.trend && (
                                    <StyledView className="flex-row items-center mt-1">
                                        <Ionicons
                                            name={getTrendIcon(healthMetrics.heart_rate.trend)}
                                            size={16}
                                            color={getTrendColor(healthMetrics.heart_rate.trend)}
                                        />
                                        <StyledText className={`text-xs ml-1 ${getTrendTextColor(healthMetrics.heart_rate.trend)}`}>
                                            {formatTrend(healthMetrics.heart_rate.trend)}
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledView>

                            <StyledView className="w-[48%] bg-secondary-50 rounded-lg p-3 mb-3">
                                <StyledText className="text-neutral-600 text-xs">Blood Pressure</StyledText>
                                <StyledText className="text-2xl font-bold text-secondary-800">
                                    {healthMetrics?.blood_pressure?.data?.slice(-1)[0]?.value?.systolic || '--'}/
                                    {healthMetrics?.blood_pressure?.data?.slice(-1)[0]?.value?.diastolic || '--'}
                                </StyledText>
                                {healthMetrics?.blood_pressure?.systolic?.trend && (
                                    <StyledView className="flex-row items-center mt-1">
                                        <Ionicons
                                            name={getTrendIcon(healthMetrics.blood_pressure.systolic.trend)}
                                            size={16}
                                            color={getTrendColor(healthMetrics.blood_pressure.systolic.trend)}
                                        />
                                        <StyledText className={`text-xs ml-1 ${getTrendTextColor(healthMetrics.blood_pressure.systolic.trend)}`}>
                                            {formatTrend(healthMetrics.blood_pressure.systolic.trend)}
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledView>

                            <StyledView className="w-[48%] bg-accent-50 rounded-lg p-3">
                                <StyledText className="text-neutral-600 text-xs">Blood Glucose</StyledText>
                                <StyledText className="text-2xl font-bold text-accent-800">
                                    {healthMetrics?.glucose?.data?.slice(-1)[0]?.value || '--'}
                                    <StyledText className="text-base font-normal">mg/dL</StyledText>
                                </StyledText>
                                {healthMetrics?.glucose?.trend && (
                                    <StyledView className="flex-row items-center mt-1">
                                        <Ionicons
                                            name={getTrendIcon(healthMetrics.glucose.trend)}
                                            size={16}
                                            color={getTrendColor(healthMetrics.glucose.trend)}
                                        />
                                        <StyledText className={`text-xs ml-1 ${getTrendTextColor(healthMetrics.glucose.trend)}`}>
                                            {formatTrend(healthMetrics.glucose.trend)}
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledView>

                            <StyledView className="w-[48%] bg-blue-50 rounded-lg p-3">
                                <StyledText className="text-neutral-600 text-xs">Oxygen Saturation</StyledText>
                                <StyledText className="text-2xl font-bold text-blue-800">
                                    {healthMetrics?.oxygen?.data?.slice(-1)[0]?.value || '--'}
                                    <StyledText className="text-base font-normal">%</StyledText>
                                </StyledText>
                                {healthMetrics?.oxygen?.trend && (
                                    <StyledView className="flex-row items-center mt-1">
                                        <Ionicons
                                            name={getTrendIcon(healthMetrics.oxygen.trend)}
                                            size={16}
                                            color={getTrendColor(healthMetrics.oxygen.trend)}
                                        />
                                        <StyledText className={`text-xs ml-1 ${getTrendTextColor(healthMetrics.oxygen.trend)}`}>
                                            {formatTrend(healthMetrics.oxygen.trend)}
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledView>
                        </StyledView>

                        <Button
                            title="Record New Measurement"
                            variant="outline"
                            icon={<Ionicons name="add" size={16} color="#1766da" />}
                            onPress={() => navigation.navigate('HealthMetrics')}
                            className="mt-3"
                            fullWidth
                        />
                    </Card>
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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getTrendIcon = (trend) => {
    switch (trend) {
        case 'increasing':
            return 'arrow-up';
        case 'decreasing':
            return 'arrow-down';
        default:
            return 'remove';
    }
};

const getTrendColor = (trend) => {
    switch (trend) {
        case 'increasing':
            return '#ef4444';
        case 'decreasing':
            return '#10b981';
        default:
            return '#6b7280';
    }
};

const getTrendTextColor = (trend) => {
    switch (trend) {
        case 'increasing':
            return 'text-red-600';
        case 'decreasing':
            return 'text-green-600';
        default:
            return 'text-neutral-500';
    }
};

const formatTrend = (trend) => {
    return trend.charAt(0).toUpperCase() + trend.slice(1);
};

export default HomeScreen;