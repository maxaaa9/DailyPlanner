import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, getDocsFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { auth, firestore } from '../../firebaseConfig';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

export default function DayListScreen({ navigation }) {
    const { colors } = useTheme();
    const [taskCounts, setTaskCounts] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const onRefresh = useCallback(async () => {
        if (!currentUserId) return;
        setRefreshing(true);
        try {
            const snapshot = await getDocsFromServer(collection(firestore, 'users', currentUserId, 'scheduleTasks'));
            const counts = {};
            snapshot.forEach(doc => {
                const day = doc.data().day;
                counts[day] = (counts[day] || 0) + 1;
            });
            setTaskCounts(counts);
        } finally {
            setRefreshing(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        let firestoreUnsub = null;
        const authUnsub = onAuthStateChanged(auth, user => {
            if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
            if (!user) return;
            setCurrentUserId(user.uid);
            firestoreUnsub = onSnapshot(
                collection(firestore, 'users', user.uid, 'scheduleTasks'),
                snapshot => {
                    const counts = {};
                    snapshot.forEach(doc => {
                        const day = doc.data().day;
                        counts[day] = (counts[day] || 0) + 1;
                    });
                    setTaskCounts(counts);
                    setLoading(false);
                    setError(null);
                },
                () => {
                    setLoading(false);
                    setError('Failed to load schedule. Pull down to retry.');
                }
            );
        });
        return () => { authUnsub(); if (firestoreUnsub) firestoreUnsub(); };
    }, []);

    const jsDay = new Date().getDay();
    const todayName = DAYS[jsDay === 0 ? 6 : jsDay - 1];

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.subtext, fontSize: 15 }}>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={{ flex: 1, backgroundColor: colors.background }}
            data={DAYS}
            keyExtractor={item => item}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            renderItem={({ item }) => {
                const isToday = item === todayName;
                return (
                    <TouchableOpacity
                        style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                        onPress={() => navigation.navigate('DayDetail', { day: item })}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dayIndicator, { backgroundColor: isToday ? colors.primary : 'transparent' }]}>
                            <Text style={[styles.dayShort, { color: isToday ? 'white' : colors.text }]}>{item}</Text>
                        </View>
                        <Text style={[styles.dayFull, { color: colors.subtext }]}>{DAY_FULL[item]}</Text>
                        <View style={styles.rowRight}>
                            {taskCounts[item] > 0 && (
                                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.badgeText}>{taskCounts[item]}</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </View>
                    </TouchableOpacity>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        gap: 14,
        marginHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
    },
    dayIndicator: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayShort: {
        fontSize: 15,
        fontWeight: '700',
    },
    dayFull: {
        flex: 1,
        fontSize: 16,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
