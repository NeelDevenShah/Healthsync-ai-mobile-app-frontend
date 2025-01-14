import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import * as medicationApi from '../../api/medication';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const UploadPrescriptionScreen = () => {
    const navigation = useNavigation();

    const [prescriptionImage, setPrescriptionImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processingStage, setProcessingStage] = useState(null);
    const [uploadedMedication, setUploadedMedication] = useState(null);

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
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPrescriptionImage(result.assets[0]);
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
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPrescriptionImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleUploadPrescription = async () => {
        if (!prescriptionImage) {
            Alert.alert('Missing Image', 'Please select or take a photo of your prescription');
            return;
        }

        try {
            setLoading(true);
            setProcessingStage('uploading');

            // Upload prescription
            const response = await medicationApi.uploadPrescription(prescriptionImage);
            const medicationId = response.data._id;

            setProcessingStage('parsing');

            // Process the prescription with AI
            const parseResponse = await medicationApi.parsePrescription(medicationId);

            // Get the processed medication data
            const medicationResponse = await medicationApi.getMedication(medicationId);
            setUploadedMedication(medicationresponse.data);

            setProcessingStage('completed');
        } catch (error) {
            console.error('Error uploading prescription:', error);
            Alert.alert('Error', 'Failed to upload prescription. Please try again.');
            setProcessingStage(null);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMedication = () => {
        if (uploadedMedication) {
            navigation.navigate('MedicationDetail', { medicationId: uploadedMedication._id });
        }
    };

    const renderProcessingStatus = () => {
        if (!processingStage) return null;

        return (
            <StyledView className="mt-6 bg-primary-50 p-4 rounded-lg">
                <StyledView className="flex-row items-center mb-2">
                    <Ionicons name="information-circle" size={24} color="#1766da" />
                    <StyledText className="text-lg font-bold text-primary-800 ml-2">
                        Processing Prescription
                    </StyledText>
                </StyledView>

                <StyledView className="flex-row items-center mb-2">
                    <StyledView className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                        <Ionicons name="checkmark" size={16} color="white" />
                    </StyledView>
                    <StyledText className="text-primary-800">Uploading prescription image</StyledText>
                </StyledView>

                <StyledView className="flex-row items-center mb-2">
                    {processingStage === 'parsing' || processingStage === 'completed' ? (
                        <StyledView className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </StyledView>
                    ) : (
                        <StyledView className="w-6 h-6 rounded-full border-2 border-primary-300 mr-2" />
                    )}
                    <StyledText className={processingStage === 'parsing' || processingStage === 'completed' ? "text-primary-800" : "text-primary-400"}>
                        Analyzing prescription with AI
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
                        Setting up medication reminders
                    </StyledText>
                </StyledView>

                {processingStage === 'completed' && (
                    <Button
                        title="View Medication Details"
                        variant="primary"
                        onPress={handleViewMedication}
                        className="mt-4"
                        fullWidth
                    />
                )}
            </StyledView>
        );
    };

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
                            Upload Prescription
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                <Card elevation={1} className="mb-6">
                    <StyledText className="text-neutral-700 mb-4">
                        Take a clear photo of your prescription or upload an existing image. Our AI will analyze it and set up your medication reminders automatically.
                    </StyledText>

                    {prescriptionImage ? (
                        <StyledView className="items-center mb-4">
                            <StyledImage
                                source={{ uri: prescriptionImage.uri }}
                                className="w-full h-64 rounded-lg"
                                resizeMode="contain"
                            />

                            <StyledTouchableOpacity
                                className="absolute top-2 right-2 bg-neutral-800/70 p-2 rounded-full"
                                onPress={() => setPrescriptionImage(null)}
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </StyledTouchableOpacity>
                        </StyledView>
                    ) : (
                        <StyledView className="border-2 border-dashed border-neutral-300 rounded-lg p-6 mb-4 items-center">
                            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                            <StyledText className="text-neutral-500 text-center mt-2">
                                No prescription selected. Please take a photo or upload an image.
                            </StyledText>
                        </StyledView>
                    )}

                    <StyledView className="flex-row justify-between">
                        <Button
                            title="Select from Gallery"
                            variant="outline"
                            icon={<Ionicons name="images-outline" size={16} color="#1766da" />}
                            onPress={handleSelectImage}
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
                </Card>

                <Button
                    title={loading ? "Processing..." : "Upload Prescription"}
                    variant="primary"
                    onPress={handleUploadPrescription}
                    loading={loading}
                    disabled={!prescriptionImage || loading}
                    fullWidth
                    size="large"
                    className="mb-4"
                />

                {renderProcessingStatus()}

                <StyledView className="mt-6 mb-8">
                    <StyledText className="text-lg font-bold text-neutral-800 mb-3">
                        Tips for Better Results
                    </StyledText>

                    <StyledView className="flex-row items-start mb-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" className="mt-0.5 mr-2" />
                        <StyledText className="flex-1 text-neutral-700">
                            Ensure good lighting when taking a photo of your prescription
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-start mb-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" className="mt-0.5 mr-2" />
                        <StyledText className="flex-1 text-neutral-700">
                            Make sure all text is clearly visible and not cut off
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-start mb-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" className="mt-0.5 mr-2" />
                        <StyledText className="flex-1 text-neutral-700">
                            Include all medication details, dosage instructions, and doctor's signature
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledView>
    );
};

export default UploadPrescriptionScreen;