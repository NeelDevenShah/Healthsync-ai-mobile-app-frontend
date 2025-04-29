import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as appointmentApi from '../../api/appointment';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorAppointmentDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { appointmentId } = route.params;

    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState(null);
    const [postNotes, setPostNotes] = useState('');
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [followUpNotes, setFollowUpNotes] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);

    useEffect(() => {
        const loadAppointment = async () => {
            try {
                setLoading(true);
                const response = await appointmentApi.getAppointment(appointmentId);

                const appointmentData = response.data;
                setAppointment(appointmentData);

                // Pre-populate post notes if available
                if (appointmentData.notes?.postAppointment) {
                    setPostNotes(appointmentData.notes.postAppointment);
                }
            } catch (error) {
                console.error('Error loading appointment:', error);
                Alert.alert('Error', 'Failed to load appointment details. Please try again.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId, navigation]);

    const handleCompleteAppointment = async () => {
        try {
            setLoading(true);

            const completionData = {
                notes: postNotes,
                // If follow-up is needed
                followUp: followUpNotes ? {
                    create: true,
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week later
                    time: {
                        start: appointment.time.start,
                        end: appointment.time.end
                    },
                    notes: followUpNotes
                } : null
            };

            await appointmentApi.completeAppointment(appointmentId, completionData);

            Alert.alert(
                'Appointment Completed',
                'The appointment has been marked as completed.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error completing appointment:', error);
            Alert.alert('Error', 'Failed to complete appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!cancelReason) {
            Alert.alert('Error', 'Please provide a reason for cancellation');
            return;
        }

        try {
            setLoading(true);

            await appointmentApi.cancelAppointment(appointmentId, cancelReason);

            Alert.alert(
                'Appointment Cancelled',
                'The appointment has been cancelled successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading appointment details..." />;
    }

    if (!appointment) {
        return (
            <StyledView className="flex-1 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
                <StyledText className="text-lg text-neutral-600 mt-4 text-center">
                    Appointment information not available.
                </StyledText>
                <Button
                    title="Go Back"
                    onPress={() => navigation.goBack()}
                    className="mt-4"
                />
            </StyledView>
        );
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
                        Appointment Details
                    </StyledText>
                </StyledView>

                <Badge
                    text={formatStatus(appointment.status)}
                    variant={getStatusVariant(appointment.status)}
                    size="medium"
                />
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Patient Info */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="person" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Patient Information
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-neutral-800 font-medium">
                        {appointment.patientId?.name?.first} {appointment.patientId?.name?.last}
                    </StyledText>

                    <Button
                        title="View Patient Details"
                        variant="outline"
                        size="small"
                        onPress={() => navigation.navigate('DoctorPatientDetail', { patientId: appointment.patientId._id })}
                        className="mt-3 self-end"
                    />
                </Card>

                {/* Appointment Info */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="calendar" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Appointment Details
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row mb-2">
                        <StyledText className="text-neutral-600 w-20">Date:</StyledText>
                        <StyledText className="text-neutral-800 font-medium">
                            {formatDate(appointment.date)}
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row mb-2">
                        <StyledText className="text-neutral-600 w-20">Time:</StyledText>
                        <StyledText className="text-neutral-800 font-medium">
                            {appointment.time.start} to {appointment.time.end || calculateEndTime(appointment.time.start, 30)}
                        </StyledText>
                    </StyledView>

                    {appointment.notes?.preAppointment && (
                        <StyledView className="flex-row mb-2">
                            <StyledText className="text-neutral-600 w-20">Notes:</StyledText>
                            <StyledText className="text-neutral-800 flex-1">
                                {appointment.notes.preAppointment}
                            </StyledText>
                        </StyledView>
                    )}

                    {appointment.diagnosisId && (
                        <Button
                            title="View Associated Diagnosis"
                            variant="outline"
                            size="small"
                            icon={<Ionicons name="medkit-outline" size={16} color="#1766da" />}
                            onPress={() => navigation.navigate('DoctorDiagnosisDetail', { diagnosisId: appointment.diagnosisId })}
                            className="mt-2"
                            fullWidth
                        />
                    )}
                </Card>

                {/* Required Tests/Reports */}
                {appointment.requiredReports && appointment.requiredReports.length > 0 && (
                    <Card className="mb-4">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="document-text" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Required Reports
                            </StyledText>
                        </StyledView>

                        {appointment.requiredReports.map((report, index) => (
                            <StyledTouchableOpacity
                                key={`report-${index}`}
                                className="flex-row items-center justify-between py-2 border-b border-neutral-100 last:border-b-0"
                                onPress={() => navigation.navigate('DoctorReportDetail', { reportId: report._id })}
                            >
                                <StyledView className="flex-row items-center">
                                    <Ionicons
                                        name={getReportTypeIcon(report.type)}
                                        size={20}
                                        color="#6b7280"
                                        className="mr-2"
                                    />
                                    <StyledText className="text-neutral-700">
                                        {report.name}
                                    </StyledText>
                                </StyledView>

                                <Badge
                                    text={report.isReviewed ? "Reviewed" : "Pending"}
                                    variant={report.isReviewed ? "success" : "warning"}
                                    size="small"
                                />
                            </StyledTouchableOpacity>
                        ))}
                    </Card>
                )}

                {/* Completion Form */}
                {appointment.status === 'scheduled' && (
                    <>
                        {showCompleteForm ? (
                            <Card className="mb-4">
                                <StyledView className="flex-row items-center mb-2">
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                    <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                        Complete Appointment
                                    </StyledText>
                                </StyledView>

                                <Input
                                    placeholder="Add notes about this appointment..."
                                    value={postNotes}
                                    onChangeText={setPostNotes}
                                    multiline
                                    numberOfLines={4}
                                    className="mb-3"
                                />

                                <StyledText className="font-medium text-neutral-800 mb-2">
                                    Is a follow-up appointment needed?
                                </StyledText>

                                <Input
                                    placeholder="Specify reason for follow-up (leave empty if not needed)"
                                    value={followUpNotes}
                                    onChangeText={setFollowUpNotes}
                                    multiline
                                    numberOfLines={2}
                                    className="mb-3"
                                />

                                <StyledView className="flex-row justify-between">
                                    <Button
                                        title="Cancel"
                                        variant="outline"
                                        onPress={() => setShowCompleteForm(false)}
                                        className="flex-1 mr-2"
                                    />

                                    <Button
                                        title="Complete Appointment"
                                        variant="success"
                                        onPress={handleCompleteAppointment}
                                        className="flex-1 ml-2"
                                    />
                                </StyledView>
                            </Card>
                        ) : showCancelForm ? (
                            <Card className="mb-4">
                                <StyledView className="flex-row items-center mb-2">
                                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                                    <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                        Cancel Appointment
                                    </StyledText>
                                </StyledView>

                                <Input
                                    placeholder="Reason for cancellation..."
                                    value={cancelReason}
                                    onChangeText={setCancelReason}
                                    multiline
                                    numberOfLines={3}
                                    className="mb-3"
                                />

                                <StyledText className="text-sm text-neutral-500 mb-3">
                                    The patient will be notified about this cancellation.
                                </StyledText>

                                <StyledView className="flex-row justify-between">
                                    <Button
                                        title="Back"
                                        variant="outline"
                                        onPress={() => setShowCancelForm(false)}
                                        className="flex-1 mr-2"
                                    />

                                    <Button
                                        title="Confirm Cancellation"
                                        variant="error"
                                        onPress={handleCancelAppointment}
                                        className="flex-1 ml-2"
                                    />
                                </StyledView>
                            </Card>
                        ) : (
                            <StyledView className="flex-row mb-6">
                                <Button
                                    title="Complete"
                                    variant="success"
                                    icon={<Ionicons name="checkmark" size={16} color="white" />}
                                    onPress={() => {
                                        setShowCompleteForm(true);
                                        setShowCancelForm(false);
                                    }}
                                    className="flex-1 mr-2"
                                />

                                <Button
                                    title="Cancel Appointment"
                                    variant="error"
                                    icon={<Ionicons name="close" size={16} color="white" />}
                                    onPress={() => {
                                        setShowCancelForm(true);
                                        setShowCompleteForm(false);
                                    }}
                                    className="flex-1 ml-2"
                                />
                            </StyledView>
                        )}
                    </>
                )}

                {/* Completed Details */}
                {appointment.status === 'completed' && (
                    <Card className="mb-6">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Completion Details
                            </StyledText>
                        </StyledView>

                        <StyledView className="flex-row mb-2">
                            <StyledText className="text-neutral-600 w-28">Completed on:</StyledText>
                            <StyledText className="text-neutral-800">
                                {appointment.checkedInAt ? formatDateTime(appointment.checkedInAt) : 'Not recorded'}
                            </StyledText>
                        </StyledView>

                        {appointment.notes?.postAppointment && (
                            <StyledView className="mb-2">
                                <StyledText className="text-neutral-600 mb-1">Notes:</StyledText>
                                <StyledText className="text-neutral-800 bg-neutral-50 p-2 rounded-md">
                                    {appointment.notes.postAppointment}
                                </StyledText>
                            </StyledView>
                        )}

                        {appointment.followupAppointmentId && (
                            <Button
                                title="View Follow-up Appointment"
                                variant="outline"
                                icon={<Ionicons name="calendar-outline" size={16} color="#1766da" />}
                                onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointmentId: appointment.followupAppointmentId })}
                                className="mt-2"
                                fullWidth
                            />
                        )}
                    </Card>
                )}

                {/* Cancellation Details */}
                {appointment.status === 'cancelled' && (
                    <Card className="mb-6">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Cancellation Details
                            </StyledText>
                        </StyledView>

                        <StyledView className="flex-row mb-2">
                            <StyledText className="text-neutral-600 w-28">Cancelled by:</StyledText>
                            <StyledText className="text-neutral-800">
                                {appointment.cancelledBy === appointment.patientId._id ? 'Patient' : 'Doctor'}
                            </StyledText>
                        </StyledView>

                        {appointment.cancelReason && (
                            <StyledView className="mb-2">
                                <StyledText className="text-neutral-600 mb-1">Reason:</StyledText>
                                <StyledText className="text-neutral-800 bg-neutral-50 p-2 rounded-md">
                                    {appointment.cancelReason}
                                </StyledText>
                            </StyledView>
                        )}

                        <Button
                            title="Reschedule Appointment"
                            variant="primary"
                            onPress={() => navigation.navigate('DoctorCreateAppointment', {
                                patientId: appointment.patientId._id,
                                diagnosisId: appointment.diagnosisId
                            })}
                            className="mt-2"
                            fullWidth
                        />
                    </Card>
                )}
            </StyledScrollView>
        </StyledView>
    );
};

// Helper functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);

    let endHours = hours;
    let endMinutes = minutes + durationMinutes;

    if (endMinutes >= 60) {
        endHours += Math.floor(endMinutes / 60);
        endMinutes %= 60;
    }

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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

const getReportTypeIcon = (type) => {
    if (!type) return 'document-text';

    type = type.toLowerCase();

    if (type.includes('blood') || type.includes('cbc')) {
        return 'water';
    } else if (type.includes('x-ray') || type.includes('xray') || type.includes('scan') || type.includes('mri') || type.includes('ct')) {
        return 'scan';
    } else if (type.includes('cardio') || type.includes('ecg') || type.includes('ekg') || type.includes('heart')) {
        return 'heart';
    } else if (type.includes('urinalysis') || type.includes('urine')) {
        return 'flask';
    } else {
        return 'document-text';
    }
};

export default DoctorAppointmentDetailScreen;