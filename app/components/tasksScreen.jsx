import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, firestore } from '../firebaseConfig';
import {
    scheduleTodayTaskNotifications,
    scheduleActiveWindowNotifications,
    cancelNotificationIds,
} from '../utils/internalNotification';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function TasksScreen() {
    const { colors } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState(new Set());
    const activeNotifIdsRef = useRef({});
    const scheduledRef = useRef(new Set());
    const todayName = DAYS[new Date().getDay()];
    const today = getTodayStr();

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('doneTasks_v2');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.date === today) {
                        const ids = new Set(parsed.ids);
                        setDoneTasks(ids);
                        ids.forEach(id => scheduledRef.current.add(id));
                    }
                }
                const raw2 = await AsyncStorage.getItem('activeNotifIds_v2');
                if (raw2) {
                    const parsed2 = JSON.parse(raw2);
                    if (parsed2.date === today) {
                        activeNotifIdsRef.current = parsed2.map ?? {};
                        Object.keys(parsed2.map ?? {}).forEach(id => scheduledRef.current.add(id));
                    }
                }
            } catch {}
        })();
    }, []);

    useEffect(() => {
        let firestoreUnsub = null;
        const authUnsub = onAuthStateChanged(auth, user => {
            if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
            if (!user) return;
            firestoreUnsub = onSnapshot(collection(firestore, 'users', user.uid, 'scheduleTasks'), snapshot => {
                const todayTasks = [];
                snapshot.forEach(docSnap => {
                    if (docSnap.data().day === todayName) {
                        todayTasks.push({ id: docSnap.id, ...docSnap.data() });
                    }
                });
                todayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setTasks(todayTasks);
                scheduleTodayTaskNotifications(todayTasks.filter(t => t.notificationsEnabled !== false));
            });
        });
        return () => { authUnsub(); if (firestoreUnsub) firestoreUnsub(); };
    }, [todayName]);

    useEffect(() => {
        if (tasks.length === 0) return;
        const doneSnapshot = doneTasks;
        (async () => {
            for (const task of tasks) {
                if (doneSnapshot.has(task.id)) continue;
                if (scheduledRef.current.has(task.id)) continue;
                scheduledRef.current.add(task.id);
                if (task.notificationsEnabled === false) continue;
                const ids = await scheduleActiveWindowNotifications(task, today);
                if (ids.length > 0) {
                    activeNotifIdsRef.current[task.id] = ids;
                    try {
                        await AsyncStorage.setItem('activeNotifIds_v2', JSON.stringify({
                            date: today,
                            map: activeNotifIdsRef.current,
                        }));
                    } catch {}
                }
            }
        })();
    }, [tasks]);

    const handleTick = async (task) => {
        const newDone = new Set(doneTasks);
        newDone.add(task.id);
        setDoneTasks(newDone);
        try {
            await AsyncStorage.setItem('doneTasks_v2', JSON.stringify({ date: today, ids: [...newDone] }));
        } catch {}

        const ids = activeNotifIdsRef.current[task.id];
        if (ids?.length) {
            await cancelNotificationIds(ids);
            delete activeNotifIdsRef.current[task.id];
            try {
                await AsyncStorage.setItem('activeNotifIds_v2', JSON.stringify({
                    date: today,
                    map: activeNotifIdsRef.current,
                }));
            } catch {}
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
                Today — {DAY_FULL[todayName]}
            </Text>
            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>
                        No tasks scheduled for {DAY_FULL[todayName]}
                    </Text>
                }
                renderItem={({ item }) => {
                    const done = doneTasks.has(item.id);
                    return (
                        <View style={[styles.taskRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                            <View style={[styles.timeBar, { backgroundColor: done ? colors.subtext : colors.primary }]} />
                            <View style={styles.taskInfo}>
                                <Text style={[styles.taskTitle, { color: done ? colors.subtext : colors.text }]}>{item.title}</Text>
                                <Text style={[styles.taskTime, { color: colors.subtext }]}>{item.startTime} – {item.endTime}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleTick(item)} style={styles.tickBtn}>
                                <Ionicons
                                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={26}
                                    color={done ? colors.primary : colors.subtext}
                                />
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 16 },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    timeBar: { width: 4, alignSelf: 'stretch' },
    taskInfo: { flex: 1, padding: 14 },
    taskTitle: { fontSize: 16, fontWeight: '500' },
    taskTime: { fontSize: 13, marginTop: 2 },
    tickBtn: { padding: 12 },
});
