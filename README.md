Download the .apk installation from here -> <a href="https://github.com/maxaaa9/DailyPlanner/releases/tag/Release">Click here!</a>

Quick Overview
    We all know that when the new year is started we always have a plans for us, for example we always say:
        - This year i must reduce my weight and start to live more healthy and etc.

    Mainly idea of the app is to set your daily tasks to achieve your goals and not forget your yearly targets.
    Here we should started with a individual schedulers and internally notifications based on your scheduler time.

Setup Requirements
    For Expo Go(sandbox)
        - Latest Version of Expo Go: SDK 55

        note: Using expo, local notifications will not worked!

    Out of the sandbox(Android requirements Local Development):

        1. Install dependencies: npm install
        2. For connected device with USB local run: npx expo run:android
        3. For building a .apk: npm run build:apk

        - Node.js -> 22.x+ (LTS) -> https://nodejs.org/en/download
        - Java version: 17 (latest version is not working properly with the native) -> https://www.oracle.com/java/technologies/javase/jdk17-0-13-later-archive-downloads.html
        - Android studio -> https://developer.android.com/studio
        - Android SDK Platform: Ensure you have the latest SDK (e.g., Android 15/16) and "Android SDK Build-Tools" installed via the SDK Manager in Android Studio.
        - Environment Variables: You must set ANDROID_HOME and add the platform-tools to your system path.
        - Android device must be connected with the usb cable (its recommended to use motherboards USB, USB at the front panels can not worked).
        - Device must be set in development mode -> https://www.youtube.com/shorts/Nr0aJojqSJQ
        - Wireguard can lead to issues with the run, deactivate it.
        - If you have an issues with the SDK location, open terminal as administrator and run -> [System.Environment]::SetEnvironmentVariable("ANDROID_HOME",                      "C:\Users\INSERT_YOU_USER_HERE\AppData\Local\Android\Sdk", "User").
        - If you have fatal error, you must insert the API_GOOGLE_KEY for locations api at \android\app\src\main\AndroidManifest.xml set android:value="AIzaSyCfhhfp8XnfpaR7xlflV9iHrkKVpP8EJTI"/>. If you cant set Android manifest, replace it with the ready one from folder scripts!

📅 DailyPlanner – Functional Guide
📌 Project Overview

    Application Name: DailyPlanner
    Category: Productivity
    
    Main Purpose:
        DailyPlanner is a personal productivity application that allows users to schedule recurring weekly tasks organised by day. The app provides a daily overview, tracks task completion, sends push notifications as reminders, and displays nearby fitness locations on a live map to promote healthy habits alongside structured planning.

🔐 User Access & Permissions
👤 Guest (Not Authenticated)

    Only AuthScreen is accessible.
    No data or app features are available without signing in.
    
    Available actions:
    
    Sign In
    
    Register (toggle between forms on the same screen)

👤 Authenticated User
📂 Main Tabs

    Home – Daily dashboard with:
    
    Task statistics (total, completed, free time)
    
    Current location label
    
    Live map of nearby gyms
    
    Tasks – Today’s scheduled tasks:
    
    Tick-off completion mechanism
    
    Notification integration
    
    Scheduler – Weekly schedule management

📄 Detail Screens
    
    DayDetailScreen – Lists all tasks for a selected weekday
    (Accessible from Scheduler tab)
    
    ✏️ Create / Edit / Delete Actions
    
    Create new task (FAB button)
    
    Edit task (long-press → pre-filled modal)
    
    Delete task (trash icon → biometric confirmation if available)
    
    Change profile picture (camera access)
    
    Toggle Dark / Light / System theme
    
    Sign out

🔑 Authentication & Session Handling
    Authentication Flow
    
    App starts → App.js renders loading spinner
    
    Firebase onAuthStateChanged initializes
    
    Firebase checks persisted token
    
    setLoading(false) called
    
    If no session → AuthScreen shown
    
    If login/register successful → main app renders
    
    Sign In
    
    Email validation
    
    signInWithEmailAndPassword
    
    Register
    
    Email + password strength validation
    
    createUserWithEmailAndPassword
    
    Logout
    
    Profile → Sign Out
    
    Confirmation alert
    
    Firebase session cleared
    
    onAuthStateChanged triggers
    
    AuthScreen displayed

🔁 Session Persistence

    Firebase Auth persists user token using AsyncStorage.
    On app restart, session is automatically restored.

🧭 Navigation Structure
    Root Navigation Logic
    
    Navigation is state-based in App.js:
    
    signedIn === false → AuthScreen
    signedIn === true  → NavigationContainer (Tabs)
    Main Navigation Type
    
    MaterialTopTabNavigator (rendered at bottom)
    
    Tabs:
    
    Home
    
    Tasks
    
    Scheduler
    
    Features:
    
    Icons + labels
    
    Custom header with tab name + profile menu
    
    Swipe navigation enabled

🔄 Nested Navigation

    Scheduler tab contains a NativeStackNavigator:
    
    DayListScreen (default)
    
    DayDetailScreen

📋 List → Details Flow
📅 DayListScreen

    Displays 7 weekdays (Mon–Sun)
    
    Shows:
    
    Short day name
    
    Full day name
    
    Task count badge
    
    Real-time Firestore listener (onSnapshot)
    
    Pull-to-refresh via getDocsFromServer
    
    🗂 DayDetailScreen
    
    Receives selected day via route.params
    
    Filters tasks by weekday
    
    Sorted by startTime
    
    Full CRUD functionality
    
    ☁️ Backend & Data Source
    Backend Type
    
    Firebase
    
    Firebase Authentication
    
    Firebase Firestore
    
    Firestore Paths
    Tasks: users/{uid}/scheduleTasks
    Profile: users/{uid}

🔄 CRUD Operations
📥 Read

    onSnapshot (real-time listener)
    
    Sorted lists or aggregated counts
    
    Pull-to-refresh bypasses cache
    
    Profile picture via onSnapshot
    
    ➕ Create
    
    addDoc()
    
    Saves:
    
    day
    
    title
    
    startTime
    
    endTime
    
    notificationId
    
    notificationsEnabled
    
    Notification scheduled before saving.

🔁 Update

    updateDoc()
    
    Cancels previous notification
    
    Schedules new one if enabled

❌ Delete

    Biometric authentication (if available)
    
    deleteDoc()
    
    Cancels notifications
    
    Removes task IDs from AsyncStorage
    
    UI auto-updates via onSnapshot.

📝 Forms & Validation
    AuthScreen Validation
    Email
    
    Regex:
    
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    Error:
    Please enter a valid email address.
    
    Password Rules
    
    Min 8 characters
    
    1 uppercase
    
    1 lowercase
    
    1 number
    
    Task Validation
    Title
    
    Cannot be empty
    
    Time Format
    
    Regex:
    
    ^([01]\d|2[0-3]):([0-5]\d)$
    
    End time must be after start time

📱 Native Device Features

    Feature	Library
    Location & Maps	expo-location, react-native-maps
    Camera	expo-image-picker
    Biometrics	expo-local-authentication
    Notifications	expo-notifications
    

📍 Location & Maps (HomeScreen)

    Requests foreground permission
    
    Reverse geocoding for readable address
    
    Google Places API (gyms within 2km)
    
    Nearest gym highlighted
    
    📷 Camera (ProfileMenu)
    
    Opens native camera
    
    1:1 cropping
    
    Saves base64 image to Firestore

🔐 Biometrics (Delete Task)

    Checks hardware + enrollment
    
    Face ID / Fingerprint prompt
    
    If unavailable → standard confirmation

🔔 Push Notifications

    Task start notification
    
    Active window reminders
    
    Cancelled on completion or delete
    
    IDs persisted in AsyncStorage

🚀 Typical User Flow
    
    First Launch
    
    Loading spinner
    
    No session → AuthScreen
    
    Registration
    
    Switch to Register
    
    Enter valid email + strong password
    
    Auto-login after success
    
    Home Tab
    
    Greeting + today’s stats
    
    Location label
    
    Gym map markers
    
    Add Task
    
    Scheduler → Select day → FAB →
    Add title + time → Enable notifications → Save
    
    Complete Task
    
    Tasks tab → Tap circle →
    Marked done → Notifications cancelled
    
    Edit Task
    
    Long press → Modify → Update
    
    Delete Task
    
    Trash → Biometric → Confirm → Removed
    
    Profile & Theme
    
    Profile → Toggle dark/light/system
    
    Sign Out
    
    Profile → Sign Out → Confirm → AuthScreen

⚠️ Error & Edge Case Handling

    Authentication Errors
    
    Invalid email
    
    Wrong credentials
    
    Email already in use
    
    Password rule violations
    
    Red error banner (#F44336) auto-dismisses after 3 seconds.
    
    Data / Network Errors
    
    Firestore failure → error message + pull-to-refresh
    
    Location denied → placeholder shown
    
    Google Places failure → empty markers
    
    Camera denied → alert
    
    Biometric failure → silent abort
    
    Empty States
    
    No tasks today → centered message
    
    No tasks for selected day → centered message
    
    Zero-task days → no badge
    
    No profile picture → default icon
    
    Old AsyncStorage task completion → discarded automatically

🏁 Conclusion

    DailyPlanner combines structured weekly scheduling, real-time task tracking, push notifications, biometric security, and location-based fitness suggestions into a fully functional productivity application powered by Firebase.
