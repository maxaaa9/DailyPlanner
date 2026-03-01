import { TouchableOpacity, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
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
    const { isDark, toggleTheme } = useTheme();

    const handleProfilePress = () => {
        const themeLabel = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', themeLabel, 'Sign Out'], destructiveButtonIndex: 2, cancelButtonIndex: 0, title: 'Account Options' },
                (buttonIndex) => {
                    if (buttonIndex === 1) toggleTheme();
                    if (buttonIndex === 2) showSignOutConfirmation();
                }
            );
        } else {
            Alert.alert('Account Options', 'Choose an action', [
                { text: themeLabel, onPress: toggleTheme },
                { text: 'Sign Out', style: 'destructive', onPress: showSignOutConfirmation },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
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
