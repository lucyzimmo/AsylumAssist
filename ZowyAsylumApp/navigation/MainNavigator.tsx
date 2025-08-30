import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { 
  MainStackParamList, 
  MainTabParamList,
  HomeStackParamList,
  DocumentsStackParamList,
  ResourcesStackParamList,
  ProfileStackParamList,
} from '../types/navigation';
import { MainHeader } from '../components/navigation/MainHeader';
import { TabHeader } from '../components/navigation/TabHeader';
import { PlaceholderScreen } from '../components/common/PlaceholderScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import DocumentsScreen from '../screens/main/DocumentsScreen';
import ResourcesScreen from '../screens/main/ResourcesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Stack Navigators
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const DocumentsStack = createStackNavigator<DocumentsStackParamList>();
const ResourcesStack = createStackNavigator<ResourcesStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Tab Icons Component
const TabIcon: React.FC<{ 
  name: 'home' | 'documents' | 'resources' | 'profile';
  focused: boolean;
  color: string;
  size: number;
}> = ({ name, focused, color, size }) => {
  const getIconName = () => {
    switch (name) {
      case 'home':
        return focused ? 'time' : 'time-outline';
      case 'documents':
        return focused ? 'folder' : 'folder-outline';
      case 'resources':
        return focused ? 'library' : 'library-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'phone-portrait-outline';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons 
        name={getIconName() as any}
        size={size} 
        color={color} 
        style={{ marginBottom: 2 }}
      />
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: focused ? color : 'transparent',
        }}
      />
    </View>
  );
};

// Default screen options for stacks
const defaultStackOptions: StackNavigationOptions = {
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

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        ...defaultStackOptions,
        headerShown: true,
      }}
      initialRouteName="Timeline"
    >
      <HomeStack.Screen
        name="Timeline"
        component={DashboardScreen}
        options={{
          headerShown: false, // DashboardScreen has its own header
        }}
      />
      
      <HomeStack.Screen
        name="TimelineSetup"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Set Up Timeline"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="DeadlineDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Deadline Details"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="MilestoneDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Milestone"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="HearingDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Court Hearing"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="StepAction"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Complete Step"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="ProgressOverview"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Progress Overview"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <HomeStack.Screen
        name="NextSteps"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Next Steps"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
    </HomeStack.Navigator>
  );
};

// Documents Stack Navigator
const DocumentsStackNavigator: React.FC = () => {
  return (
    <DocumentsStack.Navigator
      screenOptions={{
        ...defaultStackOptions,
        headerShown: true,
      }}
      initialRouteName="DocumentsList"
    >
      <DocumentsStack.Screen
        name="DocumentsList"
        component={DocumentsScreen}
        options={{
          headerShown: false, // DocumentsScreen has its own header
        }}
      />
      
      <DocumentsStack.Screen
        name="DocumentsUpload"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Upload Document"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="DocumentCategories"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Categories"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="CategoryDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Category"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="ScanDocument"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Scan Document"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="DocumentPreview"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Document Preview"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="DocumentInfo"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Document Info"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="FormsList"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Forms"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="FormDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Form Details"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <DocumentsStack.Screen
        name="FormProgress"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Form Progress"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
    </DocumentsStack.Navigator>
  );
};

// Resources Stack Navigator
const ResourcesStackNavigator: React.FC = () => {
  return (
    <ResourcesStack.Navigator
      screenOptions={{
        ...defaultStackOptions,
        headerShown: true,
      }}
      initialRouteName="ResourcesHome"
    >
      <ResourcesStack.Screen
        name="ResourcesHome"
        component={ResourcesScreen}
        options={{
          headerShown: false, // ResourcesScreen has its own header
        }}
      />
      
      <ResourcesStack.Screen
        name="LegalAid"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Legal Aid"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="LegalAidDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Organization"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="Forms"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Forms & Applications"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="FormDownload"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Download Form"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="Guides"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Guides & Help"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="GuideDetail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Guide"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="Organizations"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Organizations"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="OrganizationMap"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Find Near You"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="ResourceBookmarks"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Bookmarks"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="ResourceSearch"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Search Resources"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ResourcesStack.Screen
        name="OnlineResources"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Online Resources"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
    </ResourcesStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        ...defaultStackOptions,
        headerShown: true,
      }}
      initialRouteName="ProfileHome"
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{
          headerShown: false, // ProfileScreen has its own header
        }}
      />
      
      <ProfileStack.Screen
        name="AccountDetails"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Account"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="EditProfile"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Edit Profile"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="ChangePassword"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Change Password"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="ChangeEmail"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Change Email"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="DataManagement"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Data Management"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="ExportData"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Export Data"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="DeleteAccount"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Delete Account"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="AppSettings"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="App Settings"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="NotificationPreferences"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Notifications"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="LanguagePreferences"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Language"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="HelpCenter"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Help Center"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="ContactSupport"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Contact Support"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="AboutApp"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="About Zowy"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="PrivacyPolicy"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Privacy Policy"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="TermsOfService"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Terms of Service"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <ProfileStack.Screen
        name="Feedback"
        component={PlaceholderScreen}
        options={{
          header: (props) => (
            <MainHeader
              {...props}
              title="Send Feedback"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
    </ProfileStack.Navigator>
  );
};

// Bottom Tab Navigator
const TabNavigator: React.FC = () => {
  const tabScreenOptions: BottomTabNavigationOptions = {
    headerShown: false, // We handle headers in individual stack navigators
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.textSecondary,
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      ...Typography.caption,
      fontSize: 10,
      marginTop: -2,
      marginBottom: Platform.OS === 'ios' ? 0 : 8,
    },
    tabBarStyle: {
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      paddingTop: 12,
      height: Platform.OS === 'ios' ? 100 : 80,
      elevation: 8,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabBarItemStyle: {
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      paddingTop: 8,
    },
  };

  return (
    <Tab.Navigator
      screenOptions={tabScreenOptions}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Timeline',
          tabBarIcon: (props) => <TabIcon {...props} name="home" />,
        }}
      />
      
      <Tab.Screen
        name="Documents"
        component={DocumentsStackNavigator}
        options={{
          title: 'Documents',
          tabBarIcon: (props) => <TabIcon {...props} name="documents" />,
        }}
      />
      
      <Tab.Screen
        name="Resources"
        component={ResourcesStackNavigator}
        options={{
          title: 'Resources',
          tabBarIcon: (props) => <TabIcon {...props} name="resources" />,
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: (props) => <TabIcon {...props} name="profile" />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack with Modal overlays
export const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
      initialRouteName="MainTabs"
    >
      {/* Main Tab Navigator */}
      <MainStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* Stack screens that overlay the tabs */}
      <MainStack.Screen
        name="TimelineDetail"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Timeline Step"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="DocumentEdit"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Edit Document"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="DocumentUpload"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Upload Document"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="FormWizard"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          gestureEnabled: false,
          header: (props) => (
            <MainHeader
              {...props}
              title="Form Assistant"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="ResourceSearch"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Search Resources"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="OrganizationDetail"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Organization"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="AccountSettings"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Account Settings"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="TimelineEditor"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Edit Timeline"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="DataExport"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Export Data"
              showBack={true}
              showHelp={true}
            />
          ),
        }}
      />
      
      <MainStack.Screen
        name="LegalDisclaimer"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          header: (props) => (
            <MainHeader
              {...props}
              title="Legal Disclaimer"
              showBack={true}
              showHelp={false}
            />
          ),
        }}
      />
    </MainStack.Navigator>
  );
};

export default MainNavigator;