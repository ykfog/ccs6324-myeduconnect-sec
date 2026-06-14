import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

// -----------------------------------------------------------------------
// MyEduConnect Companion App
//
// CCS6324 Final Assignment - Phase 1 Additional Component
// (Companion Mobile App, React Native / Expo)
//
// Every screen renders a top-left ModeToggle (VULNERABLE MODE / SAFE MODE).
// This is sent as an `X-Mode` header on every API call to the backend
// (backend/server.js), which implements BOTH a deliberately vulnerable
// and a hardened version of each endpoint -- useful for live Phase 4/5/7
// before/after demos without rebuilding the app.
//
// Vulnerabilities demonstrable from this app (vulnerable mode):
//   - SQL injection login bypass        (LoginScreen)
//   - MD5 password hashing               (RegisterScreen)
//   - Predictable session tokens         (returned on login)
//   - IDOR on profile endpoint            (ProfileScreen)
//   - Stored XSS via course comments      (CourseDetailScreen)
// -----------------------------------------------------------------------
export default function App() {
    return (
        <AppProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Courses" component={CoursesScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Course Details', headerBackTitle: 'Back' }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', headerBackTitle: 'Back' }} />
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
        </AppProvider>
    );
}