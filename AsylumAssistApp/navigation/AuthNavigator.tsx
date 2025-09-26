import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Colors } from '../constants/Colors';
import { AuthStackParamList } from '../types/navigation';
import { AuthHeader } from '../components/navigation/AuthHeader';

// Import screens
import { SplashScreen } from '../screens/SplashScreen';
import { AuthLandingScreen } from '../screens/auth/AuthLandingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import OnboardingStartScreen from '../screens/onboarding/OnboardingStartScreen';
import { AsylumStatusScreen } from '../screens/onboarding/AsylumStatusScreen';
import { ImmigrationStatusScreen } from '../screens/onboarding/ImmigrationStatusScreen';
import { SpecialStatusScreen } from '../screens/onboarding/SpecialStatusScreen';
import { OnboardingCompleteScreen } from '../screens/onboarding/OnboardingCompleteScreen';

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
      initialRouteName="Splash"
    >
      {/* App Launch Flow */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      <Stack.Screen 
        name="AuthLanding" 
        component={AuthLandingScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      {/* Legacy Welcome Screen - can be used for tutorial */}
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
              title="Sign up"
              onBackPress={() => props.navigation.goBack()}
              showBackButton={true}
              showLanguageSelector={true}
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
              title="Log in"
              onBackPress={() => props.navigation.goBack()}
              showBackButton={true}
              showLanguageSelector={true}
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
              title="Reset Password"
              onBackPress={() => props.navigation.goBack()}
              showBackButton={true}
              showLanguageSelector={false}
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
              title="New Password"
              onBackPress={() => props.navigation.goBack()}
              showBackButton={true}
              showLanguageSelector={false}
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
              title="Verify Email"
              onBackPress={() => props.navigation.goBack()}
              showBackButton={true}
              showLanguageSelector={false}
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
          name="SpecialStatus" 
          component={SpecialStatusScreen}
        />
        
        <Stack.Screen 
          name="OnboardingComplete" 
          component={OnboardingCompleteScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AuthNavigator;