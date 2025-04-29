import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as reportApi from '../../api/report';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const ReportDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { reportId } = route.params;

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);

    useEffect(() => {
        const loadReport = async () => {
            try {
                setLoading(true);
                const response = await reportApi.getReport(reportId);
                setReport(response.data);
            } catch (error) {
                console.error('Error loading report:', error);
                Alert.alert('Error', 'Failed to load report details. Please try again.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [reportId, navigation]);

    const handleOpenFile = (url) => {
        // In a real implementation, this would open the file using the OS's default viewer
        Linking.openURL(url).catch((err) => {
            console.error('Error opening file:', err);
            Alert.alert('Error', 'Unable to open the file.');
        });
    };

    const handleRequestAnalysis = async () => {
        try {
            setLoading(true);
            await reportApi.processReport(reportId);

            // Reload report data
            const response = await reportApi.getReport(reportId);
            setReport(response.data);

            Alert.alert('Success', 'Report analysis requested. This may take a few minutes to complete.');
        } catch (error) {
            console.error('Error requesting analysis:', error);
            Alert.alert('Error', 'Failed to request report analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading report details..." />;
    }

    if (!report) {
        return (
            <StyledView className="flex-1 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
                <StyledText className="text-lg text-neutral-600 mt-4 text-center">
                    Report information not available.
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
                    <StyledText className="text-xl font-bold text-neutral-800">
                        Report Details
                    </StyledText>
                    <StyledText className="text-sm text-neutral-500">
                        {report.name}
                    </StyledText>
                </StyledView>

                <Badge
                    text={getAnalysisStatus(report.aiSummaryStatus)}
                    variant={getAnalysisStatusVariant(report.aiSummaryStatus)}
                    size="medium"
                />
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Basic Info */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="document-text" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Report Information
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row mb-2">
                        <StyledText className="text-neutral-600 w-24">Type:</StyledText>
                        <StyledText className="text-neutral-800 font-medium">
                            {report.type}
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row mb-2">
                        <StyledText className="text-neutral-600 w-24">Uploaded:</StyledText>
                        <StyledText className="text-neutral-800 font-medium">
                            {new Date(report.uploadedDate).toLocaleDateString()} at {new Date(report.uploadedDate).toLocaleTimeString()}
                        </StyledText>
                    </StyledView>

                    {report.isReviewed && (
                        <StyledView className="flex-row mb-2">
                            <StyledText className="text-neutral-600 w-24">Reviewed:</StyledText>
                            <StyledText className="text-neutral-800 font-medium">
                                {report.reviewedAt ? new Date(report.reviewedAt).toLocaleDateString() : 'Yes'}
                            </StyledText>
                        </StyledView>
                    )}
                </Card>

                {/* Report Preview */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="eye" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Report Preview
                        </StyledText>
                    </StyledView>

                    {report.mimeType && report.mimeType.startsWith('image/') ? (
                        <StyledImage
                            source={{ uri: report.fileUrl }}
                            className="w-full h-64 rounded-lg"
                            resizeMode="contain"
                        />
                    ) : (
                        <StyledView className="bg-neutral-100 p-4 rounded-lg items-center mb-2">
                            <Ionicons name="document" size={48} color="#6b7280" />
                            <StyledText className="text-neutral-700 mt-2">
                                {report.originalFilename || 'Report Document'}
                            </StyledText>
                            {report.fileSize && (
                                <StyledText className="text-neutral-500 text-sm">
                                    {formatFileSize(report.fileSize)}
                                </StyledText>
                            )}
                        </StyledView>
                    )}

                    <Button
                        title="Open Full Report"
                        variant="outline"
                        icon={<Ionicons name="open-outline" size={16} color="#1766da" />}
                        onPress={() => handleOpenFile(report.fileUrl)}
                        className="mt-2"
                        fullWidth
                    />
                </Card>

                {/* AI Analysis */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="analytics" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            AI Analysis
                        </StyledText>
                    </StyledView>

                    {report.aiSummaryStatus === 'completed' && report.aiSummary ? (
                        <StyledText className="text-neutral-700">
                            {report.aiSummary}
                        </StyledText>
                    ) : report.aiSummaryStatus === 'processing' ? (
                        <StyledView className="bg-primary-50 p-4 rounded-lg items-center">
                            <LoadingSpinner size="small" text="Analysis in progress..." />
                        </StyledView>
                    ) : report.aiSummaryStatus === 'failed' ? (
                        <StyledView className="bg-red-50 p-4 rounded-lg">
                            <StyledText className="text-red-700">
                                The AI analysis could not be completed for this report. You can try requesting analysis again.
                            </StyledText>
                            <Button
                                title="Request Analysis Again"
                                variant="outline"
                                onPress={handleRequestAnalysis}
                                className="mt-3"
                                fullWidth
                            />
                        </StyledView>
                    ) : (
                        <StyledView className="items-center p-4">
                            <StyledText className="text-neutral-600 mb-3">
                                No AI analysis available for this report yet.
                            </StyledText>
                            <Button
                                title="Request AI Analysis"
                                variant="primary"
                                onPress={handleRequestAnalysis}
                                fullWidth
                            />
                        </StyledView>
                    )}
                </Card>

                {/* Doctor's Notes */}
                {report.isReviewed && report.doctorNotes && (
                    <Card className="mb-6">
                        <StyledView className="flex-row items-center mb-2">
                            <Ionicons name="create" size={20} color="#1766da" />
                            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                                Doctor's Notes
                            </StyledText>
                        </StyledView>

                        <StyledText className="text-neutral-700">
                            {report.doctorNotes}
                        </StyledText>
                    </Card>
                )}
            </StyledScrollView>
        </StyledView>
    );
};

// Helper functions
const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            return 'Not Analyzed';
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

export default ReportDetailScreen;