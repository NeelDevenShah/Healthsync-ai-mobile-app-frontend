import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import * as healthMetricApi from '../../api/healthMetric';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const screenWidth = Dimensions.get('window').width;

const HealthDashboardScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [abnormalReadings, setAbnormalReadings] = useState([]);
    const [timeframeFilter, setTimeframeFilter] = useState('7d');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            // Load dashboard data
            const dashboardResponse = await healthMetricApi.getDashboard(timeframeFilter);
            setDashboardData(dashboardresponse.data || {});

            // Load abnormal readings
            const abnormalResponse = await healthMetricApi.getAbnormalReadings(timeframeFilter);
            setAbnormalReadings(abnormalresponse.data || []);
        } catch (error) {
            console.error('Error loading health dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [timeframeFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleTimeframeChange = (timeframe) => {
        if (timeframe !== timeframeFilter) {
            setTimeframeFilter(timeframe);
        }
    };

    const prepareChartData = (metricData, metricKey) => {
        if (!dashboardData || !dashboardData[metricKey] || !dashboardData[metricKey].data) {
            return null;
        }

        const data = dashboardData[metricKey].data;

        // Get last 7 data points (or less if not available)
        const dataPoints = data.slice(-7);

        // Prepare labels and dataset
        const labels = dataPoints.map(point => {
            const date = new Date(point.timestamp);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        // Extract values
        let datasets = [];
        if (metricKey === 'blood_pressure') {
            // Blood pressure has systolic and diastolic
            const systolicData = dataPoints.map(point => point.value.systolic);
            const diastolicData = dataPoints.map(point => point.value.diastolic);

            datasets = [
                {
                    data: systolicData,
                    color: (opacity = 1) => `rgba(23, 102, 218, ${opacity})`, // Primary color
                    strokeWidth: 2
                },
                {
                    data: diastolicData,
                    color: (opacity = 1) => `rgba(45, 157, 145, ${opacity})`, // Secondary color
                    strokeWidth: 2
                }
            ];
        } else {
            // Regular metrics
            const values = dataPoints.map(point => typeof point.value === 'object' ? point.value.value : point.value);

            datasets = [
                {
                    data: values,
                    color: (opacity = 1) => `rgba(23, 102, 218, ${opacity})`, // Primary color
                    strokeWidth: 2
                }
            ];
        }

        return {
            labels,
            datasets
        };
    };

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 border-b border-neutral-200">
                <StyledView className="flex-row justify-between items-center">
                    <StyledTouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </StyledTouchableOpacity>

                    <StyledView className="flex-1">
                        <StyledText className="text-xl font-bold text-neutral-800">
                            Health Dashboard
                        </StyledText>
                    </StyledView>

                    <Button
                        title="Add Metric"
                        variant="primary"
                        size="small"
                        icon={<Ionicons name="add" size={18} color="white" />}
                        onPress={() => navigation.navigate('HealthMetrics')}
                    />
                </StyledView>
            </StyledView>

            {/* Timeframe Filter */}
            <StyledView className="flex-row justify-around border-b border-neutral-200 py-2 bg-white">
                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${timeframeFilter === '1d' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleTimeframeChange('1d')}
                >
                    <StyledText className={timeframeFilter === '1d' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Today
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${timeframeFilter === '7d' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleTimeframeChange('7d')}
                >
                    <StyledText className={timeframeFilter === '7d' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Week
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${timeframeFilter === '1m' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleTimeframeChange('1m')}
                >
                    <StyledText className={timeframeFilter === '1m' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Month
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-3 ${timeframeFilter === '3m' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleTimeframeChange('3m')}
                >
                    <StyledText className={timeframeFilter === '3m' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        3 Months
                    </StyledText>
                </StyledTouchableOpacity>
            </StyledView>

            {loading && !refreshing ? (
                <LoadingSpinner text="Loading health data..." />
            ) : (
                <StyledScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Abnormal Readings Alert */}
                    {abnormalReadings.length > 0 && (
                        <StyledView className="px-4 py-2">
                            <Card elevation={1} className="border-l-4 border-l-error bg-red-50">
                                <StyledView className="flex-row items-start">
                                    <Ionicons name="alert-circle" size={24} color="#ef4444" className="mr-2" />
                                    <StyledView className="flex-1">
                                        <StyledText className="font-bold text-red-800">Abnormal Health Readings</StyledText>
                                        <StyledText className="text-red-700">
                                            You have {abnormalReadings.length} abnormal health {abnormalReadings.length === 1 ? 'reading' : 'readings'} that may require attention.
                                        </StyledText>
                                    </StyledView>
                                </StyledView>

                                {/* Display first abnormal reading */}
                                {abnormalReadings.length > 0 && (
                                    <StyledView className="mt-2 bg-white p-2 rounded-lg">
                                        <StyledView className="flex-row justify-between items-center">
                                            <StyledText className="font-medium text-neutral-800">
                                                {formatMetricTypeName(abnormalReadings[0].type)}
                                            </StyledText>
                                            <Badge
                                                text={formatMetricValue(abnormalReadings[0])}
                                                variant="error"
                                                size="small"
                                            />
                                        </StyledView>
                                        <StyledText className="text-sm text-neutral-600 mt-1">
                                            {abnormalReadings[0].abnormalityDetails?.description || 'Abnormal reading detected'}
                                        </StyledText>
                                    </StyledView>
                                )}

                                {abnormalReadings.length > 1 && (
                                    <Button
                                        title="View All Abnormal Readings"
                                        variant="error"
                                        size="small"
                                        onPress={() => {
                                            // Navigate to abnormal readings screen or show modal
                                            // For now we'll just scroll to each section
                                        }}
                                        className="mt-2 self-end"
                                    />
                                )}
                            </Card>
                        </StyledView>
                    )}

                    {/* Heart Rate */}
                    {dashboardData?.heart_rate && (
                        <StyledView className="px-4 py-2">
                            <Card elevation={1}>
                                <StyledView className="flex-row justify-between items-center mb-4">
                                    <StyledView className="flex-row items-center">
                                        <Ionicons name="heart" size={20} color="#ef4444" />
                                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                            Heart Rate
                                        </StyledText>
                                    </StyledView>

                                    <StyledView className="bg-primary-50 rounded-lg px-3 py-1">
                                        <StyledText className="text-primary-800 font-bold">
                                            {dashboardData.heart_rate.data?.slice(-1)[0]?.value || '--'} bpm
                                        </StyledText>
                                    </StyledView>
                                </StyledView>

                                {dashboardData.heart_rate.data?.length > 1 ? (
                                    <LineChart
                                        data={prepareChartData(dashboardData, 'heart_rate')}
                                        width={screenWidth - 48}
                                        height={180}
                                        chartConfig={{
                                            backgroundColor: '#ffffff',
                                            backgroundGradientFrom: '#ffffff',
                                            backgroundGradientTo: '#ffffff',
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(23, 102, 218, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            style: {
                                                borderRadius: 16,
                                            },
                                            propsForDots: {
                                                r: '6',
                                                strokeWidth: '2',
                                                stroke: '#1766da',
                                            },
                                        }}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                    />
                                ) : (
                                    <StyledView className="h-[180px] items-center justify-center">
                                        <StyledText className="text-neutral-500">Not enough data to show chart</StyledText>
                                    </StyledView>
                                )}

                                <StyledView className="flex-row justify-between mt-2">
                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Average</StyledText>
                                        <StyledText className="text-base font-bold text-neutral-800">
                                            {Math.round(dashboardData.heart_rate.average || 0)} bpm
                                        </StyledText>
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Min</StyledText>
                                        <StyledText className="text-base font-bold text-neutral-800">
                                            {Math.round(dashboardData.heart_rate.min || 0)} bpm
                                        </StyledText>
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Max</StyledText>
                                        <StyledText className="text-base font-bold text-neutral-800">
                                            {Math.round(dashboardData.heart_rate.max || 0)} bpm
                                        </StyledText>
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Trend</StyledText>
                                        <StyledView className="flex-row items-center">
                                            <Ionicons
                                                name={getTrendIcon(dashboardData.heart_rate.trend)}
                                                size={16}
                                                color={getTrendColor(dashboardData.heart_rate.trend)}
                                            />
                                            <StyledText className={`text-xs font-bold ml-1 ${getTrendTextColor(dashboardData.heart_rate.trend)}`}>
                                                {formatTrend(dashboardData.heart_rate.trend)}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            </Card>
                        </StyledView>
                    )}

                    {/* Blood Pressure */}
                    {dashboardData?.blood_pressure && (
                        <StyledView className="px-4 py-2">
                            <Card elevation={1}>
                                <StyledView className="flex-row justify-between items-center mb-4">
                                    <StyledView className="flex-row items-center">
                                        <Ionicons name="pulse" size={20} color="#1766da" />
                                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                            Blood Pressure
                                        </StyledText>
                                    </StyledView>

                                    <StyledView className="bg-primary-50 rounded-lg px-3 py-1">
                                        <StyledText className="text-primary-800 font-bold">
                                            {dashboardData.blood_pressure.data?.slice(-1)[0]?.value?.systolic || '--'}/
                                            {dashboardData.blood_pressure.data?.slice(-1)[0]?.value?.diastolic || '--'} mmHg
                                        </StyledText>
                                    </StyledView>
                                </StyledView>

                                {dashboardData.blood_pressure.data?.length > 1 ? (
                                    <LineChart
                                        data={prepareChartData(dashboardData, 'blood_pressure')}
                                        width={screenWidth - 48}
                                        height={180}
                                        chartConfig={{
                                            backgroundColor: '#ffffff',
                                            backgroundGradientFrom: '#ffffff',
                                            backgroundGradientTo: '#ffffff',
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(23, 102, 218, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            style: {
                                                borderRadius: 16,
                                            },
                                            propsForDots: {
                                                r: '6',
                                                strokeWidth: '2',
                                                stroke: '#1766da',
                                            },
                                        }}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        legend={['Systolic', 'Diastolic']}
                                    />
                                ) : (
                                    <StyledView className="h-[180px] items-center justify-center">
                                        <StyledText className="text-neutral-500">Not enough data to show chart</StyledText>
                                    </StyledView>
                                )}

                                <StyledView className="flex-row justify-between mt-2">
                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Systolic Avg</StyledText>
                                        <StyledText className="text-base font-bold text-neutral-800">
                                            {Math.round(dashboardData.blood_pressure.systolic?.average || 0)} mmHg
                                        </StyledText>
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Diastolic Avg</StyledText>
                                        <StyledText className="text-base font-bold text-neutral-800">
                                            {Math.round(dashboardData.blood_pressure.diastolic?.average || 0)} mmHg
                                        </StyledText>
                                    </StyledView>

                                    <StyledView>
                                        <StyledText className="text-sm text-neutral-500">Trend</StyledText>
                                        <StyledView className="flex-row items-center">
                                            <Ionicons
                                                name={getTrendIcon(dashboardData.blood_pressure.systolic?.trend)}
                                                size={16}
                                                color={getTrendColor(dashboardData.blood_pressure.systolic?.trend)}
                                            />
                                            <StyledText className={`text-xs font-bold ml-1 ${getTrendTextColor(dashboardData.blood_pressure.systolic?.trend)}`}>
                                                {formatTrend(dashboardData.blood_pressure.systolic?.trend)}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            </Card>
                        </StyledView>
                    )}

                    {/* Other Metrics (Simplified) */}
                    <StyledView className="px-4 py-2 mb-6">
                        <Card elevation={1}>
                            <StyledView className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-lg font-bold text-neutral-800">
                                    Other Health Metrics
                                </StyledText>

                                <Button
                                    title="Record New"
                                    variant="outline"
                                    size="small"
                                    icon={<Ionicons name="add" size={16} color="#1766da" />}
                                    onPress={() => navigation.navigate('HealthMetrics')}
                                />
                            </StyledView>

                            {/* Glucose */}
                            {dashboardData?.glucose && (
                                <StyledView className="border-b border-neutral-100 pb-3 mb-3">
                                    <StyledView className="flex-row justify-between items-center">
                                        <StyledView className="flex-row items-center">
                                            <Ionicons name="water" size={18} color="#ff7d00" />
                                            <StyledText className="font-medium text-neutral-800 ml-2">
                                                Blood Glucose
                                            </StyledText>
                                        </StyledView>

                                        <StyledText className="font-bold text-neutral-800">
                                            {dashboardData.glucose.data?.slice(-1)[0]?.value || '--'} mg/dL
                                        </StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row justify-between mt-2">
                                        <StyledText className="text-sm text-neutral-500">
                                            Avg: {Math.round(dashboardData.glucose.average || 0)} mg/dL
                                        </StyledText>

                                        <StyledView className="flex-row items-center">
                                            <Ionicons
                                                name={getTrendIcon(dashboardData.glucose.trend)}
                                                size={14}
                                                color={getTrendColor(dashboardData.glucose.trend)}
                                            />
                                            <StyledText className={`text-xs ml-1 ${getTrendTextColor(dashboardData.glucose.trend)}`}>
                                                {formatTrend(dashboardData.glucose.trend)}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            )}

                            {/* Oxygen */}
                            {dashboardData?.oxygen && (
                                <StyledView className="pb-2">
                                    <StyledView className="flex-row justify-between items-center">
                                        <StyledView className="flex-row items-center">
                                            <Ionicons name="fitness" size={18} color="#3b82f6" />
                                            <StyledText className="font-medium text-neutral-800 ml-2">
                                                Oxygen Saturation
                                            </StyledText>
                                        </StyledView>

                                        <StyledText className="font-bold text-neutral-800">
                                            {dashboardData.oxygen.data?.slice(-1)[0]?.value || '--'}%
                                        </StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row justify-between mt-2">
                                        <StyledText className="text-sm text-neutral-500">
                                            Avg: {Math.round(dashboardData.oxygen.average || 0)}%
                                        </StyledText>

                                        <StyledView className="flex-row items-center">
                                            <Ionicons
                                                name={getTrendIcon(dashboardData.oxygen.trend)}
                                                size={14}
                                                color={getTrendColor(dashboardData.oxygen.trend)}
                                            />
                                            <StyledText className={`text-xs ml-1 ${getTrendTextColor(dashboardData.oxygen.trend)}`}>
                                                {formatTrend(dashboardData.oxygen.trend)}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            )}
                        </Card>
                    </StyledView>
                </StyledScrollView>
            )}
        </StyledView>
    );
};

// Helper functions
const formatMetricTypeName = (type) => {
    switch (type) {
        case 'heart_rate':
            return 'Heart Rate';
        case 'blood_pressure':
            return 'Blood Pressure';
        case 'glucose':
            return 'Blood Glucose';
        case 'temperature':
            return 'Body Temperature';
        case 'oxygen':
            return 'Oxygen Saturation';
        case 'weight':
            return 'Weight';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    }
};

const formatMetricValue = (metric) => {
    if (!metric) return '--';

    if (metric.type === 'blood_pressure' && metric.value) {
        return `${metric.value.systolic}/${metric.value.diastolic} mmHg`;
    }

    const value = typeof metric.value === 'object' ? metric.value.value : metric.value;

    switch (metric.type) {
        case 'heart_rate':
            return `${value} bpm`;
        case 'glucose':
            return `${value} mg/dL`;
        case 'temperature':
            return `${value} °C`;
        case 'oxygen':
            return `${value}%`;
        case 'weight':
            return `${value} kg`;
        default:
            return `${value} ${metric.unit || ''}`;
    }
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
    if (!trend) return 'Stable';
    return trend.charAt(0).toUpperCase() + trend.slice(1);
};

export default HealthDashboardScreen;