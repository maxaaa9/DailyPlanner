import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebaseConfig';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthScreen from './components/authScreen';
import ProfileMenu from './components/profileMenu';
import HomeScreen from './components/homeScreen';
import TasksScreen from './components/tasksScreen';
import CalendarScreen from './components/calendarScreen';

const Tab = createMaterialTopTabNavigator();

const TAB_ICONS = {
  Home: 'home-outline',
  Tasks: 'checkmark-circle-outline',
  Scheduler: 'calendar-outline',
};

function MainApp() {
  const { colors } = useTheme();
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!signedIn) {
    return <AuthScreen onAuthSuccess={() => setSignedIn(true)} />;
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.header }}>
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>{currentTab}</Text>
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
            tabBarActiveTintColor: colors.tabActive,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarStyle: { backgroundColor: colors.tabBar },
            tabBarIndicatorStyle: { height: 0 },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Tasks" component={TasksScreen} />
          <Tab.Screen name="Scheduler" component={CalendarScreen} />
        </Tab.Navigator>
      </SafeAreaView>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
};
