import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthResult {
  success: boolean;
  error?: string;
}

// Test credentials for local login only
export const TEST_USER_EMAIL = 'test@zowy.app';
export const TEST_USER_PASSWORD = 'Zowy1234!';

const AUTH_TOKEN_KEY = 'zowy_auth_token';

export const AuthService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isValid =
      email.trim().toLowerCase() === TEST_USER_EMAIL && password === TEST_USER_PASSWORD;

    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
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
};

export default AuthService;


