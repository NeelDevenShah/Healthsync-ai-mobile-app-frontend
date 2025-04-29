import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as reportApi from '../../api/report';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const DoctorReportDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { reportId } = route.params;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [report, setReport] = useState(null);
    const [doctorNotes, setDoctorNotes] = useState('');

    useEffect(() => {
        const loadReport = async () => {
            try {
                setLoading(true);
                const response = await reportApi.getReport(reportId);
                const reportData = response.data;
                setReport(reportData);

                // Pre-populate notes if they exist
                if (reportData.doctorNotes) {
                    setDoctorNotes(reportData.doctorNotes);
                }
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

    const handleSubmitReview = async () => {
        try {
            setSubmitting(true);

            await reportApi.updateReportNotes(reportId, doctorNotes);

            Alert.alert(
                'Report Reviewed',
                'Your review has been submitted successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
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
                {/* Patient Info */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="person" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Patient Information
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-neutral-800 font-medium">
                        {report.patientId?.name?.first} {report.patientId?.name?.last}
                    </StyledText>

                    <StyledView className="flex-row mt-2">
                        <StyledText className="text-neutral-600">Uploaded:</StyledText>
                        <StyledText className="text-neutral-800 ml-1">
                            {new Date(report.uploadedDate).toLocaleDateString()} at {new Date(report.uploadedDate).toLocaleTimeString()}
                        </StyledText>
                    </StyledView>

                    <Button
                        title="View Patient Details"
                        variant="outline"
                        size="small"
                        onPress={() => navigation.navigate('DoctorPatientDetail', { patientId: report.patientId._id })}
                        className="mt-3 self-end"
                    />
                </Card>

                {/* Report Preview */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="document-text" size={20} color="#1766da" />
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
                        title="Download Full Report"
                        variant="outline"
                        icon={<Ionicons name="download-outline" size={16} color="#1766da" />}
                        onPress={() => {
                            // In a real implementation, this would download the file
                            Alert.alert('Feature', 'File download would be implemented here');
                        }}
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
                                The AI analysis could not be completed for this report. Please rely on your medical expertise to review this report.
                            </StyledText>
                        </StyledView>
                    ) : (
                        <StyledText className="text-neutral-600 italic">
                            Waiting for AI analysis to begin...
                        </StyledText>
                    )}
                </Card>

                {/* Doctor's Notes */}
                <Card className="mb-6">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="create" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Your Assessment
                        </StyledText>
                    </StyledView>

                    <Input
                        placeholder="Add your notes about this report..."
                        value={doctorNotes}
                        onChangeText={setDoctorNotes}
                        multiline
                        numberOfLines={6}
                    />

                    <StyledText className="text-sm text-neutral-500 mt-2 mb-3">
                        These notes will be visible to the patient to help them understand their results.
                    </StyledText>

                    <Button
                        title={submitting ? "Submitting..." : "Submit Review"}
                        variant="primary"
                        loading={submitting}
                        disabled={submitting}
                        onPress={handleSubmitReview}
                        fullWidth
                    />
                </Card>
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

export default DoctorReportDetailScreen;