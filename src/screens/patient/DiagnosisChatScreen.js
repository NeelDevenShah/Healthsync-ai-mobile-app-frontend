import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GiftedChat, Bubble, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';

import * as diagnosisApi from '../../api/diagnosis';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DiagnosisChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { isNew, diagnosisId: existingDiagnosisId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [diagnosis, setDiagnosis] = useState(null);
    const [diagnosisId, setDiagnosisId] = useState(existingDiagnosisId);
    const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);

    const loadDiagnosis = useCallback(async () => {
        try {
            setLoading(true);

            if (diagnosisId) {
                // Load existing diagnosis
                const response = await diagnosisApi.getDiagnosis(diagnosisId);
                const diagnosisData = response.data;
                setDiagnosis(diagnosisData);

                // Check if diagnosis is already completed
                if (diagnosisData.status !== 'ongoing') {
                    setDiagnosisCompleted(true);
                }

                // Convert conversation history to GiftedChat format
                const formattedMessages = diagnosisData.conversationHistory
                    .map((msg, index) => ({
                        _id: index,
                        text: msg.message,
                        createdAt: new Date(msg.timestamp),
                        user: {
                            _id: msg.role === 'patient' ? 1 : 2,
                            name: msg.role === 'patient' ? 'You' : 'AI Assistant',
                            avatar: msg.role === 'patient' ? null : require('../../../assets/ai-avatar.png'),
                        },
                        // Add image if attachments exist
                        image: msg.attachments && msg.attachments.length > 0 ? msg.attachments[0].url : null,
                        attachments: msg.attachments,
                    }))
                    .reverse(); // GiftedChat expects newest messages first

                setMessages(formattedMessages);
            } else if (isNew) {
                // Start a new diagnosis
                const symptomDescription = "I'd like to discuss some symptoms I've been experiencing.";
                const response = await diagnosisApi.startDiagnosis(symptomDescription);
                const newDiagnosis = response.data;
                setDiagnosis(newDiagnosis);
                setDiagnosisId(newDiagnosis._id);

                // Format initial messages
                const formattedMessages = newDiagnosis.conversationHistory
                    .map((msg, index) => ({
                        _id: index,
                        text: msg.message,
                        createdAt: new Date(msg.timestamp),
                        user: {
                            _id: msg.role === 'patient' ? 1 : 2,
                            name: msg.role === 'patient' ? 'You' : 'AI Assistant',
                            avatar: msg.role === 'patient' ? null : require('../../../assets/ai-avatar.png'),
                        },
                    }))
                    .reverse();

                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Error loading diagnosis:', error);
            Alert.alert('Error', 'Failed to load or start diagnosis. Please try again.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [diagnosisId, isNew, navigation]);

    useEffect(() => {
        loadDiagnosis();
    }, [loadDiagnosis]);

    const onSend = useCallback(async (newMessages = []) => {
        try {
            if (diagnosisCompleted) {
                Alert.alert('Diagnosis Completed', 'This diagnosis session has been completed. You cannot send more messages.');
                return;
            }

            const userMessage = newMessages[0];

            // Add message to UI immediately
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

            // Send message to API
            setSending(true);
            const response = await diagnosisApi.addMessage(
                diagnosisId,
                userMessage.text,
                []
            );

            // Get updated diagnosis with AI response
            const updatedDiagnosis = response.data;
            setDiagnosis(updatedDiagnosis);

            // Get the new AI message
            const newAiMessage = updatedDiagnosis.conversationHistory
                .filter(msg => msg.role === 'ai')
                .pop();

            if (newAiMessage) {
                const aiMessageFormatted = {
                    _id: Math.random().toString(),
                    text: newAiMessage.message,
                    createdAt: new Date(newAiMessage.timestamp),
                    user: {
                        _id: 2,
                        name: 'AI Assistant',
                        avatar: require('../../../assets/ai-avatar.png'),
                    },
                };

                // Add AI response to messages
                setMessages(previousMessages => GiftedChat.append(previousMessages, [aiMessageFormatted]));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    }, [diagnosisId, diagnosisCompleted]);

    const handlePickImage = async () => {
        try {
            if (diagnosisCompleted) {
                Alert.alert('Diagnosis Completed', 'This diagnosis session has been completed. You cannot send more messages.');
                return;
            }

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
                const selectedImage = result.assets[0];

                // Create a message with the image
                const imageMessage = {
                    _id: Math.random().toString(),
                    text: 'I\'m sharing this image to help with the diagnosis',
                    createdAt: new Date(),
                    user: {
                        _id: 1,
                        name: 'You',
                    },
                    image: selectedImage.uri,
                };

                // Add message to UI immediately
                setMessages(previousMessages => GiftedChat.append(previousMessages, [imageMessage]));

                // Send message with image to API
                setSending(true);

                try {
                    const response = await diagnosisApi.addMessage(
                        diagnosisId,
                        imageMessage.text,
                        [{ uri: selectedImage.uri, type: selectedImage.type || 'image/jpeg' }]
                    );

                    // Get updated diagnosis with AI response
                    const updatedDiagnosis = response.data;
                    setDiagnosis(updatedDiagnosis);

                    // Get the new AI message
                    const newAiMessage = updatedDiagnosis.conversationHistory
                        .filter(msg => msg.role === 'ai')
                        .pop();

                    if (newAiMessage) {
                        const aiMessageFormatted = {
                            _id: Math.random().toString(),
                            text: newAiMessage.message,
                            createdAt: new Date(newAiMessage.timestamp),
                            user: {
                                _id: 2,
                                name: 'AI Assistant',
                                avatar: require('../../../assets/ai-avatar.png'),
                            },
                        };

                        // Add AI response to messages
                        setMessages(previousMessages => GiftedChat.append(previousMessages, [aiMessageFormatted]));
                    }
                } catch (error) {
                    console.error('Error sending image message:', error);
                    Alert.alert('Error', 'Failed to send image. Please try again.');
                } finally {
                    setSending(false);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleCompleteDiagnosis = async () => {
        try {
            if (diagnosisCompleted) {
                navigation.navigate('DiagnosisDetail', { diagnosisId });
                return;
            }

            setLoading(true);
            const response = await diagnosisApi.completeDiagnosis(diagnosisId);
            setDiagnosis(response.data);
            setDiagnosisCompleted(true);
            navigation.navigate('DiagnosisDetail', { diagnosisId });
        } catch (error) {
            console.error('Error completing diagnosis:', error);
            Alert.alert('Error', 'Failed to complete diagnosis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text={isNew ? "Starting new diagnosis..." : "Loading diagnosis conversation..."} />;
    }

    // Customize bubble component
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#f3f4f6',
                    },
                    right: {
                        backgroundColor: '#1766da',
                    },
                }}
                textStyle={{
                    left: {
                        color: '#1f2937',
                    },
                    right: {
                        color: 'white',
                    },
                }}
            />
        );
    };

    // Customize input toolbar
    const renderInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: 'white',
                    borderTopColor: '#e5e7eb',
                    borderTopWidth: 1,
                    padding: 5,
                }}
            />
        );
    };

    // Customize send button
    const renderSend = (props) => {
        return (
            <Send
                {...props}
                containerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 5,
                    marginBottom: 5,
                }}
            >
                <StyledView className="bg-primary-500 rounded-full w-10 h-10 items-center justify-center">
                    <Ionicons name="send" size={18} color="white" />
                </StyledView>
            </Send>
        );
    };

    // Customize composer
    const renderComposer = (props) => {
        return (
            <StyledView className="flex-row items-center flex-1">
                <StyledTouchableOpacity
                    className="ml-1 mr-2"
                    onPress={handlePickImage}
                    disabled={diagnosisCompleted}
                >
                    <Ionicons name="image-outline" size={24} color={diagnosisCompleted ? "#d1d5db" : "#6b7280"} />
                </StyledTouchableOpacity>
                <Composer
                    {...props}
                    textInputStyle={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 20,
                        paddingHorizontal: 12,
                        paddingTop: 8,
                        paddingBottom: 8,
                        marginRight: 5,
                        fontSize: 16,
                        lineHeight: 20,
                    }}
                    placeholder="Type your symptoms..."
                    placeholderTextColor="#9ca3af"
                    disableComposer={diagnosisCompleted}
                />
            </StyledView>
        );
    };

    // Render loading indicator
    const renderLoading = () => {
        return sending ? (
            <StyledView className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/10">
                <StyledView className="bg-white p-3 rounded-lg">
                    <ActivityIndicator size="large" color="#1766da" />
                    <StyledText className="text-neutral-600 text-center mt-2">Processing...</StyledText>
                </StyledView>
            </StyledView>
        ) : null;
    };

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 flex-row justify-between items-center border-b border-neutral-200">
                <StyledTouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-4"
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </StyledTouchableOpacity>

                <StyledView className="flex-1">
                    <StyledText className="text-lg font-bold text-neutral-800">
                        AI Diagnosis Assistant
                    </StyledText>
                    {diagnosis?.status && (
                        <StyledText className="text-sm text-neutral-500">
                            Status: {formatStatus(diagnosis.status)}
                        </StyledText>
                    )}
                </StyledView>

                <Button
                    title={diagnosisCompleted ? "View Summary" : "Complete"}
                    variant="primary"
                    size="small"
                    onPress={handleCompleteDiagnosis}
                />
            </StyledView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
            >
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                    renderBubble={renderBubble}
                    renderInputToolbar={renderInputToolbar}
                    renderSend={renderSend}
                    renderComposer={renderComposer}
                    renderLoading={renderLoading}
                    scrollToBottom
                    alwaysShowSend
                    scrollToBottomComponent={() => (
                        <Ionicons name="chevron-down" size={24} color="#6b7280" />
                    )}
                    renderAvatar={null}
                    minInputToolbarHeight={60}
                    maxComposerHeight={100}
                    disableComposer={diagnosisCompleted}
                />
            </KeyboardAvoidingView>
        </StyledView>
    );
};

// Helper function to format status text
const formatStatus = (status) => {
    switch (status) {
        case 'ongoing':
            return 'Ongoing';
        case 'pending_doctor_review':
            return 'Pending Doctor Review';
        case 'pending_reports':
            return 'Pending Reports';
        case 'completed':
            return 'Completed';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
};

export default DiagnosisChatScreen;