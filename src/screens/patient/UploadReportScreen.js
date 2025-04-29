import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import * as reportApi from '../../api/report';
import * as diagnosisApi from '../../api/diagnosis';
import * as appointmentApi from '../../api/appointment';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const UploadReportScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { diagnosisId, appointmentId } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!diagnosisId || !!appointmentId);
    const [pendingTests, setPendingTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [customTestName, setCustomTestName] = useState('');
    const [reportFile, setReportFile] = useState(null);
    const [processingStage, setProcessingStage] = useState(null);

    useEffect(() => {
        const loadContext = async () => {
            try {
                if (diagnosisId) {
                    // Load pending tests from diagnosis
                    const response = await diagnosisApi.getDiagnosis(diagnosisId);
                    const diagnosis = response.data;

                    // Filter for approved but not completed tests
                    const approvedTests = diagnosis.suggestedTests
                        .filter(test => test.isApproved)
                        .map(test => ({
                            name: test.name,
                            id: test._id.toString(),
                            priority: test.priority
                        }));

                    setPendingTests(approvedTests);

                    // Select the first test by default
                    if (approvedTests.length > 0) {
                        setSelectedTest(approvedTests[0].name);
                    }
                } else if (appointmentId) {
                    // Load required reports from appointment
                    const response = await appointmentApi.getAppointment(appointmentId);
                    const appointment = response.data;

                    // Get required reports
                    const requiredReports = appointment.requiredReports || [];

                    // Convert to format similar to tests
                    const formattedReports = requiredReports.map(report => ({
                        name: report.name || 'Medical Report',
                        id: report._id.toString(),
                        isUploaded: report.isReviewed
                    }));

                    setPendingTests(formattedReports);

                    // Select the first non-uploaded report by default
                    const firstPendingReport = formattedReports.find(r => !r.isUploaded);
                    if (firstPendingReport) {
                        setSelectedTest(firstPendingReport.name);
                    }
                }
            } catch (error) {
                console.error('Error loading context:', error);
                Alert.alert('Error', 'Failed to load required tests. Please try again.');
            } finally {
                setInitialLoading(false);
            }
        };

        loadContext();
    }, [diagnosisId, appointmentId]);

    const handleSelectDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setReportFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const handleSelectImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant permission to access your photos');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setReportFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleTakePhoto = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant permission to access your camera');
                return;
            }

            // Take photo
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setReportFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleUploadReport = async () => {
        if (!reportFile) {
            Alert.alert('Missing File', 'Please select a report file to upload');
            return;
        }

        // Determine report name
        const reportName = selectedTest === 'other' ? customTestName : selectedTest;

        if (!reportName) {
            Alert.alert('Missing Information', 'Please select or enter a report name');
            return;
        }

        try {
            setLoading(true);
            setProcessingStage('uploading');

            // Prepare report data
            const reportData = {
                type: reportName,
                name: reportName,
            };

            if (diagnosisId) {
                reportData.diagnosisId = diagnosisId;
            }

            if (appointmentId) {
                reportData.appointmentId = appointmentId;
            }

            // Upload report
            const response = await reportApi.uploadReport(reportData, reportFile);

            setProcessingStage('analyzing');

            // Process the report with AI
            try {
                await reportApi.processReport(response.data._id);
            } catch (processError) {
                console.error('Error processing report:', processError);
                // Continue even if processing fails
            }

            setProcessingStage('completed');

            setTimeout(() => {
                Alert.alert(
                    'Report Uploaded',
                    'Your report has been successfully uploaded and is being analyzed by our AI. It will be available for review by your doctor.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            }, 1000);
        } catch (error) {
            console.error('Error uploading report:', error);
            Alert.alert('Error', 'Failed to upload report. Please try again.');
            setProcessingStage(null);
        } finally {
            setLoading(false);
        }
    };

    const renderProcessingStatus = () => {
        if (!processingStage) return null;

        return (
            <StyledView className="mt-6 bg-primary-50 p-4 rounded-lg">
                <StyledView className="flex-row items-center mb-2">
                    <Ionicons name="information-circle" size={24} color="#1766da" />
                    <StyledText className="text-lg font-bold text-primary-800 ml-2">
                        Processing Report
                    </StyledText>
                </StyledView>

                <StyledView className="flex-row items-center mb-2">
                    <StyledView className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                        <Ionicons name="checkmark" size={16} color="white" />
                    </StyledView>
                    <StyledText className="text-primary-800">Uploading report file</StyledText>
                </StyledView>

                <StyledView className="flex-row items-center mb-2">
                    {processingStage === 'analyzing' || processingStage === 'completed' ? (
                        <StyledView className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </StyledView>
                    ) : (
                        <StyledView className="w-6 h-6 rounded-full border-2 border-primary-300 mr-2" />
                    )}
                    <StyledText className={processingStage === 'analyzing' || processingStage === 'completed' ? "text-primary-800" : "text-primary-400"}>
                        Analyzing report content with AI
                    </StyledText>
                </StyledView>

                <StyledView className="flex-row items-center">
                    {processingStage === 'completed' ? (
                        <StyledView className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </StyledView>
                    ) : (
                        <StyledView className="w-6 h-6 rounded-full border-2 border-primary-300 mr-2" />
                    )}
                    <StyledText className={processingStage === 'completed' ? "text-primary-800" : "text-primary-400"}>
                        Notifying your doctor
                    </StyledText>
                </StyledView>
            </StyledView>
        );
    };

    if (initialLoading) {
        return <LoadingSpinner fullScreen text="Loading required tests..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 border-b border-neutral-200">
                <StyledView className="flex-row items-center">
                    <StyledTouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </StyledTouchableOpacity>

                    <StyledView className="flex-1">
                        <StyledText className="text-xl font-bold text-neutral-800">
                            Upload Medical Report
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {pendingTests.length > 0 ? (
                    <Card elevation={1} className="mb-4">
                        <StyledText className="text-lg font-bold text-neutral-800 mb-3">
                            Required Tests
                        </StyledText>

                        <StyledText className="text-neutral-700 mb-4">
                            Please select the test result you want to upload:
                        </StyledText>

                        {pendingTests.map((test, index) => (
                            <StyledTouchableOpacity
                                key={`test-${index}`}
                                className={`
                  flex-row items-center p-3 mb-2 rounded-lg
                  ${selectedTest === test.name ? 'bg-primary-50 border border-primary-200' : 'bg-neutral-50 border border-neutral-200'}
                `}
                                onPress={() => setSelectedTest(test.name)}
                            >
                                <StyledView className={`
                  w-5 h-5 rounded-full mr-3 items-center justify-center
                  ${selectedTest === test.name ? 'bg-primary-500' : 'bg-white border border-neutral-300'}
                `}>
                                    {selectedTest === test.name && (
                                        <Ionicons name="checkmark" size={12} color="white" />
                                    )}
                                </StyledView>

                                <StyledView className="flex-1">
                                    <StyledText className={`font-medium ${selectedTest === test.name ? 'text-primary-800' : 'text-neutral-800'}`}>
                                        {test.name}
                                    </StyledText>

                                    {test.priority && (
                                        <StyledText className="text-xs text-neutral-500">
                                            Priority: {test.priority.charAt(0).toUpperCase() + test.priority.slice(1)}
                                        </StyledText>
                                    )}
                                </StyledView>

                                {test.isUploaded && (
                                    <StyledView className="bg-green-100 px-2 py-1 rounded-full">
                                        <StyledText className="text-xs text-green-800">
                                            Already Uploaded
                                        </StyledText>
                                    </StyledView>
                                )}
                            </StyledTouchableOpacity>
                        ))}

                        <StyledTouchableOpacity
                            className={`
                flex-row items-center p-3 mb-2 rounded-lg
                ${selectedTest === 'other' ? 'bg-primary-50 border border-primary-200' : 'bg-neutral-50 border border-neutral-200'}
              `}
                            onPress={() => setSelectedTest('other')}
                        >
                            <StyledView className={`
                w-5 h-5 rounded-full mr-3 items-center justify-center
                ${selectedTest === 'other' ? 'bg-primary-500' : 'bg-white border border-neutral-300'}
              `}>
                                {selectedTest === 'other' && (
                                    <Ionicons name="checkmark" size={12} color="white" />
                                )}
                            </StyledView>

                            <StyledText className={`font-medium ${selectedTest === 'other' ? 'text-primary-800' : 'text-neutral-800'}`}>
                                Other Test or Report
                            </StyledText>
                        </StyledTouchableOpacity>

                        {selectedTest === 'other' && (
                            <Input
                                placeholder="Enter test or report name"
                                value={customTestName}
                                onChangeText={setCustomTestName}
                                className="mt-2"
                            />
                        )}
                    </Card>
                ) : (
                    <Card elevation={1} className="mb-4">
                        <StyledText className="text-lg font-bold text-neutral-800 mb-3">
                            Upload Medical Report
                        </StyledText>

                        <StyledText className="text-neutral-700 mb-4">
                            Please specify the type of medical report you're uploading:
                        </StyledText>

                        <Input
                            placeholder="Enter report name/type"
                            value={customTestName}
                            onChangeText={setCustomTestName}
                        />
                    </Card>
                )}

                <Card elevation={1} className="mb-6">
                    <StyledText className="text-lg font-bold text-neutral-800 mb-3">
                        Upload Report File
                    </StyledText>

                    {reportFile ? (
                        <StyledView className="items-center mb-4">
                            {reportFile.type?.startsWith('image/') || reportFile.mimeType?.startsWith('image/') ? (
                                <StyledImage
                                    source={{ uri: reportFile.uri }}
                                    className="w-full h-64 rounded-lg"
                                    resizeMode="contain"
                                />
                            ) : (
                                <StyledView className="w-full h-64 rounded-lg bg-neutral-100 items-center justify-center">
                                    <Ionicons name="document-text" size={64} color="#6b7280" />
                                    <StyledText className="text-neutral-700 mt-2 font-medium">
                                        {reportFile.name || 'Document Selected'}
                                    </StyledText>
                                    <StyledText className="text-neutral-500 text-sm">
                                        {formatFileSize(reportFile.size)}
                                    </StyledText>
                                </StyledView>
                            )}

                            <StyledTouchableOpacity
                                className="absolute top-2 right-2 bg-neutral-800/70 p-2 rounded-full"
                                onPress={() => setReportFile(null)}
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </StyledTouchableOpacity>
                        </StyledView>
                    ) : (
                        <StyledView className="border-2 border-dashed border-neutral-300 rounded-lg p-6 mb-4 items-center">
                            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                            <StyledText className="text-neutral-500 text-center mt-2">
                                No file selected. Please select a document or take a photo.
                            </StyledText>
                        </StyledView>
                    )}

                    <StyledView className="flex-row justify-between">
                        <Button
                            title="Select File"
                            variant="outline"
                            icon={<Ionicons name="document-outline" size={16} color="#1766da" />}
                            onPress={handleSelectDocument}
                            className="flex-1 mr-2"
                            disabled={loading}
                        />

                        <Button
                            title="Take Photo"
                            variant="outline"
                            icon={<Ionicons name="camera-outline" size={16} color="#1766da" />}
                            onPress={handleTakePhoto}
                            className="flex-1 ml-2"
                            disabled={loading}
                        />
                    </StyledView>

                    <Button
                        title="Select from Gallery"
                        variant="outline"
                        icon={<Ionicons name="images-outline" size={16} color="#1766da" />}
                        onPress={handleSelectImage}
                        className="mt-3"
                        fullWidth
                        disabled={loading}
                    />
                </Card>

                <Button
                    title={loading ? "Processing..." : "Upload Report"}
                    variant="primary"
                    onPress={handleUploadReport}
                    loading={loading}
                    disabled={!reportFile || loading || (selectedTest === 'other' && !customTestName)}
                    fullWidth
                    size="large"
                    className="mb-4"
                />

                {renderProcessingStatus()}
            </StyledScrollView>
        </StyledView>
    );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default UploadReportScreen;