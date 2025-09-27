import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  Platform,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n';
import { HomeStackScreenProps } from '../../types/navigation';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
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
  const { t, i18n } = useTranslation();
  const isRTLLayout = isRTL(i18n.language);
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
          t('notifications.disabled'),
          t('notifications.disabledMessage'),
          [
            { text: t('calendar.cancel'), style: 'cancel' },
            { text: t('calendar.openSettings'), onPress: () => Linking.openURL('app-settings:') }
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
                title: t('notifications.deadlineAlert'),
                body: t('notifications.deadlineAlertMessage', {
                  title: item.title,
                  count: days
                }),
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
      Alert.alert(t('notifications.error'), t('notifications.errorMessage'));
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
        title: t('timeline.items.courtHearing.title'),
        description: (() => {
          if (data.assignedCourt) {
            const court = getCourtByCode(data.assignedCourt);
            if (court) {
              return t('timeline.items.courtHearing.description', { court: court.name, location: `${court.city}, ${court.state}` });
            }
            return t('timeline.items.courtHearing.description', { court: data.assignedCourt, location: '' });
          }
          return t('timeline.items.courtHearing.descriptionGeneric');
        })(),
        date: hearingDate.toISOString(),
        priority: 'critical',
        isEditable: true,
        actionText: t('dashboard.getDirections'),
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
            title: t('timeline.subItems.gatherEvidence'),
            description: t('timeline.subItems.gatherEvidenceDesc')
          },
          {
            id: 'find-attorney-urgent',
            title: t('timeline.subItems.findAttorneyUrgent'),
            description: t('timeline.subItems.findAttorneyUrgentDesc')
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
          title: t('timeline.items.i589Deadline.title'),
          description: t('timeline.items.i589Deadline.description'),
          date: oneYearDeadline.toISOString(),
          priority: 'critical',
          isEditable: true,
          subItems: [
            {
              id: 'gather-evidence',
              title: t('timeline.subItems.gatherEvidence'),
              description: t('timeline.subItems.gatherEvidenceDesc')
            },
            {
              id: 'filing-fee',
              title: t('timeline.subItems.filingFee'),
              description: t('timeline.subItems.filingFeeDesc')
            },
            {
              id: 'find-attorney',
              title: t('timeline.subItems.findAttorney'),
              description: t('timeline.subItems.findAttorneyDesc')
            }
          ]
        });
      } else if (isLateFiling) {
        const hasException = data.hasTPS === 'yes' || data.hasParole === 'yes';
        items.push({
          id: 'late-filing-options',
          type: 'filing-deadline',
          category: 'Filing Deadlines',
          title: hasException ? t('timeline.items.lateFilingOptions.title') : t('timeline.items.lateFilingOptions.titleNoException'),
          description: hasException
            ? t('timeline.items.lateFilingOptions.description')
            : t('timeline.items.lateFilingOptions.descriptionNoException'),
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
        title: t('timeline.items.workPermit.title'),
        description: t('timeline.items.workPermit.description'),
        date: eadEligibilityDate.toISOString(),
        priority: 'important',
        isEditable: true,
        actionText: t('dashboard.callUSCIS'),
        actionUrl: 'tel:1-800-375-5283',
        subItems: [
          {
            id: 'ead-confirm',
            title: t('timeline.subItems.confirmEligibility'),
            description: t('timeline.subItems.confirmEligibilityDesc')
          },
          {
            id: 'ead-photos',
            title: t('timeline.subItems.getPhotos'),
            description: t('timeline.subItems.getPhotosDesc')
          },
          {
            id: 'ead-fee',
            title: t('timeline.subItems.noFee'),
            description: t('timeline.subItems.noFeeDesc')
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
          title: t('timeline.items.biometrics.title'),
          description: t('timeline.items.biometrics.description'),
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
        title: t('timeline.items.tpsExpiration.title'),
        description: t('timeline.items.tpsExpiration.description'),
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
        title: t('timeline.items.paroleExpiration.title'),
        description: t('timeline.items.paroleExpiration.description'),
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
        title: t('timeline.items.findEntryDate.title'),
        description: t('timeline.items.findEntryDate.description'),
        priority: 'important',
        actionText: t('timeline.actionTexts.checkI94'),
        actionUrl: 'https://i94.cbp.dhs.gov/I94/#/home'
      });
    }

    if (data.filingLocation === 'immigration-court' && !data.assignedCourt) {
      items.push({
        id: 'find-court',
        type: 'info',
        category: 'Supportive Notes',
        title: t('timeline.items.findCourt.title'),
        description: t('timeline.items.findCourt.description'),
        priority: 'info',
        actionText: t('timeline.actionTexts.checkEOIR'),
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



  const addEventToCalendar = async (item: TimelineItem) => {
    if (!item.date) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('calendar.permissionRequired'),
          t('calendar.permissionMessage'),
          [
            { text: t('calendar.cancel'), style: 'cancel' },
            { text: t('calendar.openSettings'), onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source?.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert(t('calendar.error'), t('calendar.noCalendar'));
        return;
      }

      const eventDate = new Date(item.date);
      let notes = item.description;
      if (item.subItems && item.subItems.length > 0) {
        notes += '\n\nSupporting Actions:\n';
        notes += item.subItems.map(sub => `• ${sub.title}: ${sub.description}`).join('\n');
      }

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: item.title,
        notes: notes,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 60 * 60 * 1000),
        allDay: true,
        alarms: [
          { relativeOffset: -7 * 24 * 60 },
          { relativeOffset: -3 * 24 * 60 },
          { relativeOffset: -24 * 60 },
        ],
        location: item.actionUrl?.includes('maps.google.com') ? 'Immigration Court' : undefined,
      });

      Alert.alert(t('calendar.eventAdded'), t('calendar.eventAddedMessage', { title: item.title }));
    } catch (error) {
      console.error('Calendar integration error:', error);
      Alert.alert(t('calendar.error'), t('calendar.errorMessage'));
    }
  };

  const addAllEventsToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('calendar.permissionRequired'),
          t('calendar.permissionMessage'),
          [
            { text: t('calendar.cancel'), style: 'cancel' },
            { text: t('calendar.openSettings'), onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      // Get the default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.source?.name === 'Default') || calendars[0];

      if (!defaultCalendar) {
        Alert.alert(t('calendar.error'), t('calendar.noCalendar'));
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
        t('calendar.eventsAdded'),
        t('calendar.eventsAddedMessage', { count: successCount, total: eventsWithDates.length }),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Bulk calendar integration error:', error);
      Alert.alert(t('calendar.error'), t('calendar.errorMessage'));
    }
  };



  const getUrgencyColor = (daysUntil: number | null) => {
    if (daysUntil === null || daysUntil < 0) return '#DC2626'; // Red for overdue
    if (daysUntil < 7) return '#DC2626'; // Red for <7 days
    if (daysUntil <= 14) return '#D97706'; // Orange for 7-14 days
    return '#16A34A'; // Green for >14 days
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
    const urgencyColor = getUrgencyColor(daysUntil);

    const getLocationText = () => {
      if (item.type === 'court-hearing' && userData?.assignedCourt) {
        const court = getCourtByCode(userData.assignedCourt);
        return court ? `${court.city}, ${court.state}` : userData.assignedCourt;
      }
      return null;
    };

    return (
      <View key={item.id} style={[styles.timelineItem, !item.date && styles.timelineItemNoDate]}>
        {/* Two-section card layout */}
        <View style={styles.cardContainer}>
          {/* Top section: Title, date, location, urgency badge */}
          <View style={styles.cardTopSection}>
            <View style={[styles.cardHeader, isRTLLayout && styles.cardHeaderRTL]}>
              <View style={styles.cardHeaderLeft}>
                {/* Single urgency badge */}
                {item.priority === 'critical' && (
                  <View style={[styles.urgencyBadge, { backgroundColor: getPriorityColor() }]}>
                    <Text style={styles.urgencyBadgeText}>{t('dashboard.urgentBadge')}</Text>
                  </View>
                )}
                <Text style={[styles.itemTitle, { color: getPriorityColor() }]}>
                  {item.title}
                </Text>
                {item.date && (
                  <View style={styles.dateLocationContainer}>
                    <Text style={styles.cardDateText}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    {getLocationText() && (
                      <Text style={styles.cardLocationText}>
                        📍 {getLocationText()}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* CTAs in top-right */}
              <View style={[styles.cardTopActions, isRTLLayout && styles.cardTopActionsRTL]}>
                {item.actionText && item.actionUrl && (
                  <TouchableOpacity
                    style={[styles.topActionButton, { backgroundColor: getPriorityColor() }]}
                    onPress={() => handleCardAction(item)}
                  >
                    <Ionicons
                      name={item.actionUrl.startsWith('tel:') ? "call" : "navigate"}
                      size={16}
                      color={Colors.white}
                    />
                    <Text style={styles.topActionText}>
                      {item.actionUrl?.startsWith('tel:') ? t('dashboard.callUSCIS') : t('dashboard.getDirections')}
                    </Text>
                  </TouchableOpacity>
                )}
                {item.date && (
                  <TouchableOpacity
                    style={styles.calendarButton}
                    onPress={() => addEventToCalendar(item)}
                  >
                    <Ionicons name="calendar" size={16} color={Colors.primary} />
                    <Text style={styles.calendarButtonText}>{t('dashboard.calendar')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Prominent countdown */}
            {daysUntil !== null && item.date && (
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownText, { color: urgencyColor }]}>
                  {isOverdue ? t('countdown.overdue') :
                   isEligible ? t('countdown.eligibleNow') :
                   daysUntil === 0 ? t('countdown.today') :
                   t('countdown.daysRemaining', { count: daysUntil })}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom section: Description and actions */}
          <View style={styles.cardBottomSection}>
            <Text style={[styles.itemDescription, item.completed && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
              {item.description}
            </Text>

            {/* Bottom actions row */}
            <View style={[styles.bottomActionsRow, isRTLLayout && styles.bottomActionsRowRTL]}>
              {/* Completion Toggle with tooltip */}
              <TouchableOpacity
                style={[styles.iconButton, item.completed && styles.iconButtonCompleted]}
                onPress={() => handleToggleComplete(item.id)}
                onLongPress={() => Alert.alert(t('dashboard.markComplete'), t('dashboard.markCompleteDescription'))}
              >
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={20}
                  color={item.completed ? Colors.success : Colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Edit Button with tooltip */}
              {item.isEditable && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleEditItem(item)}
                  onLongPress={() => Alert.alert(t('dashboard.editNote'), t('dashboard.editNoteDescription'))}
                >
                  <Ionicons name="pencil" size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
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
          <Text style={styles.loadingText}>{t('dashboard.loadingTimeline')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isRTLLayout && styles.headerRTL]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
          </View>
          <View style={[styles.headerRight, isRTLLayout && styles.headerRightRTL]}>
            <LanguageSwitcher iconSize={18} />
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel={t('common.logout')}
            >
              <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Next Deadline */}
        {nextDeadline && (
          <View style={styles.nextDeadlineContainer}>
            <Text style={styles.nextDeadlineHeader}>{t('dashboard.nextDeadlineHeader')}</Text>
            <View style={styles.nextDeadlineCard}>
              {/* Top section with urgency badge and CTAs */}
              <View style={styles.nextDeadlineTop}>
                <View style={[styles.nextDeadlineHeaderRow, isRTLLayout && styles.nextDeadlineHeaderRowRTL]}>
                  <View style={styles.nextDeadlineLeft}>
                    <View style={styles.nextDeadlineUrgencyBadge}>
                      <Text style={styles.nextDeadlineUrgencyText}>{t('dashboard.urgentBadge')}</Text>
                    </View>
                    <Text style={styles.nextDeadlineTitle}>{nextDeadline.title}</Text>
                    <Text style={styles.nextDeadlineDate}>
                      {new Date(nextDeadline.date!).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    {nextDeadline.type === 'court-hearing' && userData?.assignedCourt && (
                      <Text style={styles.nextDeadlineLocation}>
                        📍 {(() => {
                          const court = getCourtByCode(userData.assignedCourt!);
                          return court ? `${court.city}, ${court.state}` : userData.assignedCourt;
                        })()}
                      </Text>
                    )}
                  </View>

                  {/* CTAs in top-right */}
                  <View style={styles.nextDeadlineActions}>
                    {nextDeadline.actionText && nextDeadline.actionUrl && (
                      <TouchableOpacity
                        style={styles.nextDeadlineActionButton}
                        onPress={() => handleCardAction(nextDeadline)}
                      >
                        <Ionicons
                          name={nextDeadline.actionUrl.startsWith('tel:') ? "call" : "navigate"}
                          size={16}
                          color={Colors.white}
                        />
                        <Text style={styles.nextDeadlineActionText}>{t('dashboard.getDirections')}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.nextDeadlineCalendarButton}
                      onPress={() => addEventToCalendar(nextDeadline)}
                    >
                      <Ionicons name="calendar" size={16} color="#DC2626" />
                      <Text style={styles.nextDeadlineCalendarText}>{t('dashboard.addToCalendar')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Prominent countdown */}
                <View style={styles.nextDeadlineCountdown}>
                  <Text style={[styles.nextDeadlineCountdownText, {
                    color: getUrgencyColor(Math.ceil((new Date(nextDeadline.date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  }]}>
                    {(() => {
                      const days = Math.ceil((new Date(nextDeadline.date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return days <= 0 ? t('countdown.overdue') :
                             days === 1 ? t('countdown.dayRemaining') :
                             t('countdown.daysRemainingCaps', { count: days });
                    })()}
                  </Text>
                </View>
              </View>

              {/* Bottom section with description */}
              <View style={styles.nextDeadlineBottom}>
                <Text style={styles.nextDeadlineDescription}>{nextDeadline.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineHeader}>{t('dashboard.timelineHeader')}</Text>
          {timelineItems.length > 0 ? (
            <>
              {/* Active Items */}
              {timelineItems.filter(item => !item.completed).map((item, index) => renderTimelineItem(item, index))}
              
              {/* Completed Items Section */}
              {timelineItems.filter(item => item.completed).length > 0 && (
                <View style={styles.completedSection}>
                  <TouchableOpacity
                    style={[styles.completedHeader, isRTLLayout && styles.completedHeaderRTL]}
                    onPress={() => setShowCompletedItems(!showCompletedItems)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.completedHeaderText}>
                      {t('dashboard.completedItems_plural', { count: timelineItems.filter(item => item.completed).length })}
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
                {t('dashboard.noTimelineData')}
              </Text>
              <Button
                title={t('dashboard.completeQuestionnaire')}
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
              title={t('dashboard.addAllToCalendar')}
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

  // Your Next Deadline Styles - Redesigned
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextDeadlineTop: {
    padding: 20,
    paddingBottom: 16,
  },
  nextDeadlineBottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 38, 38, 0.1)',
  },
  nextDeadlineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nextDeadlineLeft: {
    flex: 1,
    marginRight: 16,
  },
  nextDeadlineUrgencyBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nextDeadlineUrgencyText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  nextDeadlineTitle: {
    ...Typography.h4,
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  nextDeadlineDate: {
    ...Typography.body,
    color: '#7F1D1D',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextDeadlineLocation: {
    ...Typography.body,
    color: '#7F1D1D',
    fontSize: 14,
    fontWeight: '500',
  },
  nextDeadlineActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  nextDeadlineActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  nextDeadlineActionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  nextDeadlineCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    gap: 6,
  },
  nextDeadlineCalendarText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  nextDeadlineCountdown: {
    alignItems: 'center',
  },
  nextDeadlineCountdownText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  nextDeadlineDescription: {
    ...Typography.body,
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 20,
  },

  // Timeline Styles - Redesigned
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
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
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
    // No specific styling changes needed
  },

  // New Card Container Styles
  cardContainer: {
    flex: 1,
  },
  cardTopSection: {
    padding: 16,
    paddingBottom: 12,
  },
  cardBottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  urgencyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  dateLocationContainer: {
    marginTop: 8,
  },
  cardDateText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardLocationText: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cardTopActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  topActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  topActionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  calendarButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  iconButton: {
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
  iconButtonCompleted: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },

  // Unused styles removed to clean up stylesheet
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

  // Action buttons styles integrated into new card design

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

  // Control styles integrated into new iconButton design

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

  // RTL Layout Support
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerRightRTL: {
    flexDirection: 'row-reverse',
  },
  nextDeadlineHeaderRowRTL: {
    flexDirection: 'row-reverse',
  },
  cardHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  cardTopActionsRTL: {
    alignItems: 'flex-start',
  },
  bottomActionsRowRTL: {
    flexDirection: 'row-reverse',
  },
  completedHeaderRTL: {
    flexDirection: 'row-reverse',
  },
});

export default DashboardScreen;