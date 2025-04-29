import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Patient Screens
import HomeScreen from '../screens/patient/HomeScreen';
import DiagnosisScreen from '../screens/patient/DiagnosisScreen';
import DiagnosisChatScreen from '../screens/patient/DiagnosisChatScreen';
import DiagnosisDetailScreen from '../screens/patient/DiagnosisDetailScreen';
import AppointmentsScreen from '../screens/patient/AppointmentsScreen';
import AppointmentDetailScreen from '../screens/patient/AppointmentDetailScreen';
import MedicationsScreen from '../screens/patient/MedicationsScreen';
import MedicationDetailScreen from '../screens/patient/MedicationDetailScreen';
import ReportsScreen from '../screens/patient/ReportsScreen';
import ReportDetailScreen from '../screens/patient/ReportDetailScreen';
import HealthDashboardScreen from '../screens/patient/HealthDashboardScreen';
import HealthMetricsScreen from '../screens/patient/HealthMetricsScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import NotificationsScreen from '../screens/patient/NotificationsScreen';
import UploadPrescriptionScreen from '../screens/patient/UploadPrescriptionScreen';
import UploadReportScreen from '../screens/patient/UploadReportScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const DiagnosisStack = createStackNavigator();
const AppointmentStack = createStackNavigator();
const MedicationStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home Stack
const HomeStackNavigator = () => {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen
                name="PatientHome"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    headerTitle: 'Notifications',
                    headerBackTitleVisible: false,
                }}
            />
            <HomeStack.Screen
                name="HealthDashboard"
                component={HealthDashboardScreen}
                options={{
                    headerTitle: 'Health Dashboard',
                    headerBackTitleVisible: false,
                }}
            />
            <HomeStack.Screen
                name="HealthMetrics"
                component={HealthMetricsScreen}
                options={{
                    headerTitle: 'Health Metrics',
                    headerBackTitleVisible: false,
                }}
            />
        </HomeStack.Navigator>
    );
};

// Diagnosis Stack
const DiagnosisStackNavigator = () => {
    return (
        <DiagnosisStack.Navigator
            // remove header
            screenOptions={{ headerShown: false }}
        >
            <DiagnosisStack.Screen
                name="DiagnosisList"
                component={DiagnosisScreen}
                options={{
                    headerTitle: 'Diagnoses',
                    headerBackTitleVisible: false,
                }}
            />
            <DiagnosisStack.Screen
                name="DiagnosisChat"
                component={DiagnosisChatScreen}
                options={{
                    headerTitle: 'AI Diagnosis Assistant',
                    headerBackTitleVisible: false,
                }}
            />
            <DiagnosisStack.Screen
                name="DiagnosisDetail"
                component={DiagnosisDetailScreen}
                options={{
                    headerTitle: 'Diagnosis Details',
                    headerBackTitleVisible: false,
                }}
            />
        </DiagnosisStack.Navigator>
    );
};

// Appointment Stack
const AppointmentStackNavigator = () => {
    return (
        <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
            <AppointmentStack.Screen
                name="AppointmentList"
                component={AppointmentsScreen}
                options={{
                    headerTitle: 'Appointments',
                    headerBackTitleVisible: false,
                }}
            />
            <AppointmentStack.Screen
                name="AppointmentDetail"
                component={AppointmentDetailScreen}
                options={{
                    headerTitle: 'Appointment Details',
                    headerBackTitleVisible: false,
                }}
            />
            <AppointmentStack.Screen
                name="UploadReport"
                component={UploadReportScreen}
                options={{
                    headerTitle: 'Upload Medical Report',
                    headerBackTitleVisible: false,
                }}
            />
            <AppointmentStack.Screen
                name="ReportDetail"
                component={ReportDetailScreen}
                options={{
                    headerTitle: 'Report Details',
                    headerBackTitleVisible: false,
                }}
            />
        </AppointmentStack.Navigator>
    );
};

// Medication Stack
const MedicationStackNavigator = () => {
    return (
        <MedicationStack.Navigator screenOptions={{ headerShown: false }}>
            <MedicationStack.Screen
                name="MedicationList"
                component={MedicationsScreen}
                options={{
                    headerTitle: 'Medications',
                    headerBackTitleVisible: false,
                }}
            />
            <MedicationStack.Screen
                name="MedicationDetail"
                component={MedicationDetailScreen}
                options={{
                    headerTitle: 'Medication Details',
                    headerBackTitleVisible: false,
                }}
            />
            <MedicationStack.Screen
                name="UploadPrescription"
                component={UploadPrescriptionScreen}
                options={{
                    headerTitle: 'Upload Prescription',
                    headerBackTitleVisible: false,
                }}
            />
        </MedicationStack.Navigator>
    );
};

// Profile Stack
const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{
                    headerTitle: 'My Profile',
                    headerBackTitleVisible: false,
                }}
            />
            <ProfileStack.Screen
                name="ReportsList"
                component={ReportsScreen}
                options={{
                    headerTitle: 'Medical Reports',
                    headerBackTitleVisible: false,
                }}
            />
        </ProfileStack.Navigator>
    );
};

const PatientNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Diagnosis') {
                        iconName = focused ? 'medkit' : 'medkit-outline';
                    } else if (route.name === 'Appointments') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Medications') {
                        iconName = focused ? 'bandage' : 'bandage-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                headerShown: false,
                tabBarActiveTintColor: '#1766da',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    paddingTop: 5,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginBottom: 5,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Diagnosis" component={DiagnosisStackNavigator} />
            <Tab.Screen name="Appointments" component={AppointmentStackNavigator} />
            <Tab.Screen name="Medications" component={MedicationStackNavigator} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        </Tab.Navigator>
    );
};

export default PatientNavigator;