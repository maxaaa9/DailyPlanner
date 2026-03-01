import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from '../utils/authenticator';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const showSignOutConfirmation = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
};

export default function ProfileMenu() {
    const { isDark, toggleTheme, resetToSystem } = useTheme();

    const handleProfilePress = () => {
        const themeLabel = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            Alert.alert('Settings', 'Choose an action', [
                { text: 'Sign Out', style: 'destructive', onPress: showSignOutConfirmation },
                { text: 'System Theme', onPress: resetToSystem },
                { text: themeLabel, onPress: toggleTheme },
            ],
            { cancelable: true }
          );
    };

    return (
        <TouchableOpacity style={styles.profileCircle} onPress={handleProfilePress}>
            <Ionicons name="person" size={20} color="white" />
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
    },
});
