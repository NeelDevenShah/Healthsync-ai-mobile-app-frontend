import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorScheduleScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [schedule, setSchedule] = useState([]);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                setLoading(true);

                const response = await doctorApi.getDoctorSchedule();
                const scheduleData = response.data || [];

                // Initialize schedule for all days if not present
                const initialSchedule = daysOfWeek.map(day => {
                    const existingDay = scheduleData.find(slot => slot.day === day);
                    return existingDay || {
                        day,
                        startTime: '',
                        endTime: '',
                        isAvailable: false
                    };
                });

                setSchedule(initialSchedule);
            } catch (error) {
                console.error('Error loading schedule:', error);
                Alert.alert('Error', 'Failed to load schedule. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, []);

    const handleToggleDay = (index) => {
        if (!editMode) return;

        setSchedule(prev => {
            const newSchedule = [...prev];
            newSchedule[index] = {
                ...newSchedule[index],
                isAvailable: !newSchedule[index].isAvailable,
                startTime: newSchedule[index].startTime || '09:00',
                endTime: newSchedule[index].endTime || '17:00'
            };
            return newSchedule;
        });
    };

    const handleTimeChange = (index, field, value) => {
        if (!editMode) return;

        setSchedule(prev => {
            const newSchedule = [...prev];
            newSchedule[index] = {
                ...newSchedule[index],
                [field]: value
            };
            return newSchedule;
        });
    };

    const handleSaveSchedule = async () => {
        try {
            setSaving(true);

            // Filter to only include available days
            const availableSlots = schedule.filter(day => day.isAvailable);

            await doctorApi.updateDoctorSchedule(availableSlots);

            setEditMode(false);
            Alert.alert('Success', 'Schedule updated successfully');
        } catch (error) {
            console.error('Error updating schedule:', error);
            Alert.alert('Error', 'Failed to update schedule. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading schedule..." />;
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
                        My Schedule
                    </StyledText>
                </StyledView>

                {!editMode ? (
                    <Button
                        title="Edit"
                        variant="outline"
                        icon={<Ionicons name="create-outline" size={16} color="#1766da" />}
                        onPress={() => setEditMode(true)}
                        size="small"
                    />
                ) : (
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => setEditMode(false)}
                        size="small"
                    />
                )}
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                <Card className="mb-4">
                    <StyledText className="text-neutral-700 mb-4">
                        Set your weekly availability for patient appointments. This will be used to determine available time slots when booking appointments.
                    </StyledText>

                    {schedule.map((day, index) => (
                        <StyledView
                            key={day.day}
                            className={`
                py-3 mb-2 rounded-lg border px-3
                ${day.isAvailable ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-white'}
                ${index === schedule.length - 1 ? '' : 'mb-2'}
              `}
                        >
                            <StyledView className="flex-row items-center justify-between">
                                <StyledTouchableOpacity
                                    className="flex-row items-center flex-1"
                                    onPress={() => handleToggleDay(index)}
                                    disabled={!editMode}
                                >
                                    <StyledView className={`
                    w-6 h-6 rounded-md items-center justify-center mr-2
                    ${day.isAvailable ? 'bg-primary-500' : 'border border-neutral-300'}
                  `}>
                                        {day.isAvailable && (
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        )}
                                    </StyledView>

                                    <StyledText className={`font-medium ${day.isAvailable ? 'text-primary-800' : 'text-neutral-700'}`}>
                                        {day.day}
                                    </StyledText>
                                </StyledTouchableOpacity>

                                {day.isAvailable && (
                                    <StyledView className="flex-row items-center">
                                        <TimeSelector
                                            value={day.startTime}
                                            onChange={(value) => handleTimeChange(index, 'startTime', value)}
                                            editable={editMode}
                                        />
                                        <StyledText className="mx-2">to</StyledText>
                                        <TimeSelector
                                            value={day.endTime}
                                            onChange={(value) => handleTimeChange(index, 'endTime', value)}
                                            editable={editMode}
                                        />
                                    </StyledView>
                                )}
                            </StyledView>
                        </StyledView>
                    ))}

                    {editMode && (
                        <Button
                            title={saving ? "Saving..." : "Save Schedule"}
                            variant="primary"
                            loading={saving}
                            disabled={saving}
                            onPress={handleSaveSchedule}
                            className="mt-4"
                            fullWidth
                        />
                    )}
                </Card>

                <Card className="mb-6">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Schedule Information
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-neutral-700 mb-2">
                        • Your availability is used to determine when patients can book appointments with you.
                    </StyledText>
                    <StyledText className="text-neutral-700 mb-2">
                        • By default, appointment slots are created in 30-minute increments.
                    </StyledText>
                    <StyledText className="text-neutral-700 mb-2">
                        • You can always override your schedule for specific dates by managing individual appointments.
                    </StyledText>
                    <StyledText className="text-neutral-700">
                        • Patients will only be able to book appointments during your available times.
                    </StyledText>
                </Card>
            </StyledScrollView>
        </StyledView>
    );
};

// Time selector component
const TimeSelector = ({ value, onChange, editable }) => {
    const times = [
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    const [showDropdown, setShowDropdown] = useState(false);

    const formattedTime = (timeString) => {
        if (!timeString) return '';

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

    return (
        <StyledView className="relative">
            <StyledTouchableOpacity
                className={`
          bg-white border border-neutral-300 rounded-md px-2 py-1
          ${editable ? '' : 'opacity-70'}
        `}
                onPress={() => editable && setShowDropdown(!showDropdown)}
                disabled={!editable}
            >
                <StyledText className="text-neutral-800">
                    {formattedTime(value) || 'Select time'}
                </StyledText>
            </StyledTouchableOpacity>

            {showDropdown && (
                <StyledView className="absolute top-10 left-0 z-10 bg-white border border-neutral-300 rounded-md p-2 w-40 max-h-48">
                    <ScrollView>
                        {times.map((time) => (
                            <StyledTouchableOpacity
                                key={time}
                                className={`py-2 px-2 ${time === value ? 'bg-primary-100' : ''}`}
                                onPress={() => {
                                    onChange(time);
                                    setShowDropdown(false);
                                }}
                            >
                                <StyledText className={`${time === value ? 'text-primary-800 font-medium' : 'text-neutral-800'}`}>
                                    {formattedTime(time)}
                                </StyledText>
                            </StyledTouchableOpacity>
                        ))}
                    </ScrollView>
                </StyledView>
            )}
        </StyledView>
    );
};

export default DoctorScheduleScreen;