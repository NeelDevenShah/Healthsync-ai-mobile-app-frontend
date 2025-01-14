import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as patientApi from '../../api/patient';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ReportsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reports, setReports] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);

            let filters = {};
            if (activeFilter === 'reviewed') {
                filters.isReviewed = true;
            } else if (activeFilter === 'pending') {
                filters.isReviewed = false;
            }

            const response = await patientApi.getPatientReports(filters);
            setReports(response.data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        loadReports();
    };

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleFilterChange = (filter) => {
        if (filter !== activeFilter) {
            setActiveFilter(filter);
        }
    };

    const renderReportItem = ({ item }) => {
        const report = item;

        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('ReportDetail', { reportId: report._id })}
            >
                <StyledView className="flex-row items-center">
                    <StyledView className="bg-accent-100 rounded-lg p-3 mr-3">
                        <Ionicons name="document-text" size={24} color="#ff7d00" />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {report.name}
                        </StyledText>
                        <StyledText className="text-neutral-600">
                            {report.type}
                        </StyledText>
                        <StyledView className="flex-row items-center mt-1">
                            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                            <StyledText className="text-neutral-500 ml-1">
                                {formatDate(report.uploadedDate)}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <Badge
                        text={report.isReviewed ? 'Reviewed' : 'Pending'}
                        variant={report.isReviewed ? 'success' : 'warning'}
                        size="small"
                    />
                </StyledView>

                {report.doctorNotes && (
                    <StyledView className="mt-3 pt-3 border-t border-neutral-100">
                        <StyledText className="text-neutral-600 text-sm">
                            <StyledText className="font-bold">Doctor's Notes: </StyledText>
                            {report.doctorNotes}
                        </StyledText>
                    </StyledView>
                )}
            </Card>
        );
    };

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
                        Medical Reports
                    </StyledText>
                </StyledView>

                <Button
                    title="Upload"
                    variant="primary"
                    size="small"
                    icon={<Ionicons name="add" size={18} color="white" />}
                    onPress={() => navigation.navigate('UploadReport')}
                />
            </StyledView>

            {/* Filter Tabs */}
            <StyledView className="flex-row justify-around border-b border-neutral-200 py-2 bg-white">
                <StyledTouchableOpacity
                    className={`pb-2 px-4 ${activeFilter === 'all' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('all')}
                >
                    <StyledText className={activeFilter === 'all' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        All Reports
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-4 ${activeFilter === 'reviewed' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('reviewed')}
                >
                    <StyledText className={activeFilter === 'reviewed' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Reviewed
                    </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity
                    className={`pb-2 px-4 ${activeFilter === 'pending' ? 'border-b-2 border-primary-500' : ''}`}
                    onPress={() => handleFilterChange('pending')}
                >
                    <StyledText className={activeFilter === 'pending' ? 'text-primary-500 font-bold' : 'text-neutral-600'}>
                        Pending
                    </StyledText>
                </StyledTouchableOpacity>
            </StyledView>

            {/* Reports List */}
            {loading && !refreshing ? (
                <LoadingSpinner text="Loading reports..." />
            ) : (
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
                            title="No Reports Found"
                            message={getEmptyStateMessage(activeFilter)}
                            icon={<Ionicons name="document-text-outline" size={60} color="#9ca3af" />}
                            actionLabel="Upload Report"
                            onAction={() => navigation.navigate('UploadReport')}
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

const getEmptyStateMessage = (filter) => {
    switch (filter) {
        case 'all':
            return 'You don\'t have any medical reports uploaded yet.';
        case 'reviewed':
            return 'No reviewed reports found.';
        case 'pending':
            return 'No pending reports. All your reports have been reviewed!';
        default:
            return 'No reports found.';
    }
};

export default ReportsScreen;