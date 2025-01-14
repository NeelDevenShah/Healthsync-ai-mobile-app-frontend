import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as healthMetricApi from '../../api/healthMetric';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const HealthMetricsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [metricValue, setMetricValue] = useState('');
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [notes, setNotes] = useState('');

    const metrics = [
        {
            id: 'heart_rate',
            name: 'Heart Rate',
            icon: 'heart',
            color: '#ef4444',
            unit: 'bpm',
            normalRange: '60-100 bpm',
            keyboardType: 'number-pad'
        },
        {
            id: 'blood_pressure',
            name: 'Blood Pressure',
            icon: 'pulse',
            color: '#1766da',
            unit: 'mmHg',
            normalRange: '120/80 mmHg',
            hasMultipleValues: true
        },
        {
            id: 'glucose',
            name: 'Blood Glucose',
            icon: 'water',
            color: '#ff7d00',
            unit: 'mg/dL',
            normalRange: '70-140 mg/dL',
            keyboardType: 'number-pad'
        },
        {
            id: 'oxygen',
            name: 'Oxygen Saturation',
            icon: 'fitness',
            color: '#3b82f6',
            unit: '%',
            normalRange: '95-100%',
            keyboardType: 'number-pad',
            max: 100
        },
        {
            id: 'temperature',
            name: 'Body Temperature',
            icon: 'thermometer',
            color: '#10b981',
            unit: '°C',
            normalRange: '36.1-37.2°C',
            keyboardType: 'decimal-pad'
        },
        {
            id: 'weight',
            name: 'Weight',
            icon: 'body',
            color: '#6b7280',
            unit: 'kg',
            keyboardType: 'decimal-pad'
        },
    ];

    const handleSelectMetric = (metric) => {
        setSelectedMetric(metric);
        setMetricValue('');
        setSystolic('');
        setDiastolic('');
        setNotes('');
    };

    const handleSaveMetric = async () => {
        // Validate input
        if (selectedMetric.hasMultipleValues) {
            if (!systolic || !diastolic) {
                Alert.alert('Error', 'Please enter both systolic and diastolic values');
                return;
            }

            const systolicValue = parseInt(systolic, 10);
            const diastolicValue = parseInt(diastolic, 10);

            if (isNaN(systolicValue) || isNaN(diastolicValue)) {
                Alert.alert('Error', 'Please enter valid numbers');
                return;
            }

            if (systolicValue < diastolicValue) {
                Alert.alert('Error', 'Systolic value should be higher than diastolic value');
                return;
            }
        } else {
            if (!metricValue) {
                Alert.alert('Error', 'Please enter a value');
                return;
            }

            const value = parseFloat(metricValue);

            if (isNaN(value)) {
                Alert.alert('Error', 'Please enter a valid number');
                return;
            }

            if (selectedMetric.max && value > selectedMetric.max) {
                Alert.alert('Error', `Value cannot be greater than ${selectedMetric.max}`);
                return;
            }
        }

        try {
            setLoading(true);

            // Prepare data
            const metricData = {
                type: selectedMetric.id,
                unit: selectedMetric.unit,
                source: 'manual',
                notes: notes,
                timestamp: new Date()
            };

            // Add value based on metric type
            if (selectedMetric.hasMultipleValues) {
                metricData.value = {
                    systolic: parseInt(systolic, 10),
                    diastolic: parseInt(diastolic, 10)
                };
            } else {
                metricData.value = parseFloat(metricValue);
            }

            const response = await healthMetricApi.recordHealthMetric(metricData);

            // Check for abnormal readings
            if (response.data.healthMetric.isAbnormal) {
                Alert.alert(
                    'Abnormal Reading Detected',
                    `This reading appears to be outside the normal range.\n\n${response.data.analysis || ''}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('HealthDashboard')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Measurement Recorded',
                    'Your health metric has been successfully recorded.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('HealthDashboard')
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error recording health metric:', error);
            Alert.alert('Error', 'Failed to record health metric. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Recording measurement..." />;
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
                        Record Health Metric
                    </StyledText>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {!selectedMetric ? (
                    <Card className="mb-4">
                        <StyledText className="text-lg font-bold text-neutral-800 mb-4">
                            Select a health metric to record
                        </StyledText>

                        <StyledView className="space-y-2">
                            {metrics.map((metric) => (
                                <StyledTouchableOpacity
                                    key={metric.id}
                                    className="flex-row items-center p-3 border border-neutral-200 rounded-lg"
                                    onPress={() => handleSelectMetric(metric)}
                                >
                                    <StyledView className={`w-10 h-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${metric.color}20` }}>
                                        <Ionicons name={metric.icon} size={20} color={metric.color} />
                                    </StyledView>

                                    <StyledView className="flex-1">
                                        <StyledText className="font-medium text-neutral-800">
                                            {metric.name}
                                        </StyledText>
                                        {metric.normalRange && (
                                            <StyledText className="text-neutral-500 text-sm">
                                                Normal range: {metric.normalRange}
                                            </StyledText>
                                        )}
                                    </StyledView>

                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </StyledTouchableOpacity>
                            ))}
                        </StyledView>
                    </Card>
                ) : (
                    <>
                        <Card className="mb-4">
                            <StyledView className="flex-row items-center mb-4">
                                <StyledView className={`w-10 h-10 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${selectedMetric.color}20` }}>
                                    <Ionicons name={selectedMetric.icon} size={20} color={selectedMetric.color} />
                                </StyledView>

                                <StyledView className="flex-1">
                                    <StyledText className="text-lg font-bold text-neutral-800">
                                        {selectedMetric.name}
                                    </StyledText>
                                    {selectedMetric.normalRange && (
                                        <StyledText className="text-neutral-500 text-sm">
                                            Normal range: {selectedMetric.normalRange}
                                        </StyledText>
                                    )}
                                </StyledView>

                                <StyledTouchableOpacity
                                    className="p-2"
                                    onPress={() => setSelectedMetric(null)}
                                >
                                    <Ionicons name="close" size={24} color="#6b7280" />
                                </StyledTouchableOpacity>
                            </StyledView>

                            {selectedMetric.hasMultipleValues ? (
                                <StyledView className="space-y-3">
                                    <Input
                                        label="Systolic Pressure (top number)"
                                        value={systolic}
                                        onChangeText={setSystolic}
                                        placeholder={`Enter value in ${selectedMetric.unit}`}
                                        keyboardType="number-pad"
                                    />

                                    <Input
                                        label="Diastolic Pressure (bottom number)"
                                        value={diastolic}
                                        onChangeText={setDiastolic}
                                        placeholder={`Enter value in ${selectedMetric.unit}`}
                                        keyboardType="number-pad"
                                    />
                                </StyledView>
                            ) : (
                                <Input
                                    label={`${selectedMetric.name} Value`}
                                    value={metricValue}
                                    onChangeText={setMetricValue}
                                    placeholder={`Enter value in ${selectedMetric.unit}`}
                                    keyboardType={selectedMetric.keyboardType || 'default'}
                                />
                            )}

                            <Input
                                label="Notes (optional)"
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add any additional information..."
                                multiline
                                numberOfLines={3}
                                className="mt-3"
                            />

                            <Button
                                title="Save Measurement"
                                variant="primary"
                                onPress={handleSaveMetric}
                                className="mt-4"
                                fullWidth
                            />
                        </Card>

                        <Card className="mb-6">
                            <StyledView className="flex-row items-center mb-2">
                                <Ionicons name="information-circle" size={20} color="#1766da" />
                                <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                    Tips for Accurate Readings
                                </StyledText>
                            </StyledView>

                            {selectedMetric.id === 'blood_pressure' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Sit with back supported and feet flat on the floor
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Rest your arm on a table at heart level
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Don't measure immediately after exercise, stress, or caffeine intake
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • Take readings at the same time each day
                                    </StyledText>
                                </>
                            )}

                            {selectedMetric.id === 'heart_rate' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Sit quietly for at least 5 minutes before measuring
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Avoid caffeine, alcohol, and tobacco before measurement
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • For manual readings, count beats for 60 seconds for accuracy
                                    </StyledText>
                                </>
                            )}

                            {selectedMetric.id === 'glucose' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Wash and dry hands thoroughly before testing
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Note whether reading was taken before or after a meal
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • Follow manufacturer's instructions for your glucose meter
                                    </StyledText>
                                </>
                            )}

                            {selectedMetric.id === 'oxygen' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Sit upright and remain still during measurement
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Remove nail polish if using a finger oximeter
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • Make sure your hand is warm and relaxed
                                    </StyledText>
                                </>
                            )}

                            {selectedMetric.id === 'temperature' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Wait at least 30 minutes after eating or drinking
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Wait at least 6 hours after strenuous exercise
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • Follow thermometer instructions for proper placement and timing
                                    </StyledText>
                                </>
                            )}

                            {selectedMetric.id === 'weight' && (
                                <>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Weigh yourself at the same time each day
                                    </StyledText>
                                    <StyledText className="text-neutral-700 mb-2">
                                        • Use the same scale for consistent results
                                    </StyledText>
                                    <StyledText className="text-neutral-700">
                                        • Wear similar clothing each time you weigh yourself
                                    </StyledText>
                                </>
                            )}
                        </Card>
                    </>
                )}
            </StyledScrollView>
        </StyledView>
    );
};

export default HealthMetricsScreen;