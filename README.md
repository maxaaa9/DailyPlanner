Quick Overview
    We all know that when the new year is started we always have a plans for us, for example we always say:
        - This year i must reduce my weight and start to live more healthy and etc.

    Mainly idea of the app is to set your daily tasks to achieve your goals and not forget your yearly targets.
    Here we should started with a individual schedulers and internally notifications based on your scheduler time.

Setup Requirements
    For Expo Go(sandbox)
        Latest Version of Expo Go: SDK 55

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
