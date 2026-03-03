Quick Overview
    We all know that when the new year is started we always have a plans for us, for example we always say:
        - This year i must reduce my weight and start to live more healthy and etc.

    Mainly idea of the app is to set your daily tasks to achieve your goals and not forget your yearly targets.
    Here we should started with a individual schedulers and internally notifications based on your scheduler time.

Setup Requirements
    For Expo Go(sandbox)
        - Latest Version of Expo Go: SDK 55

        note: Using expo, local notifications will not worked!

    Out of the sandbox(Android requirements Local Development): npx expo run:android
        - Node.js -> 22.x+ (LTS) -> https://nodejs.org/en/download
        - Java version: 17 (latest version is not working properly with the native) -> https://www.oracle.com/java/technologies/javase/jdk17-0-13-later-archive-downloads.html
        - Android studio -> https://developer.android.com/studio
        - Android SDK Platform: Ensure you have the latest SDK (e.g., Android 15/16) and "Android SDK Build-Tools" installed via the SDK Manager in Android Studio.
        - Environment Variables: You must set ANDROID_HOME and add the platform-tools to your system path.
        - Android device must be connected with the usb cable (its recommended to use motherboards USB, USB at the front panels can not worked).
        - Device must be set in development mode -> https://www.youtube.com/shorts/Nr0aJojqSJQ
        - Wireguard can lead to issues with the run, deactivate it.
        - If you have an issues with the SDK location, open terminal as administrator and run -> [System.Environment]::SetEnvironmentVariable("ANDROID_HOME",                      "C:\Users\INSERT_YOU_USER_HERE\AppData\Local\Android\Sdk", "User").

Functional guide:
    -   Connection can be done with email and password (forbidden password can not be restored: Comming soon), only real email address and strong password will pass.
    -   Every account is working with realtime database (Firestore), with your account you can use multiple devices.
    -   Application will request permissions for native functionality, Camera, Location and Notifications.
    -   Scheduler tab is showing you every day of the week, when you click on the following day, you can plan your daily tasks, this tasks are connected with the local         notification and will remind you every minute untill you are not entered the app and mark this task as started with the following tick in Tasks tab(once you mark this task cannot be removed).
    -   Scheduler tasks are refreshing to all devices automaticaly, also you can refresh them manually by slide from top to bottom and hold for a second.
    -   You can update your tasks by holding on them at the scheduler tab (not in Task tab).
    -   Removing of any task from your scheduler is possible only from the owner of the device, it will require fingerprint, soo no one can delete your reminders by mistake.
    -   From the profile picture you can manage your application appearence, and your profile picture (This picture is saved at your account and is shared to all connected devices).
    -   In the Home tab you can check your daily tasks, how many of them are completed, and how many is your daily free time between the tasks. (In future will be added sleep time which will not be included in your free time counter). At the bottom is added your location the idea of this is to marked you the nearest fitness center (will be added in future.)
