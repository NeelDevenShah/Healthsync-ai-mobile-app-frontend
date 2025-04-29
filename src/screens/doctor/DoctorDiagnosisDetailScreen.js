import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import * as diagnosisApi from '../../api/diagnosis';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DoctorDiagnosisDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { diagnosisId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [modifiedTests, setModifiedTests] = useState([]);
  const [additionalTests, setAdditionalTests] = useState([]);
  const [newTestName, setNewTestName] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  useEffect(() => {
    const loadDiagnosis = async () => {
      try {
        setLoading(true);
        const response = await diagnosisApi.getDiagnosis(diagnosisId);
        const diagnosisData = response.data;
        setDiagnosis(diagnosisData);
        
        // Initialize modified tests with existing tests
        if (diagnosisData.suggestedTests) {
          setModifiedTests(diagnosisData.suggestedTests.map(test => ({
            testId: test._id,
            name: test.name,
            reason: test.reason,
            priority: test.priority,
            isApproved: test.isApproved
          })));
        }
      } catch (error) {
        console.error('Error loading diagnosis:', error);
        Alert.alert('Error', 'Failed to load diagnosis details. Please try again.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    loadDiagnosis();
  }, [diagnosisId, navigation]);
  
  const handleTestToggle = (testId) => {
    setModifiedTests(prevTests => prevTests.map(test => {
      if (test.testId === testId) {
        return { ...test, isApproved: !test.isApproved };
      }
      return test;
    }));
  };
  
  const handleTestPriorityChange = (testId, priority) => {
    setModifiedTests(prevTests => prevTests.map(test => {
      if (test.testId === testId) {
        return { ...test, priority };
      }
      return test;
    }));
  };
  
  const handleAddTest = () => {
    if (!newTestName.trim()) {
      Alert.alert('Error', 'Please enter a test name');
      return;
    }
    
    setAdditionalTests(prevTests => [
      ...prevTests,
      {
        name: newTestName,
        reason: 'Added by doctor',
        priority: 'medium',
        isApproved: true
      }
    ]);
    setNewTestName('');
  };
  
  const handleRemoveAdditionalTest = (index) => {
    setAdditionalTests(prevTests => prevTests.filter((_, i) => i !== index));
  };
  
  const handleApproveDiagnosis = async () => {
    try {
      setApproving(true);
      
      // Prepare modifications
      const modifications = {
        tests: modifiedTests,
        additionalTests,
        doctorNotes
      };
      
      // Call API to approve diagnosis
      const response = await diagnosisApi.approveDiagnosis(diagnosisId, modifications);
      
      Alert.alert(
        'Diagnosis Approved',
        'The diagnosis has been reviewed and approved. Would you like to schedule an appointment for this patient?',
        [
          {
            text: 'Schedule Appointment',
            onPress: () => {
              navigation.navigate('DoctorCreateAppointment', {
                patientId: diagnosis.patientId._id,
                diagnosisId: diagnosis._id
              });
            },
          },
          {
            text: 'Later',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error approving diagnosis:', error);
      Alert.alert('Error', 'Failed to approve diagnosis. Please try again.');
    } finally {
      setApproving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading diagnosis details..." />;
  }
  
  if (!diagnosis) {
    return (
      <StyledView className="flex-1 justify-center items-center p-4">
        <Ionicons name="alert-circle-outline" size={60} color="#9ca3af" />
        <StyledText className="text-lg text-neutral-600 mt-4 text-center">
          Diagnosis information not available.
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
          <StyledText className="text-lg font-bold text-neutral-800">
            Diagnosis Review
          </StyledText>
          <StyledText className="text-sm text-neutral-500">
            {diagnosis.patientId?.name?.first} {diagnosis.patientId?.name?.last}
          </StyledText>
        </StyledView>
        
        <Badge
          text={formatStatus(diagnosis.status)}
          variant={getStatusVariant(diagnosis.status)}
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
          
          <StyledView className="flex-row mb-2">
            <StyledText className="text-neutral-600 w-24">Name:</StyledText>
            <StyledText className="text-neutral-800 font-medium">
              {diagnosis.patientId?.name?.first} {diagnosis.patientId?.name?.last}
            </StyledText>
          </StyledView>
          
          {diagnosis.patientId?.gender && (
            <StyledView className="flex-row mb-2">
              <StyledText className="text-neutral-600 w-24">Gender:</StyledText>
              <StyledText className="text-neutral-800 font-medium">
                {capitalizeFirstLetter(diagnosis.patientId.gender)}
              </StyledText>
            </StyledView>
          )}
          
          {diagnosis.patientId?.dateOfBirth && (
            <StyledView className="flex-row mb-2">
              <StyledText className="text-neutral-600 w-24">Age:</StyledText>
              <StyledText className="text-neutral-800 font-medium">
                {calculateAge(diagnosis.patientId.dateOfBirth)} years
              </StyledText>
            </StyledView>
          )}
          
          <Button
            title="View Patient Details"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('DoctorPatientDetail', { patientId: diagnosis.patientId._id })}
            className="mt-2 self-end"
          />
        </Card>
        
        {/* AI Diagnosis Summary */}
        <Card className="mb-4">
          <StyledView className="flex-row items-center mb-2">
            <Ionicons name="medkit" size={20} color="#1766da" />
            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
              AI Diagnosis Summary
            </StyledText>
          </StyledView>
          
          <StyledText className="text-neutral-700">
            {diagnosis.aiSummary || 'No summary available'}
          </StyledText>
          
          <Button
            title="View Chat History"
            variant="outline"
            size="small"
            icon={<Ionicons name="chatbubbles-outline" size={16} color="#1766da" />}
            onPress={() => {
              // In a real implementation, we'd navigate to a view of the chat history
              Alert.alert('Feature', 'Chat history view would be implemented here');
            }}
            className="mt-4 self-end"
          />
        </Card>
        
        {/* Suggested Tests */}
        <Card className="mb-4">
          <StyledView className="flex-row items-center mb-2">
            <Ionicons name="clipboard" size={20} color="#1766da" />
            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
              Recommended Tests
            </StyledText>
          </StyledView>
          
          <StyledText className="text-neutral-700 mb-4">
            Please review and approve the recommended tests:
          </StyledText>
          
          {/* Original Tests */}
          {modifiedTests.length > 0 ? (
            modifiedTests.map((test) => (
              <StyledView 
                key={test.testId}
                className="py-2 px-2 mb-2 border-b border-neutral-100 last:border-b-0"
              >
                <StyledView className="flex-row justify-between items-center">
                  <StyledView className="flex-row items-center">
                    <StyledTouchableOpacity
                      onPress={() => handleTestToggle(test.testId)}
                      className={`w-6 h-6 rounded-md items-center justify-center mr-2
                        ${test.isApproved ? 'bg-green-500' : 'border border-neutral-300'}
                      `}
                    >
                      {test.isApproved && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </StyledTouchableOpacity>
                    
                    <StyledText className="font-bold text-neutral-800">
                      {test.name}
                    </StyledText>
                  </StyledView>
                  
                  <StyledView className="flex-row">
                    <StyledTouchableOpacity
                      className={`px-2 py-1 rounded-l-md border border-r-0 border-neutral-300
                        ${test.priority === 'low' ? 'bg-neutral-100' : 'bg-white'}
                      `}
                      onPress={() => handleTestPriorityChange(test.testId, 'low')}
                    >
                      <StyledText className={test.priority === 'low' ? 'font-bold text-neutral-800' : 'text-neutral-600'}>
                        Low
                      </StyledText>
                    </StyledTouchableOpacity>
                    
                    <StyledTouchableOpacity
                      className={`px-2 py-1 border border-neutral-300
                        ${test.priority === 'medium' ? 'bg-neutral-100' : 'bg-white'}
                      `}
                      onPress={() => handleTestPriorityChange(test.testId, 'medium')}
                    >
                      <StyledText className={test.priority === 'medium' ? 'font-bold text-neutral-800' : 'text-neutral-600'}>
                        Med
                      </StyledText>
                    </StyledTouchableOpacity>
                    
                    <StyledTouchableOpacity
                      className={`px-2 py-1 rounded-r-md border border-l-0 border-neutral-300
                        ${test.priority === 'high' ? 'bg-neutral-100' : 'bg-white'}
                      `}
                      onPress={() => handleTestPriorityChange(test.testId, 'high')}
                    >
                      <StyledText className={test.priority === 'high' ? 'font-bold text-neutral-800' : 'text-neutral-600'}>
                        High
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
                
                {test.reason && (
                  <StyledText className="text-neutral-600 text-sm mt-1 ml-8">
                    {test.reason}
                  </StyledText>
                )}
              </StyledView>
            ))
          ) : (
            <StyledText className="text-neutral-500 italic">
              No tests have been suggested.
            </StyledText>
          )}
          
          {/* Additional Tests */}
          {additionalTests.length > 0 && (
            <>
              <StyledText className="text-lg font-bold text-neutral-800 mt-4 mb-2">
                Additional Tests
              </StyledText>
              
              {additionalTests.map((test, index) => (
                <StyledView 
                  key={`additional-${index}`}
                  className="py-2 px-2 mb-2 border-b border-neutral-100 last:border-b-0"
                >
                  <StyledView className="flex-row justify-between items-center">
                    <StyledView className="flex-row items-center">
                      <StyledView className="w-6 h-6 rounded-md bg-green-500 items-center justify-center mr-2">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </StyledView>
                      
                      <StyledText className="font-bold text-neutral-800">
                        {test.name}
                      </StyledText>
                    </StyledView>
                    
                    <StyledTouchableOpacity
                      onPress={() => handleRemoveAdditionalTest(index)}
                      className="p-1"
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
              ))}
            </>
          )}
          
          {/* Add New Test */}
          <StyledView className="mt-4 flex-row items-center">
            <Input
              placeholder="Add another test..."
              value={newTestName}
              onChangeText={setNewTestName}
              className="flex-1 mb-0 mr-2"
            />
            
            <Button
              title="Add"
              variant="outline"
              size="small"
              onPress={handleAddTest}
              disabled={!newTestName.trim()}
            />
          </StyledView>
        </Card>
        
        {/* Doctor Notes */}
        <Card className="mb-6">
          <StyledView className="flex-row items-center mb-2">
            <Ionicons name="create" size={20} color="#1766da" />
            <StyledText className="text-lg font-bold text-neutral-800 ml-2">
              Additional Notes
            </StyledText>
          </StyledView>
          
          <Input
            placeholder="Add your notes for the patient..."
            value={doctorNotes}
            onChangeText={setDoctorNotes}
            multiline
            numberOfLines={4}
          />
        </Card>
        
        {/* Actions */}
        <StyledView className="flex-row justify-between mb-6">
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            className="flex-1 mr-2"
          />
          
          <Button
            title={approving ? "Approving..." : "Approve & Continue"}
            variant="primary"
            loading={approving}
            disabled={approving}
            onPress={handleApproveDiagnosis}
            className="flex-1 ml-2"
          />
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
};

// Helper functions
const formatStatus = (status) => {
  switch (status) {
    case 'ongoing':
      return 'Ongoing';
    case 'pending_doctor_review':
      return 'Pending Review';
    case 'pending_reports':
      return 'Needs Reports';
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

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const calculateAge = (birthDate) => {
  if (!birthDate) return 'Unknown';
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export default DoctorDiagnosisDetailScreen;