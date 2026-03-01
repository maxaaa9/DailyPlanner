import { TouchableOpacity, StyleSheet, Alert, ActionSheetIOS, Platform, View } from 'react-native';
import { signOut } from '../utils/authenticator';
import { Ionicons } from '@expo/vector-icons';

const showSignOutConfirmation = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
};

const handleProfilePress = () => {
    const options = ['Cancel', 'My Profile', 'Settings', 'Sign Out'];

    if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
            { options, destructiveButtonIndex: 3, cancelButtonIndex: 0, title: 'Account Options' },
            (buttonIndex) => {
                if (buttonIndex === 3) showSignOutConfirmation();
            }
        );
    } else {
        Alert.alert('Account Options', 'Choose an action', [
            { text: 'Sign Out', style: 'destructive', onPress: showSignOutConfirmation },
            { text: 'Settings', onPress: () => {} },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }
};

export default function ProfileMenu() {
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
        backgroundColor: '#0047AB',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});
