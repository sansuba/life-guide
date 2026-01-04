# Life Guide

A comprehensive mobile and web app for organizing your life through bookmarks, notes, and roadmap milestones. Built with React Native and Expo for seamless cross-platform experience.

## Features

### 📱 **Authentication**
- Username/password login system with per-user data isolation
- Optional biometric authentication (fingerprint/face recognition)
- Automatic session management
- Secure local storage with AsyncStorage

### 📚 **Bookmarks (Links)**
- Save and organize web links with titles and descriptions
- Full-text search across bookmarks, URLs, and descriptions
- Long-tap context menu to hide/unhide bookmarks
- Show/hide hidden bookmarks with eye icon toggle
- One-tap access to open links in embedded web viewer
- Delete bookmarks with confirmation

### 📝 **Notes**
- Create, edit, and delete personal notes
- Attach images from device gallery
- Search notes by title or content
- Share notes with other apps
- **Share Extension:** Share text and images from any app directly to create notes
- Persistent per-user storage

### 🛣️ **Roadmap**
- Create milestone-based goals with 5 categories:
  - Personal Development
  - Career
  - Health & Fitness
  - Learning
  - Entertainment
- Set target dates and times with date/time pickers
- Organize goals into milestones
- Track progress visually
- Delete completed or unwanted goals

### 🌐 **Web Viewer**
- View web content directly in-app
- Embedded iframe support for web platform
- Native WebView for mobile (iOS/Android)
- Auto-navigate back after 10 seconds of inactivity
- Pause timer when app goes to background
- Resume timer when returning to foreground

### 🌙 **Dark Mode**
- System-aware light/dark theme support
- Consistent design across all screens
- Smooth transitions between themes

## Getting Started

### Prerequisites
- Node.js and pnpm/npm
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS)

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Start Development Server

```bash
pnpm start
# or
npm start
```

Choose your platform:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app for mobile testing

### 3. Build for Production

**Android APK:**
```bash
eas build --platform android --local
```

**iOS:**
```bash
eas build --platform ios --local
```

**Web:**
```bash
expo export --platform web
```

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx      # Tab navigation layout
│   ├── index.tsx        # Home/Dashboard
│   ├── links.tsx        # Bookmarks screen
│   ├── roadmap.tsx      # Roadmap/Goals screen
│   └── ...notes.tsx     # Notes management
├── login.tsx            # Login screen
├── compose-link.tsx     # Add bookmark
├── compose-note.tsx     # Add note
├── compose-roadmap.tsx  # Add milestone
├── webview.tsx          # Web viewer
└── _layout.tsx          # Root navigation

components/
├── ui/
│   ├── Button.tsx       # Reusable button
│   ├── FAB.tsx          # Floating action button
│   └── Input.tsx        # Text input field

contexts/
├── AuthContext.tsx      # Authentication state
├── LinksContext.tsx     # Bookmarks state
├── NotesContext.tsx     # Notes state
└── RoadmapContext.tsx   # Roadmap state

hooks/
├── useAuth.tsx          # Auth utilities
├── useLinks.tsx         # Bookmarks utilities
├── useNotes.tsx         # Notes utilities
├── useRoadmap.tsx       # Roadmap utilities
└── useColorScheme.ts    # Theme utilities

template/
├── auth/                # Authentication templates (Mock & Supabase)
├── core/                # Core configuration
└── ui/                  # UI templates
```

## Key Technologies

- **Framework**: React Native with Expo (v53.0.12)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage (local persistence)
- **Authentication**: Local username/password + Biometric
- **UI**: React Native components with custom theme
- **Icons**: Ionicons
- **Images**: expo-image-picker
- **Dates**: @react-native-community/datetimepicker
- **Web Viewer**: react-native-webview (native) + iframe (web)

## Usage Guide

### Login
1. Open the app
2. Enter a username and password
3. Optional: Enable biometric login on subsequent visits
4. All data is stored per-user

### Managing Bookmarks
1. **View**: Tap Bookmarks tab
2. **Add**: Tap + button → Enter URL, title, optional description
3. **Open**: Tap a bookmark to view in embedded web viewer
4. **Hide**: Long-tap bookmark → Select "Hide"
5. **Show Hidden**: Tap eye icon in header → View hidden bookmarks
6. **Unhide**: Long-tap hidden bookmark → Select "Unhide"
7. **Delete**: Long-tap → Select "Delete" → Confirm
8. **Search**: Use search bar to filter bookmarks

### Managing Notes
1. **View**: Tap Notes tab
2. **Add**: Tap + button → Enter title and content
3. **Attach Image**: Tap camera icon → Select from gallery
4. **Share**: Tap share icon → Choose sharing app
5. **Delete**: Swipe or tap delete → Confirm
6. **Search**: Use search bar to find notes

### Creating Roadmap Goals
1. **View**: Tap Roadmap tab
2. **Add**: Tap + button → Enter goal details
3. **Select Category**: Choose from 5 categories
4. **Set Date**: Use date/time picker for target date
5. **Save**: Confirm to create milestone
6. **Delete**: Swipe or tap delete → Confirm
7. **Track**: View all milestones organized by category

### Web Viewer
- When you open a bookmark link, it displays in the app's web viewer
- You have 10 seconds of inactivity before auto-returning to bookmarks
- Interact with the page (scroll, tap) to reset the timer
- Timer pauses when app goes to background
- On web: Uses embedded iframe for viewing

### Logout
- Tap Logout in action bar
- Confirms before logging out
- All data remains saved for next login

## Configuration

### Theme
Edit `constants/theme.ts` to customize colors, spacing, and typography.

### App Settings
- Biometric timeout: 10 seconds (configurable in webview.tsx)
- Storage keys: Username-based isolation in AsyncStorage

## Development

### Adding a New Feature
1. Create context in `contexts/` if needed for state
2. Create hook in `hooks/` for utilities
3. Create UI screen in `app/`
4. Add navigation routing in `app/_layout.tsx`

### Testing
- Use Expo Go for quick testing on devices
- Use emulators for consistent testing
- Web platform for quick browser testing

## Known Limitations
- Web platform doesn't support biometric authentication
- Some third-party websites may not work well in iframe (CORS, iframe restrictions)
- Images are stored as base64 in AsyncStorage (consider cloud storage for large images)

## Future Enhancements
- Cloud sync with Supabase
- Offline-first architecture
- Rich text editor for notes
- Bookmark categories/tags
- Goal notifications and reminders
- Data export/import
- Advanced search filters

## License

MIT

## Support

For issues or feature requests, please create an issue in the project repository.
