import { View, Text, StyleSheet, Button } from 'react-native';
import { triggerInternalNotification } from '../utils/internalNotification';

export default function TasksScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks</Text>
            <Button title="Test Notifications" onPress={() => triggerInternalNotification("Reminder:P", "This is a test notification from the Tasks screen!")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
