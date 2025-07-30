import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { AllSubjectsScreen } from '../screens/AllSubjectsScreen';
import { SubjectResultsScreen } from '../screens/SubjectResultsScreen';
import { TeacherProfileScreen } from '../screens/TeacherProfileScreen';
import { BookingScreen } from '../screens/BookingScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AllSubjects: undefined;
  SubjectResults: { subjectKey: string };
  TeacherProfile: {
    teacherId: string;
    teacherName: string;
    subject: string;
    imageUrl?: string;
    rating?: number;
    reviews?: number;
    experience?: number;
    hourlyRate?: number;
  };
  Booking: {
    teacherId: string;
    teacherName: string;
    subject: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  console.log('🧭 AppNavigator: Setting up auth flow');
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AllSubjects" 
          component={AllSubjectsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SubjectResults" 
          component={SubjectResultsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TeacherProfile" 
          component={TeacherProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};