export const Typography = {
  // Headings (Government Accessibility Standards)
  h1: {
    fontSize: 32,           // Large titles for key screens
    fontWeight: '700' as const,
    lineHeight: 40,         // 1.25x line height for readability
    letterSpacing: -0.5,    // Slight negative spacing for large text
  },
  h2: {
    fontSize: 28,           // Section headers
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,           // Subsection headers
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,           // Card titles, form sections
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,           // Minor headings
    fontWeight: '500' as const,
    lineHeight: 26,
  },
  
  // Body Text (Minimum 16px for Government Accessibility)
  body: {
    fontSize: 16,           // Standard body text (government minimum)
    fontWeight: '400' as const,
    lineHeight: 24,         // 1.5x line height for optimal readability
  },
  bodyLarge: {
    fontSize: 18,           // Important body text
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 16,           // Never go below 16px for main content
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  
  // Secondary Text (Still Accessible)
  caption: {
    fontSize: 14,           // Helper text, metadata
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,           // Only for very minor labels
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  
  // Button Text (Touch Target Optimized)
  button: {
    fontSize: 16,           // Primary button text
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.25,    // Slightly spaced for emphasis
  },
  buttonLarge: {
    fontSize: 18,           // CTA buttons
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontSize: 16,           // Secondary buttons (never smaller)
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  
  // Form Elements (Accessibility Focused)
  label: {
    fontSize: 16,           // Form labels must be readable
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  input: {
    fontSize: 16,           // Input text (prevents zoom on iOS)
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  placeholder: {
    fontSize: 16,           // Placeholder text
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  
  // Status and Feedback Text
  error: {
    fontSize: 14,           // Error messages
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  success: {
    fontSize: 14,           // Success messages
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  
  // Navigation
  tabLabel: {
    fontSize: 12,           // Tab labels can be smaller
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  navigationTitle: {
    fontSize: 18,           // Navigation header titles
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};