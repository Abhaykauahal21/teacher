import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import BatchListScreen from '../screens/dashboard/BatchListScreen';
import BatchDetailsScreen from '../screens/dashboard/BatchDetailsScreen';
import AddBatchScreen from '../screens/dashboard/AddBatchScreen';
import AddStudentScreen from '../screens/students/AddStudentScreen';
import FeeListScreen from '../screens/fees/FeeListScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import HomeScreen from '../screens/dashboard/HomeScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentHistoryScreen from '../screens/students/StudentHistoryScreen';
import StudentProfileScreen from '../screens/students/StudentProfileScreen';
import SelectBatchScreen from '../screens/attendance/SelectBatchScreen';
import MarkAttendanceScreen from '../screens/attendance/MarkAttendanceScreen';
import BatchStudentsScreen from '../screens/students/BatchStudentsScreen';
import CommingSoon from '../components/CommingSoon';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BatchesStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SelectBatch" component={SelectBatchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BatchDetails" component={BatchDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{ title: 'Add Student' }} />
            <Stack.Screen name="EditStudent" component={EditStudentScreen} options={{ title: 'Edit Student' }} />
            <Stack.Screen name="StudentHistory" component={StudentHistoryScreen} options={{ title: 'Student History' }} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BatchStudents" component={BatchStudentsScreen} options={{ title: 'Students List' }} />
            <Stack.Screen name="AddBatch" component={AddBatchScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

const FeesStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="FeeList" component={FeeListScreen} options={{ title: 'Fees Management' }} />
        </Stack.Navigator>
    );
};

const TabNavigator = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Batches') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Fees') {
                        iconName = focused ? 'cash' : 'cash-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Batches" component={BatchesStack} />
            <Tab.Screen name="Fees" component={FeesStack} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="CommingSoon" component={CommingSoon} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
    );
};

export default AppStack;
