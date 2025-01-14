import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Doctor Screens
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentDetailScreen';
import DoctorAppointmentDetailScreen from '../screens/doctor/DoctorAppointmentDetailScreen';
import DoctorCreateAppointmentScreen from '../screens/doctor/DoctorCreateAppointmentScreen';
import DoctorPatientsScreen from '../screens/doctor/DoctorPatientsScreen';
import DoctorPatientDetailScreen from '../screens/doctor/DoctorPatientDetailScreen';
import DoctorDiagnosesScreen from '../screens/doctor/DoctorDiagnosesScreen';
import DoctorDiagnosisDetailScreen from '../screens/doctor/DoctorDiagnosisDetailScreen';
import DoctorReportsScreen from '../screens/doctor/DoctorReportsScreen';
import DoctorReportDetailScreen from '../screens/doctor/DoctorReportDetailScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import DoctorScheduleScreen from '../screens/doctor/DoctorScheduleScreen';
import DoctorNotificationsScreen from '../screens/doctor/DoctorNotificationsScreen';

const Tab = createBottomTabNavigator();
const DoctorHomeStack = createStackNavigator();
const DoctorAppointmentsStack = createStackNavigator();
const DoctorPatientsStack = createStackNavigator();
const DoctorProfileStack = createStackNavigator();

// Home Stack
const DoctorHomeStackNavigator = () => {
    return (
        <DoctorHomeStack.Navigator screenOptions={{ headerShown: false }}>
            <DoctorHomeStack.Screen
                name="DoctorHome"
                component={DoctorHomeScreen}
                options={{ headerShown: false }}
            />
            <DoctorHomeStack.Screen
                name="DoctorNotifications"
                component={DoctorNotificationsScreen}
                options={{
                    headerTitle: 'Notifications',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorHomeStack.Screen
                name="DoctorDiagnoses"
                component={DoctorDiagnosesScreen}
                options={{
                    headerTitle: 'Pending Diagnoses',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorHomeStack.Screen
                name="DoctorDiagnosisDetail"
                component={DoctorDiagnosisDetailScreen}
                options={{
                    headerTitle: 'Diagnosis Details',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorHomeStack.Screen
                name="DoctorReports"
                component={DoctorReportsScreen}
                options={{
                    headerTitle: 'Pending Reports',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorHomeStack.Screen
                name="DoctorReportDetail"
                component={DoctorReportDetailScreen}
                options={{
                    headerTitle: 'Report Details',
                    headerBackTitleVisible: false,
                }}
            />
        </DoctorHomeStack.Navigator>
    );
};

// Appointments Stack
const DoctorAppointmentsStackNavigator = () => {
    return (
        <DoctorAppointmentsStack.Navigator
            initialRouteName="DoctorCreateAppointment" // Set the default screen
            screenOptions={{ headerShown: false }}
        >
            <DoctorAppointmentsStack.Screen
                name="DoctorCreateAppointment"
                component={DoctorCreateAppointmentScreen}
                options={{
                    headerTitle: 'Schedule Appointment',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorAppointmentsStack.Screen
                name="DoctorAppointmentsList"
                component={DoctorAppointmentsScreen}
                options={{
                    headerTitle: 'Appointments',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorAppointmentsStack.Screen
                name="DoctorAppointmentDetail"
                component={DoctorAppointmentDetailScreen}
                options={{
                    headerTitle: 'Appointment Details',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorAppointmentsStack.Screen
                name="DoctorPatientDetail"
                component={DoctorPatientDetailScreen}
                options={{
                    headerTitle: 'Patient Details',
                    headerBackTitleVisible: false,
                }}
            />
        </DoctorAppointmentsStack.Navigator>
    );
};


// Patients Stack
const DoctorPatientsStackNavigator = () => {
    return (
        <DoctorPatientsStack.Navigator screenOptions={{ headerShown: false }}>
            <DoctorPatientsStack.Screen
                name="DoctorPatientsList"
                component={DoctorPatientsScreen}
                options={{
                    headerTitle: 'My Patients',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorPatientsStack.Screen
                name="DoctorPatientDetail"
                component={DoctorPatientDetailScreen}
                options={{
                    headerTitle: 'Patient Details',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorPatientsStack.Screen
                name="DoctorPatientAppointments"
                component={DoctorAppointmentsScreen}
                options={{
                    headerTitle: 'Patient Appointments',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorPatientsStack.Screen
                name="DoctorPatientReports"
                component={DoctorReportsScreen}
                options={{
                    headerTitle: 'Patient Reports',
                    headerBackTitleVisible: false,
                }}
            />
        </DoctorPatientsStack.Navigator>
    );
};

// Profile Stack
const DoctorProfileStackNavigator = () => {
    return (
        <DoctorProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <DoctorProfileStack.Screen
                name="DoctorProfileMain"
                component={DoctorProfileScreen}
                options={{
                    headerTitle: 'My Profile',
                    headerBackTitleVisible: false,
                }}
            />
            <DoctorProfileStack.Screen
                name="DoctorSchedule"
                component={DoctorScheduleScreen}
                options={{
                    headerTitle: 'My Schedule',
                    headerBackTitleVisible: false,
                }}
            />
        </DoctorProfileStack.Navigator>
    );
};

const DoctorNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'DoctorHomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'DoctorAppointmentsTab') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === "DoctorDiagnosesTab") {
                        iconName = focused ? 'medkit' : 'medkit-outline';
                    } else if (route.name === 'DoctorPatientsTab') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'DoctorProfileTab') {
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
            <Tab.Screen
                name="DoctorHomeTab"
                component={DoctorHomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="DoctorAppointmentsTab"
                component={DoctorAppointmentsStackNavigator}
                options={{ tabBarLabel: 'Appointments' }}
            />
            <Tab.Screen
                name="DoctorDiagnosesTab"
                component={DoctorDiagnosesScreen}
                options={{ tabBarLabel: 'Diagnoses' }}
            />
            <Tab.Screen
                name="DoctorPatientsTab"
                component={DoctorPatientsStackNavigator}
                options={{ tabBarLabel: 'Patients' }}
            />
            <Tab.Screen
                name="DoctorProfileTab"
                component={DoctorProfileStackNavigator}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default DoctorNavigator;