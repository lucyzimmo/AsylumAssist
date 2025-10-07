# AsylumAssist for Asylum

A React Native app built with Expo to help asylum seekers navigate the U.S. immigration process.

## Features

- **Onboarding Flow**: Collects user information to personalize the experience
- **Dashboard**: Overview of case status, urgent actions, and deadlines
- **Timeline Management**: Track important dates and milestones
- **Document Management**: Upload and organize case documents
- **Form Assistance**: Help with I-589 and other immigration forms
- **Resources**: Legal aid organizations and support resources
- **Emergency Contacts**: Quick access to crisis and legal support

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Installation

1. Navigate to the project directory:
   ```bash
   cd ZowyAsylumApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   expo start
   ```

4. Open the Expo Go app on your phone and scan the QR code to run the app.

## Project Structure

```
ZowyAsylumApp/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (Button, Input, Alert)
│   └── common/           # Common components (PlaceholderScreen)
├── constants/            # App constants
│   ├── Colors.ts         # Color palette
│   └── Typography.ts     # Typography styles
├── navigation/           # Navigation configuration
│   ├── RootNavigator.tsx # Root navigation container
│   ├── AuthNavigator.tsx # Authentication flow
│   └── MainNavigator.tsx # Main app navigation
├── screens/              # App screens
│   ├── main/            # Main app screens
│   │   └── DashboardScreen.tsx
│   └── onboarding/      # Onboarding flow screens
└── types/               # TypeScript type definitions
    └── navigation.ts    # Navigation types
```

## Navigation Flow

1. **Onboarding Flow** (AuthStack):
   - OnboardingStart → Welcome screen with app features
   - AsylumStatus → Basic asylum case information
   - ImmigrationStatus → Immigration court details
   - PersonalInformation → Optional personal details
   - ContactInformation → Contact preferences
   - BackgroundInformation → Background details
   - Review → Summary and completion

2. **Main App** (MainStack):
   - Dashboard → Case overview and quick actions
   - Timeline → Case progress and milestones
   - Documents → Document management
   - Resources → Legal aid and support
   - Profile → User account settings

## Key Features

### Dashboard
- Case overview with deadline countdown
- Quick access to urgent actions
- Document progress tracking
- Emergency contact information

### Onboarding
- Flexible flow that can be skipped at any point
- Collects information to personalize the user experience
- Privacy-focused with optional data collection

## Design System

### Colors
- **Primary**: #7CB342 (Green) - Trust, growth, help
- **Secondary**: #FFB74D (Amber) - Attention, important actions
- **Status Colors**: Success, Warning, Error, Info variants
- **Neutral**: White, background, border, text colors

### Typography
- Consistent text styles from h1 to caption
- Accessible font sizes and line heights
- Support for different font weights

## Development Status

This is the restored version of the Zowy for Asylum app with:
- ✅ Complete project structure
- ✅ Navigation system with proper TypeScript types
- ✅ Basic UI component library
- ✅ Onboarding flow (placeholder screens)
- ✅ Functional dashboard
- ✅ Design system (colors, typography)
- 🚧 Full form implementations (in progress)
- 🚧 Document management system (in progress)
- 🚧 Timeline system (in progress)

## Next Steps

1. Run the app to test basic functionality
2. Implement detailed onboarding forms with react-hook-form
3. Build out the document management system
4. Create the timeline and milestone tracking
5. Add form wizards for I-589 and other forms
6. Integrate real emergency contacts and resources

## Contributing

This app is designed to help asylum seekers navigate complex immigration processes. All features should prioritize:
- Accessibility and ease of use
- Privacy and security of sensitive information
- Multi-language support
- Offline functionality where possible
- Clear, helpful guidance without providing legal advice
