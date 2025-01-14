import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as doctorApi from '../../api/doctor';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const DoctorPatientsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            const response = await doctorApi.getDoctorPatients();

            const patientsData = response.data || [];
            setPatients(patientsData);
            setFilteredPatients(patientsData);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPatients(patients);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = patients.filter(patient => {
                const fullName = `${patient.name.first} ${patient.name.last}`.toLowerCase();
                return fullName.includes(query);
            });
            setFilteredPatients(filtered);
        }
    }, [searchQuery, patients]);

    const onRefresh = () => {
        setRefreshing(true);
        loadPatients();
    };

    const renderPatientItem = ({ item }) => {
        const patient = item;

        return (
            <Card
                className="mb-3 mx-4"
                onPress={() => navigation.navigate('DoctorPatientDetail', { patientId: patient._id })}
            >
                <StyledView className="flex-row items-center">
                    <StyledView className="bg-primary-100 rounded-full p-3 mr-3">
                        <Ionicons name="person" size={24} color="#1766da" />
                    </StyledView>

                    <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {patient.name.first} {patient.name.last}
                        </StyledText>

                        <StyledView className="flex-row flex-wrap mt-1">
                            {patient.gender && (
                                <StyledView className="flex-row items-center mr-4">
                                    <Ionicons name={patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'person'} size={16} color="#6b7280" />
                                    <StyledText className="text-neutral-500 ml-1">
                                        {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                                    </StyledText>
                                </StyledView>
                            )}

                            {patient.dateOfBirth && (
                                <StyledView className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                    <StyledText className="text-neutral-500 ml-1">
                                        {calculateAge(patient.dateOfBirth)} years
                                    </StyledText>
                                </StyledView>
                            )}
                        </StyledView>
                    </StyledView>

                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </StyledView>
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
                        My Patients
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Search Bar */}
            <StyledView className="bg-white px-4 py-2 border-b border-neutral-200">
                <StyledView className="flex-row items-center bg-neutral-100 rounded-lg px-3 py-2">
                    <Ionicons name="search" size={20} color="#6b7280" />
                    <StyledTextInput
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-2 text-neutral-800"
                        placeholderTextColor="#9ca3af"
                    />
                    {searchQuery !== '' && (
                        <StyledTouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#6b7280" />
                        </StyledTouchableOpacity>
                    )}
                </StyledView>
            </StyledView>

            {/* Patients List */}
            {loading && !refreshing ? (
                <LoadingSpinner text="Loading patients..." />
            ) : (
                <FlatList
                    data={filteredPatients}
                    renderItem={renderPatientItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        searchQuery ? (
                            <EmptyState
                                title="No Matching Patients"
                                message="No patients match your search criteria."
                                icon={<Ionicons name="search-outline" size={60} color="#9ca3af" />}
                            />
                        ) : (
                            <EmptyState
                                title="No Patients"
                                message="You don't have any patients assigned to you yet."
                                icon={<Ionicons name="people-outline" size={60} color="#9ca3af" />}
                            />
                        )
                    }
                />
            )}
        </StyledView>
    );
};

// Helper function
const calculateAge = (birthDate) => {
    if (!birthDate) return '';

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

export default DoctorPatientsScreen;