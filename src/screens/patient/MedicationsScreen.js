import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as patientApi from '../../api/patient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const MedicationsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [medications, setMedications] = useState([]);
    const [upcomingDoses, setUpcomingDoses] = useState([]);

    const loadMedications = useCallback(async () => {
        try {
            setLoading(true);

            // Get all active medications
            const medicationsResponse = await patientApi.getPatientMedications();
            setMedications(medicationsResponse.data || []);

            // Get upcoming doses for today
            const upcomingResponse = await patientApi.getUpcomingMedications(1);
            setUpcomingDoses(upcomingResponse.data || []);
        } catch (error) {
            console.error('Error loading medications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadMedications();
    };

    useEffect(() => {
        loadMedications();
    }, [loadMedications]);

    const renderUpcomingDoseItem = ({ item }) => {
        const dose = item;

        return (
            <Card className="mr-3" style={{ width: 200 }}>
                <StyledView>
                    <StyledText className="text-neutral-500 text-xs mb-1">
                        {formatTime(dose.scheduledTime)}
                    </StyledText>
                    <StyledText className="text-lg font-bold text-neutral-800">
                        {dose.name}
                    </StyledText>
                    <StyledText className="text-neutral-600 mb-2">
                        {dose.dosage || 'Take as directed'}
                    </StyledText>

                    <Button
                        title="Take Now"
                        variant="primary"
                        size="small"
                        onPress={() => navigation.navigate('MedicationDetail', {
                            medicationId: dose.medicationId,
                            medicationIndex: dose.medicationIndex,
                            action: 'take'
                        })}
                    />
                </StyledView>
            </Card>
        );
    };

    const renderMedicationItem = ({ item }) => {
        const medication = item;

        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('MedicationDetail', { medicationId: medication._id })}
            >
                <StyledView>
                    <StyledView className="flex-row items-center">
                        <StyledView className="bg-secondary-100 rounded-lg p-3 mr-3">
                            <Ionicons name="medical" size={24} color="#2d9d91" />
                        </StyledView>

                        <StyledView className="flex-1">
                            <StyledText className="text-lg font-bold text-neutral-800">
                                {medication.medications?.[0]?.name || 'Medication'}
                            </StyledText>
                            <StyledText className="text-neutral-600">
                                {medication.medications?.length > 1
                                    ? `+ ${medication.medications.length - 1} more medications`
                                    : medication.medications?.[0]?.dosage || 'Take as directed'}
                            </StyledText>
                        </StyledView>

                        <Badge
                            text={`${Math.round(medication.adherenceRate)}% Adherence`}
                            variant={getAdherenceVariant(medication.adherenceRate)}
                            size="small"
                        />
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                        <StyledText className="text-neutral-500 text-sm">
                            {medication.medications?.[0]?.endDate
                                ? `Until ${formatDate(medication.medications[0].endDate)}`
                                : 'Ongoing treatment'}
                        </StyledText>

                        <StyledText className="text-neutral-500 text-sm">
                            <Ionicons name="time-outline" size={14} color="#6b7280" /> {getMedicationScheduleText(medication.medications?.[0])}
                        </StyledText>
                    </StyledView>
                </StyledView>
            </Card>
        );
    };

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="pt-14 pb-2 px-4 bg-white border-b border-neutral-200">
                <StyledView className="flex-row justify-between items-center">
                    <StyledText className="text-xl font-bold text-neutral-800">
                        Medications
                    </StyledText>

                    <Button
                        title="Add Prescription"
                        variant="primary"
                        icon={<Ionicons name="add" size={18} color="white" />}
                        onPress={() => navigation.navigate('UploadPrescription')}
                        size="small"
                    />
                </StyledView>
            </StyledView>

            {loading && !refreshing ? (
                <LoadingSpinner text="Loading medications..." />
            ) : (
                <FlatList
                    data={medications}
                    renderItem={renderMedicationItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        upcomingDoses.length > 0 ? (
                            <StyledView className="mb-6">
                                <StyledView className="flex-row justify-between items-center px-4 mb-2">
                                    <StyledText className="text-lg font-bold text-neutral-800">
                                        Upcoming Doses
                                    </StyledText>
                                    <StyledTouchableOpacity>
                                        <StyledText className="text-primary-500">See All</StyledText>
                                    </StyledTouchableOpacity>
                                </StyledView>

                                <FlatList
                                    data={upcomingDoses}
                                    renderItem={renderUpcomingDoseItem}
                                    keyExtractor={(item, index) => `dose-${item.medicationId}-${index}`}
                                    horizontal
                                    contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </StyledView>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No Medications"
                            message="You don't have any medications added yet. Upload a prescription to get started."
                            icon={<Ionicons name="medical-outline" size={60} color="#9ca3af" />}
                            actionLabel="Add Prescription"
                            onAction={() => navigation.navigate('UploadPrescription')}
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
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const getAdherenceVariant = (adherenceRate) => {
    if (adherenceRate >= 90) return 'success';
    if (adherenceRate >= 70) return 'warning';
    return 'error';
};

const getMedicationScheduleText = (medication) => {
    if (!medication || !medication.frequency) return 'As directed';

    const frequency = medication.frequency.toLowerCase();

    if (frequency.includes('daily') || frequency.includes('once a day')) {
        return 'Once daily';
    } else if (frequency.includes('twice') || frequency.includes('two times') || frequency.includes('bid')) {
        return 'Twice daily';
    } else if (frequency.includes('three') || frequency.includes('thrice') || frequency.includes('tid')) {
        return 'Three times daily';
    } else if (frequency.includes('four') || frequency.includes('qid')) {
        return 'Four times daily';
    } else if (frequency.includes('every')) {
        // Attempt to extract hours
        const match = frequency.match(/every\s+(\d+)\s+hours?/i);
        if (match && match[1]) {
            return `Every ${match[1]} hours`;
        }
        return frequency;
    }

    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
};

export default MedicationsScreen;