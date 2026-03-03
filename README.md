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
        - If you have fatal error, you must insert the API_GOOGLE_KEY for locations api at \android\app\src\main\AndroidManifest.xml set android:value="AIzaSyCfhhfp8XnfpaR7xlflV9iHrkKVpP8EJTI"/>

📅 Daily Planner – Functional Guide

🔐 Authentication & Security

-   Smart Login: Connect via email and password.

-   Note: Password recovery is currently Coming Soon.

-   Requirement: Use a valid email address and a strong password for better security.

-   Privacy First: Deleting tasks requires Fingerprint Authentication, ensuring your reminders are safe from accidental removal by others.

☁️ Data & Sync 

-   Real-time Database: Powered by Firebase Firestore. Your data stays synced across multiple devices instantly.

-   Cloud Profile: Your profile picture and appearance settings are saved to your account and shared across all connected devices.

-   Manual Sync: While auto-sync is active, you can manually refresh data using the Pull-to-Refresh gesture (swipe down and hold).

🛠 Core Functionality

-   Permissions: The app will request access to Camera, Location, and Notifications for full native functionality.

-   Advanced Scheduler:

-   Plan tasks for any day of the week.

-   Persistent Reminders: Local notifications will remind you every minute until you mark the task as "Started" in the Tasks tab.

-   Task Management: Update tasks by long-pressing them in the Scheduler tab.

-   Note: Once a task is marked with a tick in the Tasks tab, it is locked and cannot be removed.

🏠 Home & Analytics
-   Progress Tracking: View completed tasks and calculate your remaining Free Time between scheduled events.

-   Location Services: Displays your current location to eventually suggest the nearest fitness centers (Coming Soon).

-   Future Updates: Integration of "Sleep Time" to provide more accurate free-time calculations.
