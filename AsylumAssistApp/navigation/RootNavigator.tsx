import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Start with authentication flow - users can skip to main app
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AuthStack"
    >
      <Stack.Screen 
        name="AuthStack" 
        component={AuthNavigator} 
      />
      <Stack.Screen 
        name="MainStack" 
        component={MainNavigator}
        listeners={{
          focus: () => console.log('MainStack focused - should show dashboard'),
        }}
      />
    </Stack.Navigator>
  );
};