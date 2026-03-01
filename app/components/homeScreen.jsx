import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../firebaseConfig';
import { signOut } from '../utils/authenticator';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Hello, {auth.currentUser?.email}</Text>
            <Button title="Sign Out" onPress={signOut} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
