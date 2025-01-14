import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorReportsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reports, setReports] = useState([]);

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await doctorApi.getPendingReports();
            setReports(response.data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const onRefresh = () => {
        setRefreshing(true);
        loadReports();
    };

    const renderReportItem = ({ item }) => {
        const report = item;

        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('DoctorReportDetail', { reportId: report._id })}
            >
                <StyledView className="flex-row items-start">
                    <StyledView className="bg-accent-100 rounded-lg p-3 mr-3">
                        <Ionicons
                            name={getReportTypeIcon(report.type)}
                            size={24}
                            color="#ff7d00"
                        />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {report.name}
                        </StyledText>

                        <StyledText className="text-neutral-600">
                            {report.patientId?.name?.first} {report.patientId?.name?.last}
                        </StyledText>

                        <StyledView className="flex-row items-center mt-1">
                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                            <StyledText className="text-neutral-500 ml-1">
                                Uploaded: {formatTimestamp(report.uploadedDate)}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <Badge
                        text={getAnalysisStatus(report.aiSummaryStatus)}
                        variant={getAnalysisStatusVariant(report.aiSummaryStatus)}
                        size="small"
                    />
                </StyledView>

                {report.appointmentId && (
                    <StyledView className="mt-3 pt-3 border-t border-neutral-100">
                        <StyledText className="text-sm text-neutral-600">
                            <Ionicons name="calendar-outline" size={14} color="#6b7280" /> Linked to appointment
                        </StyledText>
                    </StyledView>
                )}
            </Card>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading reports..." />;
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
                        Pending Reports
                    </StyledText>
                </StyledView>
            </StyledView>

            <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingVertical: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Pending Reports"
                        message="You don't have any reports pending review at the moment."
                        icon={<Ionicons name="document-text-outline" size={60} color="#9ca3af" />}
                    />
                }
            />
        </StyledView>
    );
};

// Helper functions
const getReportTypeIcon = (type) => {
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

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
        return date.toLocaleDateString();
    } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};

const getAnalysisStatus = (status) => {
    switch (status) {
        case 'pending':
            return 'Pending Analysis';
        case 'processing':
            return 'Analyzing';
        case 'completed':
            return 'Analysis Ready';
        case 'failed':
            return 'Analysis Failed';
        default:
            return 'Unknown Status';
    }
};

const getAnalysisStatusVariant = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'processing':
            return 'primary';
        case 'completed':
            return 'success';
        case 'failed':
            return 'error';
        default:
            return 'neutral';
    }
};

export default DoctorReportsScreen;