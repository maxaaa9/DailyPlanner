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

Functional Guide

1. Project Overview
    Application Name: DailyPlanner
    
    Application Category / Topic: Productivity
    
    Main Purpose:
    DailyPlanner is a personal productivity app that allows users to schedule recurring weekly tasks organised by day. The app gives users a daily overview of their schedule, tracks task completion, and sends push notifications as reminders. It also shows nearby fitness locations on a map to encourage healthy habits alongside structured planning.

2. User Access & Permissions
    Guest (Not Authenticated)
    Only the AuthScreen is accessible.
    No data, screens, or features are available without signing in.
    Available actions: Sign In, Register (toggle between both forms on the same screen).
    Authenticated User
    Main sections / tabs:
    
    Home – Daily dashboard: task stats (total, completed, free time), current location label, and a live map of nearby gyms.
    Tasks – Today's scheduled tasks with a tick-off completion mechanism and notification integration.
    Scheduler – Weekly schedule management.
    Detail screens:
    
    DayDetailScreen – Lists all tasks for a selected weekday; accessible from the Scheduler tab.
    Create / Edit / Delete actions:
    
    Create a new task for any weekday (via FAB in DayDetailScreen).
    Edit an existing task via long-press (opens pre-filled modal).
    Delete a task via the trash icon (requires biometric confirmation if available).
    Change profile picture via camera.
    Toggle dark/light theme or reset to system default.

3. Authentication & Session Handling
    Authentication Flow
    App starts → App.js renders a loading spinner while Firebase's onAuthStateChanged listener initialises.
    Auth status check → Firebase SDK automatically checks for a persisted token. setLoading(false) is called once the result is known.
    No active session → AuthScreen is rendered. The user can switch between Sign In and Register using a toggle link.
    Sign In: validates email format, calls signIn() (Firebase signInWithEmailAndPassword). On success, onAuthSuccess() sets signedIn = true and the main app renders.
    Register: validates email format + password strength rules, calls createAccount() (Firebase createUserWithEmailAndPassword). On success, transitions immediately to the main app.
    Successful login/registration → signedIn state becomes true, the NavigationContainer with the three-tab layout is rendered.
    Logout → User taps profile icon → "Sign Out" → confirmation alert → signOut() clears the Firebase session → onAuthStateChanged fires → signedIn becomes false → AuthScreen is shown again.
    Session Persistence
    Firebase Auth SDK internally persists the user token using AsyncStorage (React Native default persistence).
    On app restart, onAuthStateChanged fires automatically with the stored user, bypassing the login screen without any manual re-login.

4. Navigation Structure
    Root Navigation Logic
    Navigation is split at the state level in App.js, not via a navigator.
    If signedIn === false → renders <AuthScreen /> (no NavigationContainer).
    If signedIn === true → renders a <NavigationContainer> with the full tab layout.
    Main Navigation
    Type: MaterialTopTabNavigator (tabs rendered at the bottom of the screen, tabBarPosition="bottom").

    3 tabs: Home, Tasks, Scheduler — each with an icon and label.
    A custom header bar above the tab navigator shows the current tab name and the profile menu button.
    Swipe navigation between tabs is enabled.
    Nested Navigation
    Yes. The Scheduler tab contains a nested NativeStackNavigator:
    DayListScreen (default screen) — list of 7 weekdays with task counts.
    DayDetailScreen — tasks for the selected day, full CRUD, custom back-button header.

5. List → Details Flow
    List / Overview Screen — DayListScreen
    Displays the 7 days of the week (Mon–Sun) as a vertical list using FlatList.
    Each row shows: short day name (highlighted if today), full day name, and a badge with the task count for that day.
    Data is fetched from Firestore in real-time via onSnapshot. Pull-to-refresh forces a server fetch via getDocsFromServer.
    The user taps a row to navigate to the detail screen.
    Details Screen — DayDetailScreen
    Navigation is triggered via navigation.navigate('DayDetail', { day: item }) from DayListScreen.
    The day string (e.g. "Mon") is received via route.params.day and used to filter tasks from Firestore.
    Displays tasks for that day sorted by start time; supports add, edit, and delete in the same screen.
    
6. Data Source & Backend
    Backend Type: Real backend — Firebase
    
    Firebase Authentication for email/password sign-in and registration.
    Firebase Firestore for storing all task and profile data.
    Collection path for tasks: users/{uid}/scheduleTasks
    Document path for profile: users/{uid}
   
8. Data Operations (CRUD)
    Read (GET)
    Tasks are fetched from Firestore using onSnapshot (real-time listener) in HomeScreen, TasksScreen, DayListScreen, and DayDetailScreen.
    Displayed as sorted lists (startTime ascending) or aggregated as counts per day.
    Pull-to-refresh in DayListScreen and DayDetailScreen uses getDocsFromServer to bypass the cache.
    Profile picture is read via onSnapshot on the user document in ProfileMenu.
    Create (POST)
    In DayDetailScreen, tapping the FAB (floating + button) opens a modal form.
    On submit, addDoc writes a new document to users/{uid}/scheduleTasks containing { day, title, startTime, endTime, notificationId, notificationsEnabled }.
    If notifications are enabled, a notification is scheduled before the document is saved and its ID is stored in the document.
    Update / Delete (Mutation)
    Update: Long-pressing a task row opens the same modal pre-filled with the task's data. On save, updateDoc patches the Firestore document. The existing notification is cancelled and a new one is optionally scheduled.
    Delete: The trash icon triggers biometric authentication (if hardware and enrollment are available). On success, an Alert confirmation is shown. Confirmed deletion calls deleteDoc, cancels all associated notifications, and removes the task IDs from AsyncStorage.
    UI update: Both operations are reflected immediately due to the active onSnapshot listener, which re-renders the list automatically.
   
10. Forms & Validation
    Forms Used
    AuthScreen — Sign In / Register form
    DayDetailScreen modal — Add / Edit Task form
    Validation Rules
    Email (AuthScreen):
    
    Must match the pattern /^[^\s@]+@[^\s@]+\.[^\s@]+$/.
    Error: "Please enter a valid email address."
    Password (AuthScreen, registration only — multiple rules):
    
    Minimum 8 characters → "Password must be at least 8 characters."
    Must contain at least one uppercase letter → "Password must contain at least one uppercase letter."
    Must contain at least one lowercase letter → "Password must contain at least one lowercase letter."
    Must contain at least one number → "Password must contain at least one number."
    Task Title (DayDetailScreen):
    
    Must not be empty (.trim() check).
    Error: "Please enter a task title."
    Start Time / End Time (DayDetailScreen):
    
    Must match the format HH:MM via regex /^([01]\d|2[0-3]):([0-5]\d)$/.
    End time must be strictly after start time (startTime >= endTime check).
    Errors: "Please select a start/end time." / "End time must be after start time."
   
11. Native Device Features
    Used Native Features
    Feature	Library
    Location & Maps	expo-location, react-native-maps
    Camera / Image Picker	expo-image-picker
    Biometrics	expo-local-authentication
    Push Notifications	expo-notifications
    Usage Descriptions
    Location & Maps (HomeScreen):
    On load, the app requests foreground location permission. If granted, it retrieves the current GPS coordinates and performs reverse geocoding to display a readable address label. The coordinates are then used to query the Google Places API for gyms within 2 km. All results are displayed as map markers on a MapView, with the nearest gym highlighted in green and shown in an info card above the map.
    
    Camera / Image Picker (ProfileMenu):
    The user accesses the camera by tapping the profile avatar in the header and selecting "Change Profile Picture". expo-image-picker opens the native camera (launchCameraAsync), allows 1:1 cropping, and encodes the result as a base64 JPEG string. The image is then saved as a data URI to the Firestore user document and displayed in the profile circle.
    
    Biometrics (DayDetailScreen):
    When a user taps the delete icon on a task, the app checks for biometric hardware (hasHardwareAsync) and enrolled biometrics (isEnrolledAsync). If both are present, authenticateAsync is called to prompt the user with Face ID / fingerprint before the delete alert is shown. If biometrics are unavailable, the delete proceeds directly to the confirmation alert.
    
    Push Notifications (TasksScreen, DayDetailScreen):
    When tasks are created or updated, expo-notifications schedules local notifications. Two types are used: a "task starting" notification at the task's start time, and "active window" reminder notifications during the task's duration. When a task is marked as done or deleted, its pending notifications are cancelled by ID. Notification IDs are persisted in AsyncStorage keyed by date so they survive app restarts.

12. Typical User Flow
    First launch: User opens the app → loading spinner appears while Firebase checks for an existing session → no session found → AuthScreen is shown with a wallpaper image and Sign In form.
    Registration: User taps "Don't have an account? Sign up." → switches to Register mode → enters email and a password meeting all strength rules → taps Register → account is created in Firebase → transitions directly to the main app.
    Home tab: User sees a greeting with today's day name, three stat cards (tasks today, completed count, free time between tasks), their current location label, and a map with nearby gym markers. Tapping a marker updates the info card with the gym's name, address, and rating.
    Scheduler tab → Add task: User taps the Scheduler tab → sees the 7-day list → taps "Tuesday" → arrives at DayDetailScreen → taps the blue FAB → fills in task title "Morning Workout", picks 07:00 start and 08:00 end via the time picker → enables notifications → taps "Add" → task appears immediately in the list, a notification is scheduled.
    Tasks tab: User switches to the Tasks tab → sees today's scheduled tasks in chronological order → taps the circle icon next to a completed task → it is marked done (greyed out) → its pending notifications are cancelled and completion is saved to AsyncStorage.
    Edit task: User returns to Scheduler → long-presses a task → modal pre-fills with existing data → edits the title → taps "Update" → Firestore is updated, old notification is replaced.
    Delete task: User taps the trash icon → Face ID prompt appears → authenticates → confirmation alert → taps "Delete" → task removed from Firestore and list, notifications cancelled.
    Profile & theme: User taps the profile circle in the header → selects "Theme" → toggles dark mode on → UI updates immediately across all screens → selects "Use System Default" to reset.
    Sign out: User taps profile circle → selects "Sign Out" → confirmation alert → confirms → Firebase session cleared → AuthScreen shown.

13. Error & Edge Case Handling
    Authentication errors:

    Invalid email format: inline red error banner (#F44336) shown below the email field with the message. The banner auto-dismisses after 3 seconds via a setTimeout ref.
    Wrong credentials on sign in: "Wrong credentials, please try again." shown in the same error banner.
    Email already in use on register: "This email is already in use, please try another one."
    Password rule violations: specific per-rule message is shown before any network call is made.
    Network or data errors:

    Firestore onSnapshot failure in DayListScreen and DayDetailScreen: error state is set and a message is displayed ("Failed to load schedule / tasks. Pull down to retry."). The user can trigger a manual getDocsFromServer refresh via pull-to-refresh.
    Location permission denied: locationLabel is set to "Location permission denied" and the map placeholder is shown instead of the live map.
    Google Places API failure: caught silently, fitnessPlaces remains an empty array and no markers are rendered.
    Camera permission denied: Alert.alert('Permission denied', ...) informs the user that camera access is required.
    Profile picture save failure: Alert.alert('Save failed', e?.message) shows the Firebase error message.
    Biometric auth failure / cancelled: delete flow is aborted silently with no UI change.
    Empty or missing data states:
    
    TasksScreen with no tasks today: centred text "No tasks scheduled for [Day]" shown via ListEmptyComponent.
    DayDetailScreen with no tasks for the selected day: centred text "No tasks for [Day]".
    DayListScreen shows zero-task days with no badge (badge only renders when taskCounts[day] > 0).
    HomeScreen with no tasks: free-time card shows "—" and sub-label "no tasks today".
    Profile picture not set: profile circle shows a default person icon instead of an image.
    doneTasks in AsyncStorage from a previous date: automatically discarded by comparing the stored date string to today's date string before restoring state.
