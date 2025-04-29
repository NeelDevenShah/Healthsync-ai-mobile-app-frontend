import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorPatientDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { patientId } = route.params;

    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);

    useEffect(() => {
        const loadPatientData = async () => {
            try {
                setLoading(true);

                // In a real implementation, we would have an endpoint to get patient details
                // For now, we'll simulate it by filtering from all patients
                const patientsResponse = await doctorApi.getDoctorPatients();
                const patients = patientsResponse.data || [];
                const foundPatient = patients.find(p => p._id === patientId);

                if (foundPatient) {
                    setPatient(foundPatient);

                    // Load patient's appointments
                    const appointmentsResponse = await doctorApi.getDoctorAppointments({
                        patientId: patientId
                    });
                    setAppointments(appointmentsResponse.data || []);

                    // Load patient's diagnoses
                    // In a real implementation, we'd have an endpoint for this
                    // For now, we'll leave it empty
                    setDiagnoses([]);
                } else {
                    Alert.alert('Error', 'Patient not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading patient data:', error);
                Alert.alert('Error', 'Failed to load patient details. Please try again.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [patientId, navigation]);

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading patient details..." />;
    }

    if (!patient) {
        return (
            <StyledView className="flex-1 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
                <StyledText className="text-lg text-neutral-600 mt-4 text-center">
                    Patient information not available.
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
                        Patient Profile
                    </StyledText>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Patient Summary */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-4">
                        <StyledView className="bg-primary-100 rounded-full p-4 mr-4">
                            <Ionicons name="person" size={32} color="#1766da" />
                        </StyledView>

                        <StyledView className="flex-1">
                            <StyledText className="text-2xl font-bold text-neutral-800">
                                {patient.name.first} {patient.name.last}
                            </StyledText>

                            <StyledView className="flex-row flex-wrap mt-1">
                                {patient.gender && (
                                    <StyledView className="flex-row items-center mr-4">
                                        <Ionicons name={patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'person'} size={16} color="#6b7280" />
                                        <StyledText className="text-neutral-500 ml-1">
                                            {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                                        </StyledText>
                                    </StyledView>
                                )}

                                {patient.dateOfBirth && (
                                    <StyledView className="flex-row items-center mr-4">
                                        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                        <StyledText className="text-neutral-500 ml-1">
                                            {calculateAge(patient.dateOfBirth)} years
                                        </StyledText>
                                    </StyledView>
                                )}

                                {patient.phone && (
                                    <StyledView className="flex-row items-center">
                                        <Ionicons name="call-outline" size={16} color="#6b7280" />
                                        <StyledText className="text-neutral-500 ml-1">
                                            {patient.phone}
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledView>
                        </StyledView>
                    </StyledView>

                    <Button
                        title="Schedule Appointment"
                        variant="primary"
                        icon={<Ionicons name="calendar" size={16} color="white" />}
                        onPress={() => navigation.navigate('DoctorAppointmentsTab', { screen: 'DoctorCreateAppointment', params: { patientId: patient._id } })}
                        fullWidth
                    />
                </Card>

                {/* Medical History */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="fitness" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Medical History
                        </StyledText>
                    </StyledView>

                    {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                        patient.medicalHistory.map((condition, index) => (
                            <StyledView
                                key={`condition-${index}`}
                                className="py-2 border-b border-neutral-100 last:border-b-0"
                            >
                                <StyledText className="font-medium text-neutral-800">
                                    {condition.condition}
                                </StyledText>
                                {condition.diagnosedDate && (
                                    <StyledText className="text-neutral-500 text-sm">
                                        Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                                    </StyledText>
                                )}
                                {condition.notes && (
                                    <StyledText className="text-neutral-700 text-sm mt-1">
                                        {condition.notes}
                                    </StyledText>
                                )}
                            </StyledView>
                        ))
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No medical history recorded.
                        </StyledText>
                    )}
                </Card>

                {/* Allergies */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="alert-circle" size={20} color="#ef4444" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Allergies
                        </StyledText>
                    </StyledView>

                    {patient.allergies && patient.allergies.length > 0 ? (
                        <StyledView className="flex-row flex-wrap">
                            {patient.allergies.map((allergy, index) => (
                                <StyledView
                                    key={`allergy-${index}`}
                                    className="bg-red-100 py-1 px-3 rounded-full mr-2 mb-2"
                                >
                                    <StyledText className="text-red-700">
                                        {allergy}
                                    </StyledText>
                                </StyledView>
                            ))}
                        </StyledView>
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No allergies recorded.
                        </StyledText>
                    )}
                </Card>

                {/* Health Metrics */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="stats-chart" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Health Metrics
                        </StyledText>
                    </StyledView>

                    {patient.healthMetrics ? (
                        <StyledView>
                            {patient.healthMetrics.height && (
                                <StyledView className="flex-row justify-between py-1">
                                    <StyledText className="text-neutral-600">Height:</StyledText>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {patient.healthMetrics.height} cm
                                    </StyledText>
                                </StyledView>
                            )}

                            {patient.healthMetrics.weight && (
                                <StyledView className="flex-row justify-between py-1">
                                    <StyledText className="text-neutral-600">Weight:</StyledText>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {patient.healthMetrics.weight} kg
                                    </StyledText>
                                </StyledView>
                            )}

                            {patient.healthMetrics.bloodType && (
                                <StyledView className="flex-row justify-between py-1">
                                    <StyledText className="text-neutral-600">Blood Type:</StyledText>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {patient.healthMetrics.bloodType}
                                    </StyledText>
                                </StyledView>
                            )}
                        </StyledView>
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No health metrics recorded.
                        </StyledText>
                    )}
                </Card>

                {/* Recent Appointments */}
                <Card className="mb-4">
                    <StyledView className="flex-row justify-between items-center mb-2">
                        <StyledView className="flex-row items-center">
                            <Ionicons name="calendar" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Recent Appointments
                            </StyledText>
                        </StyledView>

                        <StyledTouchableOpacity
                            onPress={() => navigation.navigate('DoctorAppointmentsTab', { screen: 'DoctorAppointmentsList', params: { patientId: patient._id } })}
                        >
                            <StyledText className="text-primary-500">See All</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>

                    {appointments.length > 0 ? (
                        appointments.slice(0, 3).map((appointment) => (
                            <StyledTouchableOpacity
                                key={appointment._id}
                                className="flex-row items-center py-2 border-b border-neutral-100 last:border-b-0"
                                onPress={() => navigation.navigate('DoctorAppointmentsTab', { screen: 'DoctorAppointmentDetail', params: { appointmentId: appointment._id } })}
                            >
                                <StyledView className={`
                  w-10 h-10 rounded-full items-center justify-center mr-3
                  ${getAppointmentStatusColor(appointment.status)}
                `}>
                                    <Ionicons
                                        name={getAppointmentStatusIcon(appointment.status)}
                                        size={18}
                                        color={getAppointmentStatusIconColor(appointment.status)}
                                    />
                                </StyledView>

                                <StyledView className="flex-1">
                                    <StyledText className="font-medium text-neutral-800">
                                        {new Date(appointment.date).toLocaleDateString()}
                                    </StyledText>
                                    <StyledText className="text-neutral-500 text-sm">
                                        {appointment.time.start} • {formatStatus(appointment.status)}
                                    </StyledText>
                                </StyledView>

                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </StyledTouchableOpacity>
                        ))
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No appointments found.
                        </StyledText>
                    )}

                    <Button
                        title="Schedule New Appointment"
                        variant="outline"
                        onPress={() => navigation.navigate('DoctorAppointmentsTab', { screen: 'DoctorCreateAppointment', params: { patientId: patient._id } })}
                        className="mt-3"
                        fullWidth
                    />
                </Card>

                {/* Actions */}
                <StyledView className="flex-row mb-6">
                    <Button
                        title="Send Message"
                        variant="outline"
                        icon={<Ionicons name="mail-outline" size={16} color="#1766da" />}
                        onPress={() => {
                            // In a real implementation, this would open a messaging interface
                            Alert.alert('Feature', 'Messaging functionality would be implemented here');
                        }}
                        className="flex-1 mr-2"
                    />

                    <Button
                        title="View Reports"
                        variant="outline"
                        icon={<Ionicons name="document-text-outline" size={16} color="#1766da" />}
                        onPress={() => {
                            // Navigate to reports screen filtered for this patient
                            navigation.navigate('DoctorHomeTab', { screen: "DoctorReports" });
                        }}
                        className="flex-1 ml-2"
                    />
                </StyledView>
            </StyledScrollView>
        </StyledView>
    );
};

// Helper functions
const calculateAge = (birthDate) => {
    if (!birthDate) return '';

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
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

export default DoctorPatientDetailScreen;