import React from 'react';
import { View, Text } from 'react-native';

const TestDashboard = () => {
  console.log('TestDashboard component is rendering!');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7CB342' }}>
      <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
        🎉 DASHBOARD WORKS! 🎉
      </Text>
      <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>
        Navigation is successful!
      </Text>
      <Text style={{ fontSize: 12, color: 'white', marginTop: 20 }}>
        DEBUG: TestDashboard rendered
      </Text>
    </View>
  );
};

export default TestDashboard;