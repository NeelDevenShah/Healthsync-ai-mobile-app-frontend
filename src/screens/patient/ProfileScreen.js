import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../context/AuthContext';
import * as patientApi from '../../api/patient';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, updateUserProfile, refreshUserProfile, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: { first: '', last: '' },
        phone: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        allergies: [],
        medicalHistory: [],
        healthMetrics: {
            height: '',
            weight: '',
            bloodType: ''
        }
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await patientApi.getPatientProfile();
                setProfileData(response.data);
            } catch (error) {
                console.error('Error loading profile:', error);
                Alert.alert('Error', 'Failed to load profile information');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setProfileData(prevData => ({
                ...prevData,
                [parent]: {
                    ...prevData[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileData(prevData => ({
                ...prevData,
                [field]: value
            }));
        }
    };

    const handleAddAllergy = () => {
        Alert.prompt(
            'Add Allergy',
            'Please enter the allergy:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Add',
                    onPress: (allergy) => {
                        if (allergy && allergy.trim()) {
                            setProfileData(prevData => ({
                                ...prevData,
                                allergies: [...prevData.allergies, allergy.trim()]
                            }));
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveAllergy = (index) => {
        setProfileData(prevData => ({
            ...prevData,
            allergies: prevData.allergies.filter((_, i) => i !== index)
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            // Send update to API
            await updateUserProfile(profileData);

            // Refresh user data
            await refreshUserProfile();

            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangeProfilePicture = async () => {
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
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                // In a real implementation, you would upload the image to the server
                // and then update the profile with the image URL
                Alert.alert('Coming Soon', 'Profile picture update will be implemented in a future version.');
            }
        } catch (error) {
            console.error('Error changing profile picture:', error);
            Alert.alert('Error', 'Failed to change profile picture');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading profile..." />;
    }

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <StyledView className="bg-primary-500 pt-14 pb-8 px-4">
                <StyledView className="flex-row justify-between items-center mb-4">
                    <StyledText className="text-xl font-bold text-white">My Profile</StyledText>

                    <StyledView className="flex-row">
                        {isEditing ? (
                            <>
                                <StyledTouchableOpacity
                                    className="mr-4 bg-white/20 p-2 rounded-full"
                                    onPress={() => setIsEditing(false)}
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </StyledTouchableOpacity>

                                <StyledTouchableOpacity
                                    className="bg-white/20 p-2 rounded-full"
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <LoadingSpinner size="small" color="white" />
                                    ) : (
                                        <Ionicons name="checkmark" size={24} color="white" />
                                    )}
                                </StyledTouchableOpacity>
                            </>
                        ) : (
                            <StyledTouchableOpacity
                                className="bg-white/20 p-2 rounded-full"
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="create" size={24} color="white" />
                            </StyledTouchableOpacity>
                        )}
                    </StyledView>
                </StyledView>

                <StyledView className="flex-row items-center">
                    <StyledTouchableOpacity
                        className="relative"
                        onPress={handleChangeProfilePicture}
                    >
                        {profileData.profilePicture ? (
                            <StyledImage
                                source={{ uri: profileData.profilePicture }}
                                className="w-20 h-20 rounded-full"
                            />
                        ) : (
                            <StyledView className="w-20 h-20 rounded-full bg-primary-300 items-center justify-center">
                                <Ionicons name="person" size={32} color="white" />
                            </StyledView>
                        )}

                        <StyledView className="absolute right-0 bottom-0 bg-white rounded-full p-1">
                            <Ionicons name="camera" size={16} color="#1766da" />
                        </StyledView>
                    </StyledTouchableOpacity>

                    <StyledView className="ml-4">
                        <StyledText className="text-2xl font-bold text-white">
                            {profileData.name.first} {profileData.name.last}
                        </StyledText>
                        <StyledText className="text-white/80">
                            {profileData.email}
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>

            <StyledScrollView className="flex-1 p-4">
                {/* Personal Information */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="person" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Personal Information
                        </StyledText>
                    </StyledView>

                    {isEditing ? (
                        <>
                            <StyledView className="flex-row space-x-2 mb-4">
                                <Input
                                    label="First Name"
                                    value={profileData.name.first}
                                    onChangeText={(value) => handleChange('name.first', value)}
                                    className="flex-1"
                                />

                                <Input
                                    label="Last Name"
                                    value={profileData.name.last}
                                    onChangeText={(value) => handleChange('name.last', value)}
                                    className="flex-1"
                                />
                            </StyledView>

                            <Input
                                label="Phone"
                                value={profileData.phone}
                                onChangeText={(value) => handleChange('phone', value)}
                                keyboardType="phone-pad"
                                className="mb-4"
                            />

                            <Input
                                label="Email"
                                value={profileData.email}
                                onChangeText={(value) => handleChange('email', value)}
                                keyboardType="email-address"
                                disabled={true} // Email cannot be changed
                                className="mb-4"
                            />

                            <Input
                                label="Gender"
                                value={profileData.gender}
                                onChangeText={(value) => handleChange('gender', value)}
                                className="mb-4"
                            />

                            <Input
                                label="Date of Birth"
                                value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : ''}
                                onChangeText={(value) => handleChange('dateOfBirth', value)}
                                placeholder="MM/DD/YYYY"
                                className="mb-2"
                            />
                        </>
                    ) : (
                        <>
                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Name:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.name.first} {profileData.name.last}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Phone:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.phone || 'Not provided'}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Email:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.email}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Gender:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : 'Not provided'}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Date of Birth:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                </StyledText>
                            </StyledView>
                        </>
                    )}
                </Card>

                {/* Address Information */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="location" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Address
                        </StyledText>
                    </StyledView>

                    {isEditing ? (
                        <>
                            <Input
                                label="Street"
                                value={profileData.address?.street || ''}
                                onChangeText={(value) => handleChange('address.street', value)}
                                className="mb-4"
                            />

                            <StyledView className="flex-row space-x-2 mb-4">
                                <Input
                                    label="City"
                                    value={profileData.address?.city || ''}
                                    onChangeText={(value) => handleChange('address.city', value)}
                                    className="flex-1"
                                />

                                <Input
                                    label="State"
                                    value={profileData.address?.state || ''}
                                    onChangeText={(value) => handleChange('address.state', value)}
                                    className="flex-1"
                                />
                            </StyledView>

                            <StyledView className="flex-row space-x-2 mb-2">
                                <Input
                                    label="Zip Code"
                                    value={profileData.address?.zip || ''}
                                    onChangeText={(value) => handleChange('address.zip', value)}
                                    keyboardType="numeric"
                                    className="flex-1"
                                />

                                <Input
                                    label="Country"
                                    value={profileData.address?.country || ''}
                                    onChangeText={(value) => handleChange('address.country', value)}
                                    className="flex-1"
                                />
                            </StyledView>
                        </>
                    ) : (
                        <>
                            {profileData.address && Object.values(profileData.address).some(val => val) ? (
                                <>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {profileData.address.street}
                                    </StyledText>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {profileData.address.city}{profileData.address.city && profileData.address.state ? ', ' : ''}{profileData.address.state} {profileData.address.zip}
                                    </StyledText>
                                    <StyledText className="text-neutral-800 font-medium">
                                        {profileData.address.country}
                                    </StyledText>
                                </>
                            ) : (
                                <StyledText className="text-neutral-500 italic">
                                    No address information provided
                                </StyledText>
                            )}
                        </>
                    )}
                </Card>

                {/* Health Information */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="fitness" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Health Information
                        </StyledText>
                    </StyledView>

                    {isEditing ? (
                        <>
                            <StyledView className="flex-row space-x-2 mb-4">
                                <Input
                                    label="Height (cm)"
                                    value={profileData.healthMetrics?.height?.toString() || ''}
                                    onChangeText={(value) => handleChange('healthMetrics.height', value)}
                                    keyboardType="numeric"
                                    className="flex-1"
                                />

                                <Input
                                    label="Weight (kg)"
                                    value={profileData.healthMetrics?.weight?.toString() || ''}
                                    onChangeText={(value) => handleChange('healthMetrics.weight', value)}
                                    keyboardType="numeric"
                                    className="flex-1"
                                />
                            </StyledView>

                            <Input
                                label="Blood Type"
                                value={profileData.healthMetrics?.bloodType || ''}
                                onChangeText={(value) => handleChange('healthMetrics.bloodType', value)}
                                className="mb-4"
                            />

                            <StyledText className="font-medium text-neutral-800 mb-2">Allergies:</StyledText>
                            <StyledView className="flex-row flex-wrap mb-2">
                                {profileData.allergies && profileData.allergies.map((allergy, index) => (
                                    <StyledView
                                        key={`allergy-${index}`}
                                        className="bg-red-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                                    >
                                        <StyledText className="text-red-800 mr-1">{allergy}</StyledText>
                                        <StyledTouchableOpacity onPress={() => handleRemoveAllergy(index)}>
                                            <Ionicons name="close-circle" size={16} color="#b91c1c" />
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                ))}
                                <StyledTouchableOpacity
                                    className="bg-neutral-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                                    onPress={handleAddAllergy}
                                >
                                    <Ionicons name="add" size={16} color="#6b7280" />
                                    <StyledText className="text-neutral-700 ml-1">Add</StyledText>
                                </StyledTouchableOpacity>
                            </StyledView>
                        </>
                    ) : (
                        <>
                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Height:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.healthMetrics?.height ? `${profileData.healthMetrics.height} cm` : 'Not provided'}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-2">
                                <StyledText className="text-neutral-600">Weight:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.healthMetrics?.weight ? `${profileData.healthMetrics.weight} kg` : 'Not provided'}
                                </StyledText>
                            </StyledView>

                            <StyledView className="flex-row justify-between mb-3">
                                <StyledText className="text-neutral-600">Blood Type:</StyledText>
                                <StyledText className="text-neutral-800 font-medium">
                                    {profileData.healthMetrics?.bloodType || 'Not provided'}
                                </StyledText>
                            </StyledView>

                            <StyledView className="mb-2">
                                <StyledText className="text-neutral-600 mb-1">Allergies:</StyledText>
                                {profileData.allergies && profileData.allergies.length > 0 ? (
                                    <StyledView className="flex-row flex-wrap">
                                        {profileData.allergies.map((allergy, index) => (
                                            <StyledView
                                                key={`allergy-${index}`}
                                                className="bg-red-100 rounded-full px-3 py-1 mr-2 mb-2"
                                            >
                                                <StyledText className="text-red-800">{allergy}</StyledText>
                                            </StyledView>
                                        ))}
                                    </StyledView>
                                ) : (
                                    <StyledText className="text-neutral-500 italic">
                                        No allergies reported
                                    </StyledText>
                                )}
                            </StyledView>
                        </>
                    )}
                </Card>

                {/* Quick Links */}
                <Card className="mb-4">
                    <StyledView className="flex-row items-center mb-3">
                        <Ionicons name="link" size={20} color="#1766da" />
                        <StyledText className="text-lg font-bold text-neutral-800 ml-2">
                            Quick Links
                        </StyledText>
                    </StyledView>

                    <StyledTouchableOpacity
                        className="flex-row items-center py-3 border-b border-neutral-100"
                        onPress={() => navigation.navigate('ReportsList')}
                    >
                        <Ionicons name="document-text" size={20} color="#6b7280" className="mr-3" />
                        <StyledText className="flex-1 text-neutral-800">Medical Reports</StyledText>
                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity
                        className="flex-row items-center py-3 border-b border-neutral-100"
                        onPress={() => navigation.navigate('HealthDashboard')}
                    >
                        <Ionicons name="analytics" size={20} color="#6b7280" className="mr-3" />
                        <StyledText className="flex-1 text-neutral-800">Health Dashboard</StyledText>
                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity
                        className="flex-row items-center py-3"
                        onPress={() => {
                            // Privacy settings not implemented yet
                            Alert.alert('Coming Soon', 'Privacy settings will be implemented in a future version.');
                        }}
                    >
                        <Ionicons name="shield" size={20} color="#6b7280" className="mr-3" />
                        <StyledText className="flex-1 text-neutral-800">Privacy Settings</StyledText>
                        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </StyledTouchableOpacity>
                </Card>

                {/* Logout Button */}
                <Button
                    title="Log Out"
                    variant="outline"
                    icon={<Ionicons name="log-out" size={18} color="#ef4444" />}
                    onPress={handleLogout}
                    className="mb-8 border-red-300"
                    textClassName="text-red-500"
                    fullWidth
                />
            </StyledScrollView>
        </StyledView>
    );
};

export default ProfileScreen;