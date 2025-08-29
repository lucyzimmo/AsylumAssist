import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Colors } from '../constants/Colors';
import { AuthStackParamList } from '../types/navigation';
import { AuthHeader } from '../components/navigation/AuthHeader';

// Import screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { OnboardingStartScreen } from '../screens/onboarding/OnboardingStartScreen';
import { AsylumStatusScreen } from '../screens/onboarding/AsylumStatusScreen';
import { ImmigrationStatusScreen } from '../screens/onboarding/ImmigrationStatusScreen';
import PersonalInformationScreen from '../screens/onboarding/PersonalInformationScreen';
import ContactInformationScreen from '../screens/onboarding/ContactInformationScreen';
import BackgroundInformationScreen from '../screens/onboarding/BackgroundInformationScreen';
import ReviewScreen from '../screens/onboarding/ReviewScreen';

// Placeholder screens for now
import { PlaceholderScreen } from '../components/common/PlaceholderScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const defaultScreenOptions: StackNavigationOptions = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

const modalScreenOptions: StackNavigationOptions = {
  presentation: 'modal',
  gestureDirection: 'vertical',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultScreenOptions,
        headerShown: false, // We'll use custom headers where needed
      }}
      initialRouteName="Welcome"
    >
      {/* Welcome Flow */}
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      {/* Authentication Screens */}
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{
          ...modalScreenOptions,
          headerShown: true,
          header: (props) => (
            <AuthHeader
              {...props}
              title="Sign up"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />

      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          ...modalScreenOptions,
          headerShown: true,
          header: (props) => (
            <AuthHeader
              {...props}
              title="Log in"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />

      <Stack.Screen 
        name="ForgotPassword" 
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <AuthHeader
              {...props}
              title="Reset Password"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />

      <Stack.Screen 
        name="ResetPassword" 
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <AuthHeader
              {...props}
              title="New Password"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />

      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{
          headerShown: true,
          gestureEnabled: false,
          header: (props) => (
            <AuthHeader
              {...props}
              title="Verify Email"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />

      {/* Onboarding Journey Setup */}
      <Stack.Group
        screenOptions={{
          gestureEnabled: false,
          headerShown: false, // These screens have their own custom headers
        }}
      >
        <Stack.Screen 
          name="OnboardingStart" 
          component={OnboardingStartScreen}
        />
        
        <Stack.Screen 
          name="AsylumStatus" 
          component={AsylumStatusScreen}
        />
        
        <Stack.Screen 
          name="ImmigrationStatus" 
          component={ImmigrationStatusScreen}
        />
        
        <Stack.Screen 
          name="PersonalInformation" 
          component={PersonalInformationScreen}
        />
        
        <Stack.Screen 
          name="ContactInformation" 
          component={ContactInformationScreen}
        />
        
        <Stack.Screen 
          name="BackgroundInformation" 
          component={BackgroundInformationScreen}
        />
        
        <Stack.Screen 
          name="ReviewInformation" 
          component={ReviewScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AuthNavigator;