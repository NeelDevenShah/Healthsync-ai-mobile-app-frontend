import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';

import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorCreateAppointmentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { patientId, diagnosisId } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!patientId);
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [requiredTests, setRequiredTests] = useState([]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setInitialLoading(true);

                // Load patients
                const patientsResponse = await doctorApi.getDoctorPatients();
                setPatients(patientsResponse.data || []);

                // If patientId is provided, set selected patient
                if (patientId) {
                    const patient = patientsResponse.data.find(p => p._id === patientId);
                    if (patient) {
                        setSelectedPatient(patient);
                    }
                }

                // If diagnosisId is provided, load diagnosis to get required tests
                if (diagnosisId) {
                    const diagnosisResponse = await doctorApi.approveDiagnosis(diagnosisId);
                    const diagnosis = diagnosisResponse.data;

                    // Get approved tests
                    const approvedTests = diagnosis.suggestedTests
                        .filter(test => test.isApproved)
                        .map(test => ({
                            name: test.name,
                            reason: test.reason,
                            priority: test.priority
                        }));

                    setRequiredTests(approvedTests);

                    // Add diagnosis reference to notes
                    setNotes(`Follow-up for diagnosis from ${new Date(diagnosis.createdAt).toLocaleDateString()}`);
                }

                // Set available time slots for the selected date
                generateTimeSlots(dayjs().format('YYYY-MM-DD'));
            } catch (error) {
                console.error('Error loading appointment data:', error);
                Alert.alert('Error', 'Failed to load appointment data. Please try again.');
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [patientId, diagnosisId]);

    // Generate time slots for selected date
    const generateTimeSlots = (date) => {
        // In a real implementation, you would check the doctor's schedule
        // and already booked appointments for the selected date

        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM
        const interval = 30; // 30 minutes

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                slots.push(`${formattedHour}:${formattedMinute}`);
            }
        }

        setTimeSlots(slots);
        setSelectedTimeSlot(''); // Reset selected time slot
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date.dateString);
        generateTimeSlots(date.dateString);
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatientId(patient._id);
        setSelectedPatient(patient);
    };

    const handleTimeSlotSelect = (timeSlot) => {
        setSelectedTimeSlot(timeSlot);
    };

    const handleCreateAppointment = async () => {
        if (!selectedPatientId) {
            Alert.alert('Error', 'Please select a patient');
            return;
        }

        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        if (!selectedTimeSlot) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        try {
            setLoading(true);

            // Prepare appointment data
            const appointmentData = {
                patientId: selectedPatientId,
                date: selectedDate,
                time: {
                    start: selectedTimeSlot,
                    end: calculateEndTime(selectedTimeSlot, 30) // 30-minute appointment
                },
                notes: {
                    preAppointment: notes
                },
                requiredTests: requiredTests
            };

            // Add diagnosis if available
            if (diagnosisId) {
                appointmentData.diagnosisId = diagnosisId;
            }

            // Create appointment
            const response = await doctorApi.createAppointment(appointmentData);

            Alert.alert(
                'Appointment Created',
                'The appointment has been successfully scheduled.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('DoctorAppointmentsTab'),
                    },
                ]
            );
        } catch (error) {
            console.error('Error creating appointment:', error);
            Alert.alert('Error', 'Failed to create appointment. Please try again.');
        } finally {
            setLoading(false);
        }
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

    if (initialLoading) {
        return <LoadingSpinner fullScreen text="Loading appointment data..." />;
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
                        Schedule Appointment
                    </StyledText>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Patient Selection */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="person" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Select Patient
                        </StyledText>
                    </StyledView>

                    {selectedPatient ? (
                        <StyledView className="bg-primary-50 rounded-lg p-3">
                            <StyledView className="flex-row justify-between items-center">
                                <StyledView className="flex-row items-center">
                                    <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
                                        <Ionicons name="person" size={20} color="#1766da" />
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="font-bold text-neutral-800">
                                            {selectedPatient.name.first} {selectedPatient.name.last}
                                        </StyledText>

                                        {selectedPatient.gender && (
                                            <StyledText className="text-neutral-600 text-sm">
                                                {selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1)}
                                                {selectedPatient.dateOfBirth && `, ${calculateAge(selectedPatient.dateOfBirth)} years`}
                                            </StyledText>
                                        )}
                                    </StyledView>
                                </StyledView>

                                <Button
                                    title="Change"
                                    variant="outline"
                                    size="small"
                                    onPress={() => setSelectedPatient(null)}
                                />
                            </StyledView>
                        </StyledView>
                    ) : (
                        <StyledView className="max-h-64">
                            <Input
                                placeholder="Search patients..."
                                leftIcon={<Ionicons name="search" size={20} color="#6b7280" />}
                                className="mb-2"
                            />

                            <ScrollView className="max-h-48">
                                {patients.map((patient) => (
                                    <StyledTouchableOpacity
                                        key={patient._id}
                                        className="flex-row items-center p-3 border-b border-neutral-100"
                                        onPress={() => handlePatientSelect(patient)}
                                    >
                                        <StyledView className="bg-primary-100 p-2 rounded-full mr-3">
                                            <Ionicons name="person" size={20} color="#1766da" />
                                        </StyledView>

                                        <StyledView>
                                            <StyledText className="font-bold text-neutral-800">
                                                {patient.name.first} {patient.name.last}
                                            </StyledText>

                                            {patient.gender && (
                                                <StyledText className="text-neutral-600 text-sm">
                                                    {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                                                    {patient.dateOfBirth && `, ${calculateAge(patient.dateOfBirth)} years`}
                                                </StyledText>
                                            )}
                                        </StyledView>
                                    </StyledTouchableOpacity>
                                ))}
                            </ScrollView>
                        </StyledView>
                    )}
                </Card>

                {/* Date Selection */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="calendar" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Select Date
                        </StyledText>
                    </StyledView>

                    <Calendar
                        onDayPress={handleDateSelect}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: '#1766da' }
                        }}
                        minDate={dayjs().format('YYYY-MM-DD')}
                        theme={{
                            todayTextColor: '#2d9d91',
                            selectedDayBackgroundColor: '#1766da',
                            arrowColor: '#1766da',
                            dotColor: '#1766da',
                            indicatorColor: '#1766da',
                        }}
                    />
                </Card>

                {/* Time Selection */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="time" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Select Time
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-neutral-600 mb-3">
                        Available time slots for {dayjs(selectedDate).format('MMMM D, YYYY')}:
                    </StyledText>

                    <StyledView className="flex-row flex-wrap">
                        {timeSlots.map((timeSlot) => (
                            <StyledTouchableOpacity
                                key={timeSlot}
                                className={`
                  m-1 px-3 py-2 rounded-md border
                  ${selectedTimeSlot === timeSlot ? 'bg-primary-500 border-primary-500' : 'bg-white border-neutral-300'}
                `}
                                onPress={() => handleTimeSlotSelect(timeSlot)}
                            >
                                <StyledText
                                    className={selectedTimeSlot === timeSlot ? 'text-white' : 'text-neutral-800'}
                                >
                                    {formatTime(timeSlot)}
                                </StyledText>
                            </StyledTouchableOpacity>
                        ))}
                    </StyledView>
                </Card>

                {/* Required Tests */}
                {requiredTests.length > 0 && (
                    <Card className="mb-4">
                        <StyledView className="flex-row items-center mb-3">
                            <Ionicons name="clipboard" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Required Tests
                            </StyledText>
                        </StyledView>

                        <StyledText className="text-neutral-600 mb-3">
                            The patient will need to bring the following test results:
                        </StyledText>

                        {requiredTests.map((test, index) => (
                            <StyledView
                                key={`test-${index}`}
                                className="flex-row items-center py-2 border-b border-neutral-100 last:border-b-0"
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={getPriorityColor(test.priority)}
                                    className="mr-2"
                                />
                                <StyledView className="flex-1">
                                    <StyledText className="font-medium text-neutral-800">
                                        {test.name}
                                    </StyledText>
                                    {test.reason && (
                                        <StyledText className="text-neutral-500 text-sm">
                                            {test.reason}
                                        </StyledText>
                                    )}
                                </StyledView>
                                <StyledView className="bg-neutral-100 px-2 py-1 rounded-full">
                                    <StyledText className="text-xs text-neutral-700 font-medium">
                                        {test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        ))}
                    </Card>
                )}

                {/* Notes */}
                <Card className="mb-6">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="create" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Appointment Notes
                        </StyledText>
                    </StyledView>

                    <Input
                        placeholder="Add notes about this appointment..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                    />
                </Card>

                {/* Actions */}
                <StyledView className="flex-row justify-between mb-6">
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        className="flex-1 mr-2"
                    />

                    <Button
                        title={loading ? "Scheduling..." : "Schedule Appointment"}
                        variant="primary"
                        loading={loading}
                        disabled={loading || !selectedPatientId || !selectedDate || !selectedTimeSlot}
                        onPress={handleCreateAppointment}
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

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);

    let period = 'AM';
    let displayHours = hours;

    if (hours >= 12) {
        period = 'PM';
        if (hours > 12) {
            displayHours = hours - 12;
        }
    }

    if (displayHours === 0) {
        displayHours = 12;
    }

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high':
            return '#ef4444';
        case 'medium':
            return '#f59e0b';
        case 'low':
            return '#3b82f6';
        default:
            return '#6b7280';
    }
};

export default DoctorCreateAppointmentScreen;