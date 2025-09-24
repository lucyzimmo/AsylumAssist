import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { HomeStackScreenProps } from '../../types/navigation';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { useTimeline } from '../../hooks/useTimeline';
import { AsylumPhase } from '../../types/timeline';
import { AuthService } from '../../services/authService';
import { US_IMMIGRATION_COURTS, ImmigrationCourt } from '../../constants/immigrationCourts';

interface UserOnboardingData {
  entryDate?: string;
  hasFiledI589?: 'yes' | 'no' | 'not-sure';
  i589SubmissionDate?: string;
  filingLocation?: 'uscis' | 'immigration-court' | 'not-sure';
  nextHearingDate?: string;
  assignedCourt?: string;
  eoirCaseStatus?: 'yes' | 'no' | 'not-sure';
  hasTPS?: 'yes' | 'no';
  tpsCountry?: string;
  tpsExpirationDate?: string;
  hasParole?: 'yes' | 'no';
  paroleType?: string;
  paroleExpirationDate?: string;
  hasOtherStatus?: 'yes' | 'no';
  otherStatusDescription?: string;
}

interface TimelineItem {
  id: string;
  type: 'court-hearing' | 'filing-deadline' | 'work-authorization' | 'task' | 'info';
  category: 'Court Dates & Hearings' | 'Filing Deadlines' | 'Work Authorization Actions' | 'Supportive Notes';
  title: string;
  description: string;
  date?: string;
  priority: 'critical' | 'important' | 'info';
  actionText?: string;
  actionUrl?: string;
  completed?: boolean;
  subItems?: TimelineSubItem[];
  isEditable?: boolean;
  notificationId?: string;
}

interface TimelineSubItem {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  actionText?: string;
  actionUrl?: string;
}

export const DashboardScreen: React.FC<HomeStackScreenProps<'Dashboard'>> = () => {
  const navigation = useNavigation<HomeStackScreenProps<'Dashboard'>['navigation']>();
  const {
    timeline,
    phases,
    alerts,
    currentPhase,
    loading,
    markPhaseComplete,
    getCurrentStatus,
    getNextSteps,
  } = useTimeline();
  
  const [showCompletedSteps, setShowCompletedSteps] = useState(false);
  const [userData, setUserData] = useState<UserOnboardingData | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [nextDeadline, setNextDeadline] = useState<TimelineItem | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editedDate, setEditedDate] = useState<Date>(new Date());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showCompletedItems, setShowCompletedItems] = useState(false);

  // Load user data and setup notifications on component mount
  useEffect(() => {
    setupNotifications();
    loadUserData();
  }, []);

  // Helper function to get court details by code
  const getCourtByCode = (courtCode: string): ImmigrationCourt | null => {
    return US_IMMIGRATION_COURTS.find(court => court.code === courtCode) || null;
  };

  const setupNotifications = async () => {
    try {
      // Request permissions with explicit settings
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      console.log('Notification permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'To receive important deadline reminders, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      console.log('Notifications setup completed successfully');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userOnboardingData');
      console.log('Stored data:', storedData);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Parsed data:', parsedData);
        setUserData(parsedData);
        const timeline = generateTimelineItems(parsedData);
        console.log('Generated timeline:', timeline);
        setTimelineItems(timeline);

        // Schedule notifications for critical and important items
        await scheduleTimelineNotifications(timeline);
        
        // Find next deadline
        const nextItem = timeline.find(item => 
          item.date && new Date(item.date) > new Date() && 
          (item.priority === 'critical' || item.priority === 'important')
        );
        setNextDeadline(nextItem || null);
      } else {
        console.log('No stored data found');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const scheduleNotification = async (item: TimelineItem) => {
    if (!item.date) return;

    try {
      const itemDate = new Date(item.date);
      const now = new Date();

      // Don't schedule notifications for past dates
      if (itemDate <= now) {
        console.log(`Skipping notification for past date: ${item.title}`);
        return;
      }

      // Schedule for 1 week before, 3 days before, and 1 day before
      const reminderDays = [7, 3, 1];
      let scheduledCount = 0;

      for (const days of reminderDays) {
        const reminderDate = new Date(itemDate);
        reminderDate.setDate(reminderDate.getDate() - days);
        reminderDate.setHours(9, 0, 0, 0); // Set to 9 AM

        if (reminderDate > now) {
          const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);

          if (secondsUntilReminder > 0) {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `🚨 Asylum Deadline Alert`,
                body: `${item.title} is in ${days} day${days !== 1 ? 's' : ''}. Don't miss this critical deadline!`,
                data: {
                  itemId: item.id,
                  reminderDays: days,
                  itemTitle: item.title,
                  itemDate: item.date
                },
                sound: 'default',
                priority: 'high',
              },
              trigger: {
                type: 'timeInterval',
                seconds: secondsUntilReminder,
              } as any,
            });

            console.log(`Scheduled notification ${notificationId} for ${item.title} - ${days} days before`);
            scheduledCount++;
          }
        }
      }

      console.log(`Scheduled ${scheduledCount} notifications for: ${item.title}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Notification Error', 'Could not schedule reminder notifications. Please check your notification settings.');
    }
  };

  const scheduleTimelineNotifications = async (timeline: TimelineItem[]) => {
    for (const item of timeline) {
      if (item.date && (item.priority === 'critical' || item.priority === 'important')) {
        await scheduleNotification(item);
      }
    }
  };

  const cancelNotifications = async (itemId: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const itemNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.itemId === itemId
      );

      for (const notification of itemNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const handleEditItem = (item: TimelineItem) => {
    if (!item.isEditable) return;

    setEditingItem(item);
    setEditedTitle(item.title);
    setEditedDescription(item.description);
    if (item.date) {
      setEditedDate(new Date(item.date));
    }
    setEditModalVisible(true);
  };

  const handleToggleComplete = async (itemId: string) => {
    const updatedItems = timelineItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setTimelineItems(updatedItems);
    await saveTimelineToStorage(updatedItems);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    // Cancel old notifications
    await cancelNotifications(editingItem.id);

    const updatedItems = timelineItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            title: editedTitle,
            description: editedDescription,
            date: editedDate.toISOString()
          }
        : item
    );

    setTimelineItems(updatedItems);
    await saveTimelineToStorage(updatedItems);

    // Schedule new notifications
    const updatedItem = updatedItems.find(item => item.id === editingItem.id);
    if (updatedItem) {
      await scheduleNotification(updatedItem);
    }

    setEditModalVisible(false);
    setEditingItem(null);
  };

  const saveTimelineToStorage = async (timeline: TimelineItem[]) => {
    try {
      await AsyncStorage.setItem('userTimeline', JSON.stringify(timeline));
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  };

  const generateTimelineItems = (data: UserOnboardingData): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const today = new Date();

    // 1. Court Dates & Hearings
    if (data.nextHearingDate) {
      const hearingDate = new Date(data.nextHearingDate);
      items.push({
        id: 'next-hearing',
        type: 'court-hearing',
        category: 'Court Dates & Hearings',
        title: 'Immigration Court Hearing',
        description: (() => {
          if (data.assignedCourt) {
            const court = getCourtByCode(data.assignedCourt);
            if (court) {
              return `Appear at ${court.name} (${court.city}, ${court.state}). Failure to appear may result in removal order.`;
            }
            return `Appear at ${data.assignedCourt}. Failure to appear may result in removal order.`;
          }
          return 'Appear at your assigned court. Failure to appear may result in removal order.';
        })(),
        date: hearingDate.toISOString(),
        priority: 'critical',
        isEditable: true,
        actionText: 'Get Directions',
        actionUrl: (() => {
          if (data.assignedCourt) {
            const court = getCourtByCode(data.assignedCourt);
            if (court) {
              return `https://maps.google.com/?q=${encodeURIComponent(court.address)}`;
            }
            return `https://maps.google.com/?q=${encodeURIComponent(data.assignedCourt)}`;
          }
          return 'https://www.justice.gov/eoir/immigration-court-addresses';
        })(),
        subItems: [
          {
            id: 'prepare-evidence',
            title: 'Gather Supporting Evidence',
            description: 'Collect documents, country condition reports, witness affidavits, and personal testimony'
          },
          {
            id: 'find-attorney-urgent',
            title: 'Secure Legal Representation',
            description: 'Find an immigration attorney immediately if you don\'t have one'
          }
        ]
      });
    }

    // 2. Filing Deadlines
    if (data.entryDate) {
      const entryDate = new Date(data.entryDate);
      const oneYearDeadline = new Date(entryDate);
      oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);
      
      const isLateFiling = today > oneYearDeadline;
      
      if (!isLateFiling && data.hasFiledI589 !== 'yes') {
        items.push({
          id: 'one-year-deadline',
          type: 'filing-deadline',
          category: 'Filing Deadlines',
          title: 'I-589 Filing Deadline',
          description: 'File your asylum application within one year of arrival. Missing this deadline severely limits your options.',
          date: oneYearDeadline.toISOString(),
          priority: 'critical',
          isEditable: true,
          subItems: [
            {
              id: 'gather-evidence',
              title: 'Gather Supporting Evidence',
              description: 'Personal statement, country conditions, medical records, psychological evaluations'
            },
            {
              id: 'filing-fee',
              title: 'Prepare Filing Fee',
              description: '$100 filing fee required (as of July 22, 2025) - fee waiver available if eligible'
            },
            {
              id: 'find-attorney',
              title: 'Find Legal Representation',
              description: 'Consider hiring an immigration attorney - pro bono options available'
            }
          ]
        });
      } else if (isLateFiling) {
        const hasException = data.hasTPS === 'yes' || data.hasParole === 'yes';
        items.push({
          id: 'late-filing-options',
          type: 'filing-deadline',
          category: 'Filing Deadlines',
          title: hasException ? 'Exception May Apply' : 'Consider Withholding of Removal',
          description: hasException 
            ? 'Your TPS/Parole status may provide an exception to the one-year deadline'
            : 'One-year deadline passed. You may still apply for Withholding of Removal or CAT protection.',
          priority: 'critical'
        });
      }
    }

    // 3. Work Authorization Actions
    if (data.hasFiledI589 === 'yes' && data.i589SubmissionDate) {
      const submissionDate = new Date(data.i589SubmissionDate);
      const eadEligibilityDate = new Date(submissionDate);
      eadEligibilityDate.setDate(eadEligibilityDate.getDate() + 150);
      
      items.push({
        id: 'ead-eligibility',
        type: 'work-authorization',
        category: 'Work Authorization Actions',
        title: 'Work Permit Eligibility (I-765)',
        description: 'You may be eligible to apply for Employment Authorization Document 150 days after filing I-589. Call USCIS to confirm your eligibility status.',
        date: eadEligibilityDate.toISOString(),
        priority: 'important',
        isEditable: true,
        actionText: 'Call USCIS',
        actionUrl: 'tel:1-800-375-5283',
        subItems: [
          {
            id: 'ead-confirm',
            title: 'Confirm Eligibility',
            description: 'Call USCIS at 1-800-375-5283 to verify you can apply for work authorization'
          },
          {
            id: 'ead-photos',
            title: 'Get Passport Photos',
            description: '2 passport-style photos required for I-765 application'
          },
          {
            id: 'ead-fee',
            title: 'No Filing Fee',
            description: 'I-765 is free for asylum applicants - do not pay if asked'
          }
        ]
      });

      const biometricsDate = new Date(submissionDate);
      biometricsDate.setDate(biometricsDate.getDate() + 30);
      
      if (today < biometricsDate) {
        items.push({
          id: 'biometrics-appointment',
          type: 'work-authorization',
          category: 'Work Authorization Actions',
          title: 'Biometrics Appointment',
          description: 'Attend your biometrics appointment (typically 2-6 weeks after filing)',
          date: biometricsDate.toISOString(),
          priority: 'critical',
          isEditable: true
        });
      }
    }

    // 4. Special Status Deadlines
    if (data.hasTPS === 'yes' && data.tpsExpirationDate) {
      const tpsExpiry = new Date(data.tpsExpirationDate);
      items.push({
        id: 'tps-expiration',
        type: 'filing-deadline',
        category: 'Filing Deadlines',
        title: 'TPS Status Expiration',
        description: 'File asylum application before TPS expires to maintain exception eligibility',
        date: tpsExpiry.toISOString(),
        priority: 'important',
        isEditable: true
      });
    }

    if (data.hasParole === 'yes' && data.paroleExpirationDate) {
      const paroleExpiry = new Date(data.paroleExpirationDate);
      items.push({
        id: 'parole-expiration',
        type: 'filing-deadline',
        category: 'Filing Deadlines',
        title: 'Parole Status Expiration',
        description: 'File asylum application before parole expires to maintain exception eligibility',
        date: paroleExpiry.toISOString(),
        priority: 'important',
        isEditable: true
      });
    }

    // 5. Supportive Notes
    if (!data.entryDate) {
      items.push({
        id: 'find-entry-date',
        type: 'task',
        category: 'Supportive Notes',
        title: 'Find Your Entry Date',
        description: 'Use I-94 lookup to determine your arrival date for deadline calculations',
        priority: 'important',
        actionText: 'Check I-94',
        actionUrl: 'https://i94.cbp.dhs.gov/I94/#/home'
      });
    }

    if (data.filingLocation === 'immigration-court' && !data.assignedCourt) {
      items.push({
        id: 'find-court',
        type: 'info',
        category: 'Supportive Notes',
        title: 'Identify Your Immigration Court',
        description: 'Contact EOIR or check case documents to find your assigned court',
        priority: 'info',
        actionText: 'Check EOIR',
        actionUrl: 'https://acis.eoir.justice.gov/en/'
      });
    }

    // Sort timeline items chronologically with priority weighting
    return items.sort((a, b) => {
      // Critical items first
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (b.priority === 'critical' && a.priority !== 'critical') return 1;
      
      // Then by date
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      
      // Finally by priority
      const priorityOrder = { critical: 0, important: 1, info: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleCardAction = async (item: TimelineItem) => {
    if (item.actionUrl) {
      try {
        await Linking.openURL(item.actionUrl);
      } catch (error) {
        Alert.alert('Error', 'Could not open the link. Please try again.');
      }
    }
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const generateCalendarEvents = () => {
    const events = timelineItems
      .filter(item => item.date)
      .map((item) => {
        const date = new Date(item.date!);
        const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');

        // Generate unique UID for each event
        const uid = `asylum-${item.id}-${Date.now()}@zowy-app.com`;

        // Create proper ICS description with escaped characters
        const description = item.description.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
        const subItemsText = item.subItems ?
          '\\n\\nSupporting Actions:\\n' + item.subItems.map(sub => `• ${sub.title.replace(/,/g, '\\,').replace(/;/g, '\\;')}`).join('\\n') : '';

        // Create ICS format event with proper formatting
        const eventString = [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTART;VALUE=DATE:${formattedDate}`,
          `DTEND;VALUE=DATE:${formattedDate}`,
          `SUMMARY:${item.title.replace(/,/g, '\\,').replace(/;/g, '\\;')}`,
          `DESCRIPTION:${description}${subItemsText}`,
          `CATEGORIES:${item.category}`,
          `PRIORITY:${item.priority === 'critical' ? '1' : item.priority === 'important' ? '5' : '9'}`,
          `STATUS:TENTATIVE`,
          `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `LAST-MODIFIED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          'END:VEVENT'
        ].join('\r\n');

        return eventString;
      });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Zowy Asylum App//Timeline Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  };

  const addToDeviceCalendar = async (item: TimelineItem) => {
    try {
      if (!item.date) {
        Alert.alert('Error', 'This item has no date and cannot be added to calendar.');
        return;
      }

      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Calendar Permission Required',
          'To add events to your calendar, please enable calendar access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      // Get the default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source?.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on your device.');
        return;
      }

      const eventDate = new Date(item.date);

      // Create notes with sub-items
      let notes = item.description;
      if (item.subItems && item.subItems.length > 0) {
        notes += '\n\nSupporting Actions:\n';
        notes += item.subItems.map(sub => `• ${sub.title}: ${sub.description}`).join('\n');
      }

      // Create the calendar event
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: item.title,
        notes: notes,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        allDay: true,
        alarms: [
          { relativeOffset: -7 * 24 * 60 }, // 7 days before
          { relativeOffset: -3 * 24 * 60 }, // 3 days before
          { relativeOffset: -24 * 60 }, // 1 day before
        ],
        location: item.actionUrl?.includes('maps.google.com') ? 'Immigration Court' : undefined,
      });

      console.log('Created calendar event:', eventId);

      Alert.alert(
        '✅ Added to Calendar',
        `"${item.title}" has been added to your device calendar with reminders set for 7 days, 3 days, and 1 day before.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Calendar integration error:', error);
      Alert.alert('Error', 'Failed to add event to calendar. Please try again.');
    }
  };

  const addAllEventsToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Calendar Permission Required',
          'To add events to your calendar, please enable calendar access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      // Get the default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source?.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on your device.');
        return;
      }

      const eventsWithDates = timelineItems.filter(item => item.date);
      let successCount = 0;

      for (const item of eventsWithDates) {
        try {
          const eventDate = new Date(item.date!);

          // Create notes with sub-items
          let notes = item.description;
          if (item.subItems && item.subItems.length > 0) {
            notes += '\n\nSupporting Actions:\n';
            notes += item.subItems.map(sub => `• ${sub.title}: ${sub.description}`).join('\n');
          }

          // Create the calendar event
          await Calendar.createEventAsync(defaultCalendar.id, {
            title: item.title,
            notes: notes,
            startDate: eventDate,
            endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            allDay: true,
            alarms: [
              { relativeOffset: -7 * 24 * 60 }, // 7 days before
              { relativeOffset: -3 * 24 * 60 }, // 3 days before
              { relativeOffset: -24 * 60 }, // 1 day before
            ],
            location: item.actionUrl?.includes('maps.google.com') ? 'Immigration Court' : undefined,
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to create event for ${item.title}:`, error);
        }
      }

      Alert.alert(
        '✅ Events Added',
        `Successfully added ${successCount} out of ${eventsWithDates.length} events to your calendar with automatic reminders.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Bulk calendar integration error:', error);
      Alert.alert('Error', 'Failed to add events to calendar. Please try again.');
    }
  };

  const handleCalendarExport = async () => {
    try {
      const icsContent = generateCalendarEvents();
      const fileName = 'asylum-timeline.ics';
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write ICS file to device storage
      await FileSystem.writeAsStringAsync(fileUri, icsContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Share the actual ICS file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/calendar',
        dialogTitle: 'Add Asylum Timeline to Calendar',
        UTI: 'public.calendar-event',
      });
      
      Alert.alert(
        'Calendar File Created',
        'Your asylum timeline has been exported as a calendar file. Choose your calendar app to import all events.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Calendar export error:', error);
      
      // Fallback to text sharing if file export fails
      const datesList = timelineItems
        .filter(item => item.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
        .map(item => {
          const date = new Date(item.date!);
          const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const urgency = daysUntil < 0 ? ' (OVERDUE)' : daysUntil <= 30 ? ' (URGENT)' : '';
          
          return `📅 ${date.toLocaleDateString()} - ${item.title}${urgency}\n   ${item.description}`;
        })
        .join('\n\n');

      const calendarText = `🗓️ ASYLUM TIMELINE - IMPORTANT DATES\n\n${datesList}\n\n📝 Instructions:\n1. Copy these dates\n2. Open your calendar app\n3. Create new events for each date\n4. Set reminders as needed\n\n⚠️ These dates are critical for your asylum case. Missing deadlines can severely impact your application.`;

      await Share.share({
        message: calendarText,
        title: 'Asylum Timeline Dates',
      });

      Alert.alert(
        'Calendar Export',
        'Calendar file export failed, but your dates have been shared as text. You can copy them and manually add to your calendar app.',
        [{ text: 'OK' }]
      );
    }
  };

  const generatePDFContent = () => {
    const today = new Date().toLocaleDateString();
    
    let content = `ASYLUM TIMELINE REPORT\n`;
    content += `Generated: ${today}\n`;
    content += `\n========================================\n\n`;

    if (nextDeadline) {
      content += `🚨 YOUR NEXT DEADLINE:\n`;
      content += `${nextDeadline.title}\n`;
      content += `Date: ${new Date(nextDeadline.date!).toLocaleDateString()}\n`;
      content += `${nextDeadline.description}\n\n`;
      content += `========================================\n\n`;
    }

    const categories = ['Court Dates & Hearings', 'Filing Deadlines', 'Work Authorization Actions', 'Supportive Notes'];
    
    categories.forEach(category => {
      const categoryItems = timelineItems.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        content += `${category.toUpperCase()}\n`;
        content += `${'-'.repeat(category.length)}\n\n`;
        
        categoryItems.forEach((item, index) => {
          content += `${index + 1}. ${item.title}\n`;
          if (item.date) {
            const date = new Date(item.date);
            const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            content += `   Date: ${date.toLocaleDateString()}`;
            if (daysUntil >= 0) {
              content += ` (${daysUntil} days remaining)`;
            } else {
              content += ` (OVERDUE)`;
            }
            content += `\n`;
          }
          content += `   Priority: ${item.priority.toUpperCase()}\n`;
          content += `   Description: ${item.description}\n`;
          
          if (item.subItems && item.subItems.length > 0) {
            content += `   Supporting Actions:\n`;
            item.subItems.forEach(subItem => {
              content += `   • ${subItem.title}\n`;
              content += `     ${subItem.description}\n`;
            });
          }
          content += `\n`;
        });
        content += `\n`;
      }
    });

    content += `========================================\n`;
    content += `Generated by Zowy Asylum App\n`;
    content += `For assistance, consult with an immigration attorney.\n`;

    return content;
  };

  const handlePDFExport = async () => {
    try {
      const pdfContent = generatePDFContent();
      
      await Share.share({
        message: pdfContent,
        title: 'Asylum Timeline Report',
      });
      
      Alert.alert(
        'Timeline Report',
        'Your timeline report has been shared. You can save it as a PDF from your share options.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('PDF export error:', error);
      Alert.alert('Error', 'Failed to export timeline report. Please try again.');
    }
  };

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const getPriorityColor = () => {
      switch (item.priority) {
        case 'critical':
          return '#DC2626'; // Red
        case 'important':
          return '#D97706'; // Orange
        case 'info':
          return '#2563EB'; // Blue
        default:
          return Colors.textPrimary;
      }
    };

    const getTypeIcon = () => {
      switch (item.type) {
        case 'court-hearing':
          return 'hammer-outline'; // Gavel
        case 'filing-deadline':
          return 'time-outline'; // Clock
        case 'work-authorization':
          return 'briefcase-outline'; // Work
        case 'task':
          return 'checkmark-circle-outline'; // Checklist
        case 'info':
          return 'information-circle-outline'; // Info
        default:
          return 'calendar-outline';
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return { day, month, year };
    };

    const isOverdue = item.date && new Date(item.date) < new Date() && item.type !== 'work-authorization';
    const isEligible = item.date && new Date(item.date) < new Date() && item.type === 'work-authorization';
    const daysUntil = item.date ? Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <View key={item.id} style={[styles.timelineItem, !item.date && styles.timelineItemNoDate]}>
        {/* Date Column - Only show if item has date */}
        {item.date && (
          <View style={styles.dateColumn}>
            <Text style={[styles.dateDay, { color: getPriorityColor() }]}>
              {formatDate(item.date).day}
            </Text>
            <Text style={[styles.dateMonth, { color: getPriorityColor() }]}>
              {formatDate(item.date).month.toUpperCase()}
            </Text>
            <Text style={styles.dateYear}>{formatDate(item.date).year}</Text>
            {daysUntil !== null && daysUntil >= 0 && (
              <Text style={[styles.daysUntil, { color: getPriorityColor() }]}>
                {daysUntil === 0 ? 'TODAY' : `${daysUntil}d`}
              </Text>
            )}
            {isOverdue && (
              <Text style={[styles.overdue, { color: getPriorityColor() }]}>
                OVERDUE
              </Text>
            )}
            {isEligible && (
              <Text style={[styles.eligible, { color: Colors.success }]}>
                ELIGIBLE
              </Text>
            )}
          </View>
        )}

        {/* Timeline Connector - Only show if item has date */}
        {item.date && (
          <View style={styles.timelineConnector}>
            <View style={[styles.timelineNode, { backgroundColor: getPriorityColor() }]}>
              <Ionicons name={getTypeIcon()} size={16} color={Colors.white} />
            </View>
            {index < timelineItems.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: Colors.border }]} />
            )}
          </View>
        )}

        {/* Icon for items without date */}
        {!item.date && (
          <View style={[styles.noDateIcon, { backgroundColor: getPriorityColor() }]}>
            <Ionicons name={getTypeIcon()} size={20} color={Colors.white} />
          </View>
        )}

        {/* Content Column */}
        <View style={[styles.contentColumn, !item.date && styles.contentColumnNoDate]}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <View style={styles.categoryAndBadge}>
                <Text style={styles.itemCategory} numberOfLines={1} ellipsizeMode="tail">
                  {item.category}
                </Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                  <Text style={styles.priorityText} numberOfLines={1}>
                    {item.priority === 'critical' ? 'CRITICAL' : item.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={[styles.itemTitle, { color: getPriorityColor() }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.itemDescription, item.completed && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
            {item.description}
          </Text>

          {/* Control Buttons */}
          <View style={styles.itemControls}>
            {/* Completion Toggle */}
            <TouchableOpacity
              style={[styles.compactButton, item.completed && styles.compactButtonCompleted]}
              onPress={() => handleToggleComplete(item.id)}
            >
              <Ionicons
                name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                size={20}
                color={item.completed ? Colors.success : Colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Edit Button */}
            {item.isEditable && (
              <TouchableOpacity
                style={styles.compactButton}
                onPress={() => handleEditItem(item)}
              >
                <Ionicons name="pencil" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Main Action Button */}
            {item.actionText && item.actionUrl && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getPriorityColor() }]}
                onPress={() => handleCardAction(item)}
              >
                <Ionicons
                  name={item.actionUrl.startsWith('tel:') ? "call" : "arrow-forward"}
                  size={16}
                  color={Colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.actionButtonText}>{item.actionText}</Text>
              </TouchableOpacity>
            )}


            {/* Debug: Show if item has date */}
            {!item.date && (
              <Text style={{ fontSize: 10, color: 'red', marginTop: 4 }}>No date - calendar button hidden</Text>
            )}
          </View>

          {/* Sub-items */}
          {item.subItems && item.subItems.length > 0 && (
            <View style={styles.subItemsContainer}>
              <TouchableOpacity 
                style={styles.subItemsHeader}
                onPress={() => toggleItemExpansion(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.subItemsHeaderText}>
                  {expandedItems.has(item.id) ? 'Supporting Actions' : `Supporting Actions`}
                </Text>
                <Ionicons 
                  name={expandedItems.has(item.id) ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={Colors.primary} 
                />
              </TouchableOpacity>
              
              {expandedItems.has(item.id) && (
                // Show all items when expanded
                item.subItems.map((subItem) => (
                  <View key={subItem.id} style={styles.subItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.textSecondary} />
                    <View style={styles.subItemContent}>
                      <Text style={styles.subItemTitle}>{subItem.title}</Text>
                      <Text style={styles.subItemDescription}>{subItem.description}</Text>

                      {/* Sub-item Action Button */}
                      {subItem.actionText && subItem.actionUrl && (
                        <TouchableOpacity
                          style={styles.subItemActionButton}
                          onPress={() => {
                            try {
                              Linking.openURL(subItem.actionUrl!);
                            } catch (error) {
                              Alert.alert('Error', 'Could not open the link. Please try again.');
                            }
                          }}
                        >
                          <Ionicons
                            name={subItem.actionUrl.startsWith('https://maps') ? "navigate" : "open-outline"}
                            size={14}
                            color={Colors.primary}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.subItemActionText}>{subItem.actionText}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to sign in again to access your timeline.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.signOut();
              // Navigate back to auth stack
              navigation.getParent()?.navigate('AuthStack');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading || dataLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Your Asylum Journey</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Logout"
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Next Deadline */}
        {nextDeadline && (
          <View style={styles.nextDeadlineContainer}>
            <Text style={styles.nextDeadlineHeader}>Your Next Deadline</Text>
            <View style={styles.nextDeadlineCard}>
              <View style={styles.nextDeadlineDate}>
                <Text style={styles.nextDeadlineDay}>
                  {new Date(nextDeadline.date!).getDate().toString().padStart(2, '0')}
                </Text>
                <Text style={styles.nextDeadlineMonth}>
                  {new Date(nextDeadline.date!).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
              </View>
              <View style={styles.nextDeadlineContent}>
                <Text style={styles.nextDeadlineTitle}>{nextDeadline.title}</Text>
                <Text style={styles.nextDeadlineDescription}>{nextDeadline.description}</Text>
                <Text style={styles.nextDeadlineDays}>
                  {Math.ceil((new Date(nextDeadline.date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineHeader}>Your Asylum Timeline</Text>
          {timelineItems.length > 0 ? (
            <>
              {/* Active Items */}
              {timelineItems.filter(item => !item.completed).map((item, index) => renderTimelineItem(item, index))}
              
              {/* Completed Items Section */}
              {timelineItems.filter(item => item.completed).length > 0 && (
                <View style={styles.completedSection}>
                  <TouchableOpacity 
                    style={styles.completedHeader}
                    onPress={() => setShowCompletedItems(!showCompletedItems)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.completedHeaderText}>
                      Completed Items ({timelineItems.filter(item => item.completed).length})
                    </Text>
                    <Ionicons 
                      name={showCompletedItems ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {showCompletedItems && (
                    <View style={styles.completedItemsContainer}>
                      {timelineItems
                        .filter(item => item.completed)
                        .sort((a, b) => {
                          // Sort by completion date (most recent first) or by original date
                          if (a.date && b.date) {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                          }
                          return 0;
                        })
                        .map((item, index) => renderTimelineItem(item, index))}
                    </View>
                  )}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No timeline data available. Please complete the questionnaire to generate your personalized timeline.
              </Text>
              <Button
                title="Complete Questionnaire"
                onPress={() => navigation.navigate('AuthStack', { screen: 'OnboardingStart' })}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Timeline Item</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Enter title"
                  multiline
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.descriptionInput]}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                  <Text style={styles.dateButtonText}>
                    {editedDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setEditedDate(selectedDate);
                      }
                    }}
                  />
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Export Timeline Button */}
        {timelineItems.length > 0 && (
          <View style={styles.exportSection}>
            <Button
              title="Add All to Calendar"
              onPress={addAllEventsToCalendar}
              style={styles.exportButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 22,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Your Next Deadline Styles
  nextDeadlineContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  nextDeadlineHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
  },
  nextDeadlineCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#DC2626',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextDeadlineDate: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
  },
  nextDeadlineDay: {
    fontSize: 32,
    fontWeight: '800',
    color: '#DC2626',
    lineHeight: 38,
  },
  nextDeadlineMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 1,
  },
  nextDeadlineContent: {
    flex: 1,
  },
  nextDeadlineTitle: {
    ...Typography.h4,
    color: '#991B1B',
    fontWeight: '700',
    marginBottom: 4,
  },
  nextDeadlineDescription: {
    ...Typography.body,
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  nextDeadlineDays: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Timeline Styles
  timelineContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  timelineHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItemNoDate: {
    paddingLeft: 20,
  },

  // Date Column
  dateColumn: {
    alignItems: 'center',
    minWidth: 70,
    marginRight: 16,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateYear: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  daysUntil: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  overdue: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  eligible: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  noDateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDateText: {
    fontSize: 20,
  },
  noDatePlaceholder: {
    width: 32,
    height: 32,
  },

  // Timeline Connector
  timelineConnector: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  timelineNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: 40,
    top: 32,
    zIndex: 1,
  },

  // Content Column
  contentColumn: {
    flex: 1,
    paddingLeft: 4,
  },
  contentColumnNoDate: {
    paddingLeft: 16,
  },
  itemHeader: {
    marginBottom: 10,
  },
  itemHeaderLeft: {
    marginBottom: 8,
  },
  categoryAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexShrink: 0,
    minWidth: 60,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  itemTitle: {
    ...Typography.h4,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 8,
  },
  itemDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  actionButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Sub Items
  subItemsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  subItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  subItemsHeaderText: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  showMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    ...Typography.button,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  subItemTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  subItemDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  subItemActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  subItemActionText: {
    ...Typography.button,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyStateButton: {
    minWidth: 200,
  },

  // Completed Section
  completedSection: {
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  completedHeaderText: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  completedItemsContainer: {
    marginTop: 12,
  },

  // Export Section
  exportSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  exportButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  exportHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Compact Controls
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactButtonCompleted: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  fieldLabel: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    minHeight: 80,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flex: 1,
    marginRight: 8,
  },
  modalCancelText: {
    ...Typography.button,
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalSaveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    flex: 1,
    marginLeft: 8,
  },
  modalSaveText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DashboardScreen;