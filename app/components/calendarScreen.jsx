import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DayListScreen from './scheduler/DayListScreen';
import DayDetailScreen from './scheduler/DayDetailScreen';

const Stack = createNativeStackNavigator();

export default function CalendarScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DayList" component={DayListScreen} />
            <Stack.Screen name="DayDetail" component={DayDetailScreen} />
        </Stack.Navigator>
    );
}
