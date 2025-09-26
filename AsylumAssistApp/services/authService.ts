import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthResult {
  success: boolean;
  error?: string;
}

// Test credentials for local login only
export const TEST_USERNAME = 'testuser';
export const TEST_USER_PASSWORD = 'AsylumAssist1234!';

const AUTH_TOKEN_KEY = 'asylumassist_auth_token';
const GUEST_SESSION_KEY = 'asylumassist_guest_session';

// Keys that should be cleared for guest sessions AND new account sessions
const GUEST_DATA_KEYS = [
  '@asylumassist_asylum_timeline',
  '@asylumassist_onboarding_data',
  '@asylumassist_questionnaire_data',
  '@asylumassist_documents',
  '@asylumassist_user_preferences',
  '@asylumassist_timeline_completed_steps',
  '@asylumassist_form_drafts',
  GUEST_SESSION_KEY
];

export const AuthService = {
  async signIn(username: string, password: string): Promise<AuthResult> {
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isValid =
      username.trim().toLowerCase() === TEST_USERNAME && password === TEST_USER_PASSWORD;

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'TEST_TOKEN');
    return { success: true };
  },

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  async startGuestSession(): Promise<void> {
    // Clear all guest data from previous sessions
    await this.clearGuestData();
    
    // Set guest session flag with timestamp
    const guestSession = {
      startTime: new Date().toISOString(),
      sessionId: Math.random().toString(36).substr(2, 9)
    };
    
    await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestSession));
  },

  async clearGuestData(): Promise<void> {
    try {
      // Remove all guest-related data keys
      await AsyncStorage.multiRemove(GUEST_DATA_KEYS);
      console.log('Guest data cleared successfully');
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  },

  async isGuestSession(): Promise<boolean> {
    const guestSession = await AsyncStorage.getItem(GUEST_SESSION_KEY);
    return !!guestSession;
  },

  async getGuestSessionInfo(): Promise<{ startTime: string; sessionId: string } | null> {
    try {
      const guestSession = await AsyncStorage.getItem(GUEST_SESSION_KEY);
      return guestSession ? JSON.parse(guestSession) : null;
    } catch {
      return null;
    }
  },

  async endGuestSession(): Promise<void> {
    await this.clearGuestData();
  },

  async clearNewAccountData(): Promise<void> {
    try {
      // Clear all existing data when creating a new account
      await AsyncStorage.multiRemove(GUEST_DATA_KEYS);
      console.log('New account data cleared - starting fresh');
    } catch (error) {
      console.error('Failed to clear new account data:', error);
    }
  }
};

export default AuthService;


