import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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

const MedicationDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { medicationId, medicationIndex = 0, action } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [medication, setMedication] = useState(null);
    const [selectedMedicationIndex, setSelectedMedicationIndex] = useState(parseInt(medicationIndex, 10));
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadMedication = async () => {
            try {
                setLoading(true);
                const response = await medicationApi.getMedication(medicationId);
                setMedication(response.data);

                // If action is 'take', show take medication dialog
                if (action === 'take') {
                    setTimeout(() => {
                        handleTakeMedicationPrompt();
                    }, 500);
                }
            } catch (error) {
                console.error('Error loading medication details:', error);
                Alert.alert('Error', 'Failed to load medication details. Please try again.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadMedication();
    }, [medicationId, medicationIndex, action, navigation]);

    const handleTakeMedicationPrompt = () => {
        const med = medication.medications[selectedMedicationIndex];

        // Find next untaken dose
        const nextDoseIndex = med.schedule.findIndex(dose => !dose.taken);

        if (nextDoseIndex === -1) {
            Alert.alert(
                'No Pending Doses',
                'You have already taken all scheduled doses for this medication today.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Take Medication',
            `Are you taking your ${med.name} ${med.dosage} now?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Yes, Take Now',
                    onPress: () => handleTakeMedication(nextDoseIndex)
                }
            ]
        );
    };

    const handleTakeMedication = async (scheduleIndex) => {
        try {
            setProcessing(true);

            // Call API to mark medication as taken
            const response = await medicationApi.markMedicationTaken(
                medicationId,
                selectedMedicationIndex,
                scheduleIndex
            );

            // Update local state
            setMedication(response.data);

            // Show success message
            Alert.alert(
                'Medication Taken',
                'Your medication has been marked as taken. Keep up the good work!',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error marking medication as taken:', error);
            Alert.alert('Error', 'Failed to mark medication as taken. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading medication details..." />;
    }

    if (!medication || !medication.medications || medication.medications.length === 0) {
        return (
            <StyledView className="flex-1 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
                <StyledText className="text-lg text-neutral-600 mt-4 text-center">
                    Medication information not available.
                </StyledText>
                <Button
                    title="Go Back"
                    onPress={() => navigation.goBack()}
                    className="mt-4"
                />
            </StyledView>
        );
    }

    const selectedMedication = medication.medications[selectedMedicationIndex];

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
                        Medication Details
                    </StyledText>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Medication Summary */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <StyledView className="bg-secondary-100 p-3 rounded-lg mr-3">
                            <Ionicons name="medical" size={24} color="#2d9d91" />
                        </StyledView>

                        <StyledView className="flex-1">
                            <StyledText className="text-2xl font-bold text-neutral-800">
                                {selectedMedication.name}
                            </StyledText>
                            <StyledText className="text-neutral-600">
                                {selectedMedication.dosage || 'Take as directed'}
                            </StyledText>
                        </StyledView>

                        <Badge
                            text={`${Math.round(medication.adherenceRate)}% Adherence`}
                            variant={getAdherenceVariant(medication.adherenceRate)}
                            size="small"
                        />
                    </StyledView>

                    {medication.medications.length > 1 && (
                        <StyledScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-2">
                            {medication.medications.map((med, index) => (
                                <StyledTouchableOpacity
                                    key={`med-${index}`}
                                    className={`
                    px-3 py-2 mx-2 rounded-lg
                    ${selectedMedicationIndex === index ? 'bg-secondary-100 border border-secondary-200' : 'bg-neutral-100 border border-neutral-200'}
                  `}
                                    onPress={() => setSelectedMedicationIndex(index)}
                                >
                                    <StyledText className={`font-medium ${selectedMedicationIndex === index ? 'text-secondary-800' : 'text-neutral-800'}`}>
                                        {med.name}
                                    </StyledText>
                                </StyledTouchableOpacity>
                            ))}
                        </StyledScrollView>
                    )}

                    <StyledView className="border-t border-neutral-100 pt-3 mt-1">
                        <StyledView className="flex-row justify-between mb-2">
                            <StyledText className="text-neutral-600">Frequency:</StyledText>
                            <StyledText className="text-neutral-800 font-medium">
                                {selectedMedication.frequency || 'As directed'}
                            </StyledText>
                        </StyledView>

                        <StyledView className="flex-row justify-between mb-2">
                            <StyledText className="text-neutral-600">Start Date:</StyledText>
                            <StyledText className="text-neutral-800 font-medium">
                                {formatDate(selectedMedication.startDate)}
                            </StyledText>
                        </StyledView>

                        {selectedMedication.endDate && (
                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">End Date:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {formatDate(selectedMedication.endDate)}
                                </StyledText>
                            </StyledView>
                        )}

                        {selectedMedication.instructions && (
                            <StyledView className="mb-2">
                                <StyledText className="text-neutral-600">Instructions:</StyledText>
                                <StyledText className="text-neutral-800 mt-1">
                                    {selectedMedication.instructions}
                                </StyledText>
                            </StyledView>
                        )}
                    </StyledView>

                    <Button
                        title="Take Medication Now"
                        variant="secondary"
                        icon={<Ionicons name="checkmark-circle" size={18} color="white" />}
                        onPress={handleTakeMedicationPrompt}
                        loading={processing}
                        disabled={processing}
                        className="mt-3"
                        fullWidth
                    />
                </Card>

                {/* Medication Schedule */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="time" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Today's Schedule
                        </StyledText>
                    </StyledView>

                    {selectedMedication.schedule.length > 0 ? (
                        selectedMedication.schedule.map((scheduleItem, index) => (
                            <StyledView
                                key={`schedule-${index}`}
                                className="flex-row items-center py-3 border-b border-neutral-100 last:border-b-0"
                            >
                                <StyledView className={`
                  w-12 h-12 rounded-full items-center justify-center mr-3
                  ${scheduleItem.taken ? 'bg-green-100' : 'bg-neutral-100'}
                `}>
                                    <StyledText className={`text-lg font-bold ${scheduleItem.taken ? 'text-green-800' : 'text-neutral-600'}`}>
                                        {scheduleItem.time}
                                    </StyledText>
                                </StyledView>

                                <StyledView className="flex-1">
                                    <StyledText className="font-medium text-neutral-800">
                                        {selectedMedication.name}
                                    </StyledText>
                                    <StyledText className="text-neutral-600 text-sm">
                                        {selectedMedication.dosage || 'Take as directed'}
                                    </StyledText>
                                </StyledView>

                                {scheduleItem.taken ? (
                                    <StyledView className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <StyledText className="text-green-600 ml-1 text-sm">
                                            Taken at {formatTime(new Date(scheduleItem.takenAt))}
                                        </StyledText>
                                    </StyledView>
                                ) : (
                                    <Button
                                        title="Take"
                                        variant="outline"
                                        size="small"
                                        onPress={() => handleTakeMedication(index)}
                                        disabled={processing}
                                    />
                                )}
                            </StyledView>
                        ))
                    ) : (
                        <StyledText className="text-neutral-500 italic">
                            No schedule information available.
                        </StyledText>
                    )}
                </Card>

                {/* Prescription Image */}
                {medication.prescriptionImage && (
                    <Card className="mb-6">
                        <StyledView className="flex-row items-center mb-3">
                            <Ionicons name="document-text" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Prescription
                            </StyledText>
                        </StyledView>

                        <StyledView className="items-center">
                            <StyledImage
                                source={{ uri: medication.prescriptionImage }}
                                className="w-full h-64 rounded-lg"
                                resizeMode="contain"
                            />
                        </StyledView>
                    </Card>
                )}
            </StyledScrollView>
        </StyledView>
    );
};

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatTime = (date) => {
    if (!date) return '';

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const getAdherenceVariant = (adherenceRate) => {
    if (adherenceRate >= 90) return 'success';
    if (adherenceRate >= 70) return 'warning';
    return 'error';
};

export default MedicationDetailScreen;