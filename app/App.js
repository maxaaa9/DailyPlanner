import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebaseConfig';
import AuthScreen from './components/authScreen';
import ProfileMenu from './components/profileMenu';
import HomeScreen from './components/homeScreen';
import TasksScreen from './components/tasksScreen';
import CalendarScreen from './components/calendarScreen';

const Tab = createMaterialTopTabNavigator();

const TAB_ICONS = {
  Home: 'home-outline',
  Tasks: 'checkmark-circle-outline',
  Calendar: 'calendar-outline',
};

const showSignOutConfirmation = () => {
  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: signOut },
  ]);
};

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('Home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!signedIn) {
    return (
      <SafeAreaProvider>
        <AuthScreen onAuthSuccess={() => setSignedIn(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{currentTab}</Text>
            <ProfileMenu />
          </View>
          <Tab.Navigator
            tabBarPosition="bottom"
            screenListeners={{
              focus: (e) => setCurrentTab(e.target?.split('-')[0] ?? 'Home'),
            }}
            screenOptions={({ route }) => ({
              swipeEnabled: true,
              tabBarIcon: ({ color }) => (
                <Ionicons name={TAB_ICONS[route.name]} size={22} color={color} />
              ),
              tabBarShowIcon: true,
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#8e8e93',
              tabBarStyle: { backgroundColor: '#fff' },
              tabBarIndicatorStyle: { height: 0 },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 18, // Half of width/height makes it a perfect circle
    backgroundColor: '#0047AB', // Changed from red to match the Blue in your logo
    justifyContent: 'center',  // Centers icon vertically
    alignItems: 'center',      // Centers icon horizontally
    // Add a slight shadow for depth
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
