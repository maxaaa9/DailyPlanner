import { TouchableOpacity, StyleSheet, Alert, Image, Modal, View, Text, Switch } from 'react-native';
import { signOut } from '../utils/authenticator';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';

const showSignOutConfirmation = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
};

export default function ProfileMenu() {
    const { isDark, colors, toggleTheme, resetToSystem } = useTheme();
    const [profilePic, setProfilePic] = useState(null);
    const [themeVisible, setThemeVisible] = useState(false);

    useEffect(() => {
        let firestoreUnsub = null;
        const authUnsub = onAuthStateChanged(auth, user => {
            if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
            if (!user) { setProfilePic(null); return; }
            firestoreUnsub = onSnapshot(doc(firestore, 'users', user.uid), snapshot => {
                setProfilePic(snapshot.data()?.profilePicture ?? null);
            });
        });
        return () => { authUnsub(); if (firestoreUnsub) firestoreUnsub(); };
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
            quality: 0.1,
            base64: true,
        });
        if (result.canceled) return;

        const { base64 } = result.assets[0];
        if (!base64) {
            Alert.alert('Error', 'Could not read image data. Please try again.');
            return;
        }

        const dataUri = `data:image/jpeg;base64,${base64}`;
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'Not signed in. Please restart the app.');
            return;
        }

        try {
            await setDoc(doc(firestore, 'users', user.uid), { profilePicture: dataUri }, { merge: true });
        } catch (e) {
            console.error('Profile picture save error:', e);
            Alert.alert('Save failed', e?.message ?? 'Could not save profile picture.');
        }
    };

    const handleProfilePress = () => {
        Alert.alert('Settings', 'Choose an action', [
            { text: 'Sign Out', style: 'destructive', onPress: showSignOutConfirmation },
            { text: 'Change Profile Picture', onPress: handleTakePhoto },
            { text: 'Theme', onPress: () => setThemeVisible(true) },
        ], { cancelable: true });
    };

    return (
        <>
            <TouchableOpacity style={styles.profileCircle} onPress={handleProfilePress}>
                {profilePic
                    ? <Image source={{ uri: profilePic }} style={styles.profileImage} />
                    : <Ionicons name="person" size={20} color="white" />
                }
            </TouchableOpacity>

            <Modal
                visible={themeVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setThemeVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => setThemeVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.themeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.themeTitle, { color: colors.text }]}>Theme</Text>

                        <View style={styles.themeRow}>
                            <Text style={[styles.themeLabel, { color: colors.text }]}>Dark Mode</Text>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="white"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => { resetToSystem(); setThemeVisible(false); }}
                            style={[styles.systemBtn, { borderColor: colors.border }]}
                        >
                            <Text style={{ color: colors.primary, fontSize: 14 }}>Use System Default</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeBox: {
        width: 280,
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 16,
    },
    themeTitle: { fontSize: 17, fontWeight: 'bold' },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    themeLabel: { fontSize: 15 },
    systemBtn: {
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
});
