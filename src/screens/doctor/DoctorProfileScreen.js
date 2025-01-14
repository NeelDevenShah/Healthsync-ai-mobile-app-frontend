import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSwitch = styled(Switch);

const DoctorProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout, updateUserProfile } = useAuth();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: {
            first: '',
            last: ''
        },
        email: '',
        phone: '',
        specialization: '',
        biography: '',
        currentlyAvailable: true
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: {
                    first: user.name?.first || '',
                    last: user.name?.last || ''
                },
                email: user.email || '',
                phone: user.phone || '',
                specialization: user.specialization || '',
                biography: user.biography || '',
                currentlyAvailable: user.currentlyAvailable !== false // Default to true if not set
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            await updateUserProfile(profileData);

            setEditMode(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Logging out..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-white pt-14 pb-2 px-4 flex-row items-center border-b border-neutral-200">
                <StyledView className="flex-1">
                    <StyledText className="text-xl font-bold text-neutral-800">
                        My Profile
                    </StyledText>
                </StyledView>

                {!editMode ? (
                    <Button
                        title="Edit"
                        variant="outline"
                        icon={<Ionicons name="create-outline" size={16} color="#1766da" />}
                        onPress={() => setEditMode(true)}
                        size="small"
                    />
                ) : (
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => {
                            setEditMode(false);
                            // Reset form data to current user data
                            if (user) {
                                setProfileData({
                                    name: {
                                        first: user.name?.first || '',
                                        last: user.name?.last || ''
                                    },
                                    email: user.email || '',
                                    phone: user.phone || '',
                                    specialization: user.specialization || '',
                                    biography: user.biography || '',
                                    currentlyAvailable: user.currentlyAvailable !== false
                                });
                            }
                        }}
                        size="small"
                    />
                )}
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Profile Card */}
                <Card className="mb-4">
                    <StyledView className="items-center mb-4">
                        <StyledView className="bg-primary-100 rounded-full p-6 mb-2">
                            <Ionicons name="person" size={40} color="#1766da" />
                        </StyledView>

                        {editMode ? (
                            <StyledView className="w-full">
                                <StyledView className="flex-row space-x-2 mb-2">
                                    <Input
                                        placeholder="First Name"
                                        value={profileData.name.first}
                                        onChangeText={(value) => handleChange('name.first', value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        placeholder="Last Name"
                                        value={profileData.name.last}
                                        onChangeText={(value) => handleChange('name.last', value)}
                                        className="flex-1"
                                    />
                                </StyledView>

                                <Input
                                    placeholder="Specialization"
                                    value={profileData.specialization}
                                    onChangeText={(value) => handleChange('specialization', value)}
                                />
                            </StyledView>
                        ) : (
                            <>
                                <StyledText className="text-xl font-bold text-neutral-800">
                                    Dr. {profileData.name.first} {profileData.name.last}
                                </StyledText>
                                <StyledText className="text-neutral-600">
                                    {profileData.specialization || 'Specialization not set'}
                                </StyledText>
                            </>
                        )}
                    </StyledView>

                    <StyledView className="flex-row justify-between items-center py-2 border-t border-neutral-100">
                        <StyledText className="font-medium text-neutral-700">
                            Currently Available
                        </StyledText>
                        <StyledSwitch
                            value={profileData.currentlyAvailable}
                            onValueChange={(value) => handleChange('currentlyAvailable', value)}
                            trackColor={{ false: '#d1d5db', true: '#a1d7d1' }}
                            thumbColor={profileData.currentlyAvailable ? '#2d9d91' : '#9ca3af'}
                            disabled={!editMode}
                        />
                    </StyledView>
                </Card>

                {/* Contact Information */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="call" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Contact Information
                        </StyledText>
                    </StyledView>

                    {editMode ? (
                        <>
                            <Input
                                label="Email"
                                value={profileData.email}
                                onChangeText={(value) => handleChange('email', value)}
                                keyboardType="email-address"
                                disabled={true} // Email should not be editable
                                className="bg-neutral-50"
                            />

                            <Input
                                label="Phone"
                                value={profileData.phone}
                                onChangeText={(value) => handleChange('phone', value)}
                                keyboardType="phone-pad"
                            />
                        </>
                    ) : (
                        <>
                            <StyledView className="flex-row items-center py-2">
                                <Ionicons name="mail-outline" size={18} color="#6b7280" className="mr-3" />
                                <StyledText className="text-neutral-800">
                                    {profileData.email}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row items-center py-2">
                                <Ionicons name="call-outline" size={18} color="#6b7280" className="mr-3" />
                                <StyledText className="text-neutral-800">
                                    {profileData.phone || 'No phone number provided'}
                                </StyledText>
                            </StyledView>
                        </>
                    )}
                </Card>

                {/* Biography */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Professional Biography
                        </StyledText>
                    </StyledView>

                    {editMode ? (
                        <Input
                            placeholder="Tell patients about your professional experience, qualifications, and approach to care..."
                            value={profileData.biography}
                            onChangeText={(value) => handleChange('biography', value)}
                            multiline
                            numberOfLines={6}
                        />
                    ) : (
                        <StyledText className="text-neutral-700">
                            {profileData.biography || 'No biography provided.'}
                        </StyledText>
                    )}
                </Card>

                {/* Actions */}
                {editMode ? (
                    <Button
                        title={saving ? "Saving..." : "Save Changes"}
                        variant="primary"
                        loading={saving}
                        disabled={saving}
                        onPress={handleSaveProfile}
                        className="mb-4"
                        fullWidth
                    />
                ) : (
                    <>
                        <Button
                            title="Manage Schedule"
                            variant="outline"
                            icon={<Ionicons name="time-outline" size={16} color="#1766da" />}
                            onPress={() => navigation.navigate('DoctorSchedule')}
                            className="mb-3"
                            fullWidth
                        />

                        <Button
                            title="Log Out"
                            variant="error"
                            icon={<Ionicons name="log-out-outline" size={16} color="white" />}
                            onPress={handleLogout}
                            className="mb-6"
                            fullWidth
                        />
                    </>
                )}
            </StyledScrollView>
        </StyledView>
    );
};

export default DoctorProfileScreen;