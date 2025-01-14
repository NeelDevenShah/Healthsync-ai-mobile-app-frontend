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

const DoctorDiagnosesScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [diagnoses, setDiagnoses] = useState([]);

    const loadDiagnoses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await doctorApi.getPendingDiagnoses();
            setDiagnoses(response.data || []);
        } catch (error) {
            console.error('Error loading diagnoses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDiagnoses();
    }, [loadDiagnoses]);

    const onRefresh = () => {
        setRefreshing(true);
        loadDiagnoses();
    };

    const renderDiagnosisItem = ({ item }) => {
        const diagnosis = item;

        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('DoctorHomeTab', { screen: 'DoctorDiagnosisDetail', params: { diagnosisId: diagnosis._id } })}
            >
                <StyledView className="flex-row items-start">
                    <StyledView className="bg-secondary-100 rounded-lg p-3 mr-3">
                        <Ionicons name="medkit" size={24} color="#2d9d91" />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {diagnosis.patientId?.name?.first} {diagnosis.patientId?.name?.last}
                        </StyledText>

                        <StyledText className="text-neutral-600 mt-1 mb-2 line-clamp-2">
                            {truncateSummary(diagnosis.aiSummary, 100) || 'No summary available'}
                        </StyledText>

                        <StyledView className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                            <StyledText className="text-neutral-500 ml-1">
                                {formatTimestamp(diagnosis.updatedAt)}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <Badge
                        text={formatStatus(diagnosis.status)}
                        variant={getStatusVariant(diagnosis.status)}
                        size="small"
                    />
                </StyledView>

                {diagnosis.suggestedTests && diagnosis.suggestedTests.length > 0 && (
                    <StyledView className="mt-3 pt-3 border-t border-neutral-100">
                        <StyledText className="text-sm text-neutral-600">
                            <Ionicons name="clipboard-outline" size={14} color="#6b7280" /> Suggested Tests: {diagnosis.suggestedTests.length}
                        </StyledText>
                    </StyledView>
                )}
            </Card>
        );
    };

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen text="Loading diagnoses..." />;
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
                        Pending Diagnoses
                    </StyledText>
                </StyledView>
            </StyledView>

            <FlatList
                data={diagnoses}
                renderItem={renderDiagnosisItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingVertical: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Pending Diagnoses"
                        message="You don't have any diagnoses pending review at the moment."
                        icon={<Ionicons name="medkit-outline" size={60} color="#9ca3af" />}
                    />
                }
            />
        </StyledView>
    );
};

// Helper functions
const truncateSummary = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

const formatStatus = (status) => {
    switch (status) {
        case 'ongoing':
            return 'Ongoing';
        case 'pending_doctor_review':
            return 'Needs Review';
        case 'pending_reports':
            return 'Waiting Reports';
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

export default DoctorDiagnosesScreen;