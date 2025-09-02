import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface TabHeaderProps {
  title: string;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '600',
  },
});