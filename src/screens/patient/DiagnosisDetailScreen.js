import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as diagnosisApi from '../../api/diagnosis';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DiagnosisDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { diagnosisId } = route.params;

    const [loading, setLoading] = useState(true);
    const [diagnosis, setDiagnosis] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        const loadDiagnosis = async () => {
            try {
                setLoading(true);
                const response = await diagnosisApi.getDiagnosis(diagnosisId);
                setDiagnosis(response.data);

                // Set selected doctor if available
                if (response.data.finalDoctorId) {
                    setSelectedDoctor(response.data.finalDoctorId);
                } else if (response.data.suggestedDoctor?.doctorId) {
                    setSelectedDoctor(response.data.suggestedDoctor.doctorId);
                }
            } catch (error) {
                console.error('Error loading diagnosis:', error);
                Alert.alert('Error', 'Failed to load diagnosis details. Please try again.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadDiagnosis();
    }, [diagnosisId, navigation]);

    const handleSelectDoctor = async () => {
        if (!diagnosis || !selectedDoctor) return;

        try {
            setLoading(true);
            await diagnosisApi.selectDoctor(diagnosisId, selectedDoctor._id);
            // Refresh diagnosis data
            const response = await diagnosisApi.getDiagnosis(diagnosisId);
            setDiagnosis(response.data);
            Alert.alert('Success', 'Doctor selection confirmed.');
        } catch (error) {
            console.error('Error selecting doctor:', error);
            Alert.alert('Error', 'Failed to select doctor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading diagnosis details..." />;
    }

    if (!diagnosis) {
        return (
            <StyledView className="flex-1 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
                <StyledText className="text-lg text-neutral-600 mt-4 text-center">
                    Diagnosis information not available.
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
                    <StyledText className="text-lg font-bold text-neutral-800">
                        Diagnosis Summary
                    </StyledText>
                    <StyledText className="text-sm text-neutral-500">
                        {new Date(diagnosis.createdAt).toLocaleDateString()}
                    </StyledText>
                </StyledView>

                <Badge
                    text={formatStatus(diagnosis.status)}
                    variant={getStatusVariant(diagnosis.status)}
                    size="medium"
                />
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* AI Summary */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="medkit" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            AI Assessment
                        </StyledText>
                    </StyledView>

                    {diagnosis.aiSummary ? (
                        <StyledText className="text-neutral-700">
                            {diagnosis.aiSummary}
                        </StyledText>
                    ) : (
                        <StyledView className="items-center py-4">
                            <StyledText className="text-neutral-500 text-center">
                                No summary available. Complete the diagnosis chat to get an AI assessment.
                            </StyledText>
                            <Button
                                title="Back to Chat"
                                variant="outline"
                                size="small"
                                onPress={() => navigation.navigate('DiagnosisChat', { diagnosisId })}
                                className="mt-3"
                            />
                        </StyledView>
                    )}
                </Card>

                {/* Recommended Tests */}
                {diagnosis.suggestedTests && diagnosis.suggestedTests.length > 0 && (
                    <Card className="mb-4">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="clipboard" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Recommended Tests
                            </StyledText>
                        </StyledView>

                        {diagnosis.suggestedTests.map((test, index) => (
                            <StyledView
                                key={`test-${index}`}
                                className="py-2 px-2 mb-2 border-b border-neutral-100 last:border-b-0"
                            >
                                <StyledView className="flex-row justify-between">
                                    <StyledText className="font-bold text-neutral-800">
                                        {test.name}
                                    </StyledText>
                                    <Badge
                                        text={test.isApproved ? 'Approved' : 'Pending'}
                                        variant={test.isApproved ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </StyledView>
                                {test.reason && (
                                    <StyledText className="text-neutral-600 text-sm mt-1">
                                        {test.reason}
                                    </StyledText>
                                )}
                                <StyledView className="flex-row mt-2">
                                    <Badge
                                        text={`Priority: ${test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}`}
                                        variant={getPriorityVariant(test.priority)}
                                        size="small"
                                    />
                                </StyledView>
                            </StyledView>
                        ))}

                        {diagnosis.status === 'pending_reports' && (
                            <Button
                                title="Upload Test Reports"
                                variant="primary"
                                icon={<Ionicons name="cloud-upload-outline" size={16} color="white" />}
                                onPress={() => navigation.navigate('Appointments', { screen: 'UploadReport', params: { diagnosisId } })}
                                className="mt-3"
                                fullWidth
                            />
                        )}
                    </Card>
                )}

                {/* Doctor Recommendation */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="person" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Recommended Doctor
                        </StyledText>
                    </StyledView>

                    {diagnosis.suggestedDoctor ? (
                        <StyledView>
                            <StyledView className="p-3 bg-primary-50 rounded-lg mb-3">
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
                                        <Ionicons name="person" size={24} color="#1766da" />
                                    </StyledView>
                                    <StyledView className="flex-1">
                                        <StyledText className="font-bold text-neutral-800">
                                            Dr. {diagnosis.suggestedDoctor.doctorId?.name?.first} {diagnosis.suggestedDoctor.doctorId?.name?.last}
                                        </StyledText>
                                        <StyledText className="text-neutral-600">
                                            {diagnosis.suggestedDoctor.doctorId?.specialization}
                                        </StyledText>
                                    </StyledView>
                                    {diagnosis.suggestedDoctor.isConfirmed && (
                                        <Badge
                                            text="Confirmed"
                                            variant="success"
                                            size="small"
                                        />
                                    )}
                                </StyledView>
                                {diagnosis.suggestedDoctor.reason && (
                                    <StyledText className="text-neutral-700 mt-2 text-sm">
                                        <StyledText className="font-bold">Reason: </StyledText>
                                        {diagnosis.suggestedDoctor.reason}
                                    </StyledText>
                                )}
                            </StyledView>

                            {!diagnosis.suggestedDoctor.isConfirmed && diagnosis.status === 'pending_doctor_review' && (
                                <Button
                                    title="Confirm Doctor Selection"
                                    variant="primary"
                                    onPress={handleSelectDoctor}
                                    fullWidth
                                />
                            )}
                        </StyledView>
                    ) : diagnosis.finalDoctorId ? (
                        <StyledView className="p-3 bg-primary-50 rounded-lg">
                            <StyledView className="flex-row items-center">
                                <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
                                    <Ionicons name="person" size={24} color="#1766da" />
                                </StyledView>
                                <StyledView className="flex-1">
                                    <StyledText className="font-bold text-neutral-800">
                                        Dr. {diagnosis.finalDoctorId?.name?.first} {diagnosis.finalDoctorId?.name?.last}
                                    </StyledText>
                                    <StyledText className="text-neutral-600">
                                        {diagnosis.finalDoctorId?.specialization}
                                    </StyledText>
                                </StyledView>
                                <Badge
                                    text="Selected"
                                    variant="success"
                                    size="small"
                                />
                            </StyledView>
                        </StyledView>
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No doctor has been recommended yet.
                        </StyledText>
                    )}
                </Card>

                {/* Associated Appointment */}
                {diagnosis.associatedAppointmentId && (
                    <Card className="mb-4">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="calendar" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Appointment
                            </StyledText>
                        </StyledView>

                        <Button
                            title="View Appointment Details"
                            variant="outline"
                            icon={<Ionicons name="calendar-outline" size={16} color="#1766da" />}
                            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: diagnosis.associatedAppointmentId })}
                            fullWidth
                        />
                    </Card>
                )}

                {/* Actions */}
                <StyledView className="flex-row justify-between mb-6">
                    <Button
                        title="Back to Chat"
                        variant="outline"
                        icon={<Ionicons name="chatbubble-outline" size={16} color="#1766da" />}
                        onPress={() => navigation.navigate('DiagnosisChat', { diagnosisId })}
                        className="flex-1 mr-2"
                    />

                    {diagnosis.status === 'pending_reports' && (
                        <Button
                            title="Upload Reports"
                            variant="primary"
                            icon={<Ionicons name="cloud-upload-outline" size={16} color="white" />}
                            onPress={() => navigation.navigate('Appointments', { screen: 'UploadReport', params: { diagnosisId } })}
                            className="flex-1 ml-2"
                        />
                    )}
                </StyledView>
            </StyledScrollView>
        </StyledView>
    );
};

// Helper functions
const formatStatus = (status) => {
    switch (status) {
        case 'ongoing':
            return 'Ongoing';
        case 'pending_doctor_review':
            return 'Pending Review';
        case 'pending_reports':
            return 'Needs Reports';
        case 'completed':
            return 'Completed';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
};

const getStatusVariant = (status) => {
    switch (status) {
        case 'ongoing':
            return 'primary';
        case 'pending_doctor_review':
            return 'warning';
        case 'pending_reports':
            return 'info';
        case 'completed':
            return 'success';
        default:
            return 'neutral';
    }
};

const getPriorityVariant = (priority) => {
    switch (priority) {
        case 'high':
            return 'error';
        case 'medium':
            return 'warning';
        case 'low':
            return 'info';
        default:
            return 'neutral';
    }
};

export default DiagnosisDetailScreen;