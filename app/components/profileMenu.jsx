import { TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { signOut } from '../utils/authenticator';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';

const showSignOutConfirmation = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
};

export default function ProfileMenu() {
    const { isDark, toggleTheme, resetToSystem } = useTheme();
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;
        getDoc(doc(firestore, 'users', user.uid)).then(snapshot => {
            if (snapshot.exists()) setProfilePic(snapshot.data()?.profilePicture ?? null);
        });
    }, []);

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Camera access is required to set a profile picture.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
            base64: true,
        });
        if (result.canceled) return;

        const { base64 } = result.assets[0];
        const dataUri = `data:image/jpeg;base64,${base64}`;
        const user = auth.currentUser;

        try {
            await setDoc(doc(firestore, 'users', user.uid), { profilePicture: dataUri }, { merge: true });
            setProfilePic(dataUri);
        } catch (e) {
            console.error('Profile picture save error:', e);
            Alert.alert('Save failed', e?.message ?? 'Could not save profile picture.');
        }
    };

    const handleThemePress = () => {
        const themeLabel = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        Alert.alert('Theme', 'Choose a theme', [
            { text: themeLabel, onPress: toggleTheme },
            { text: 'System Default', onPress: resetToSystem },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleProfilePress = () => {
        Alert.alert('Settings', 'Choose an action', [
            { text: 'Change Profile Picture', onPress: handleTakePhoto },
            { text: 'Theme', onPress: handleThemePress },
            { text: 'Sign Out', style: 'destructive', onPress: showSignOutConfirmation },
        ],
        { cancelable: true });
    };

    return (
        <TouchableOpacity style={styles.profileCircle} onPress={handleProfilePress}>
            {profilePic
                ? <Image source={{ uri: profilePic }} style={styles.profileImage} />
                : <Ionicons name="person" size={20} color="white" />
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    profileCircle: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: '#535353',
        borderColor: '#c5b1b1',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        overflow: 'hidden',
    },
    profileImage: {
        width: 35,
        height: 35,
        borderRadius: 18,
    },
});
