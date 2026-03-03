import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { auth, firestore } from '../firebaseConfig';
import { GOOGLE_MAPS_API_KEY } from '../utils/googleConfig';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toMins = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const formatDuration = (mins) => {
    if (mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

const calcDistance = (lat1, lng1, lat2, lng2) => {
    const dLat = lat1 - lat2;
    const dLng = lng1 - lng2;
    return Math.sqrt(dLat * dLat + dLng * dLng);
};

const fetchNearbyFitness = async (lat, lng) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=gym&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        return (json.results ?? []).map(p => ({
            id: p.place_id,
            name: p.name,
            latitude: p.geometry.location.lat,
            longitude: p.geometry.location.lng,
            vicinity: p.vicinity,
            rating: p.rating,
        }));
    } catch {
        return [];
    }
};

export default function HomeScreen() {
    const { colors } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [doneIds, setDoneIds] = useState(new Set());
    const [location, setLocation] = useState(null);
    const [locationLabel, setLocationLabel] = useState('Locating...');
    const [fitnessPlaces, setFitnessPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [nearestPlace, setNearestPlace] = useState(null);
    const todayName = DAYS[new Date().getDay()];
    const today = getTodayStr();

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('doneTasks_v2');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    setDoneIds(parsed.date === today ? new Set(parsed.ids) : new Set());
                } else {
                    setDoneIds(new Set());
                }
            } catch {}
        })();
    }, [today]));

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
            });
        });
        return () => { authUnsub(); if (firestoreUnsub) firestoreUnsub(); };
    }, [todayName]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationLabel('Location permission denied');
                return;
            }
            const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocation(coords.coords);

            const [place] = await Location.reverseGeocodeAsync(coords.coords);
            if (place) {
                const parts = [place.street, place.city, place.region].filter(Boolean);
                setLocationLabel(parts.join(', '));
            }

            const places = await fetchNearbyFitness(coords.coords.latitude, coords.coords.longitude);
            setFitnessPlaces(places);
            if (places.length > 0) {
                const nearest = places.reduce((best, place) => {
                    const d = calcDistance(coords.coords.latitude, coords.coords.longitude, place.latitude, place.longitude);
                    const dBest = calcDistance(coords.coords.latitude, coords.coords.longitude, best.latitude, best.longitude);
                    return d < dBest ? place : best;
                });
                setNearestPlace(nearest);
                setSelectedPlace(nearest);
            }
        })();
    }, []);

    const totalTasks = tasks.length;
    const doneCount = tasks.filter(t => doneIds.has(t.id)).length;

    let freeTimeMins = 0;
    if (tasks.length >= 2) {
        const spanStart = toMins(tasks[0].startTime);
        const spanEnd = toMins(tasks[tasks.length - 1].endTime);
        const occupied = tasks.reduce((sum, t) => sum + (toMins(t.endTime) - toMins(t.startTime)), 0);
        freeTimeMins = Math.max(0, (spanEnd - spanStart) - occupied);
    }

    const freeTimeValue = totalTasks < 2 ? '—' : formatDuration(freeTimeMins);
    const freeTimeSub = totalTasks === 0 ? 'no tasks today' : totalTasks === 1 ? 'single task' : 'between tasks';
    const name = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'there';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.topSection}>
                <View style={styles.greetingBlock}>
                    <Text style={[styles.greeting, { color: colors.text }]}>Hello, {name}</Text>
                    <Text style={[styles.dateText, { color: colors.subtext }]}>{DAY_FULL[todayName]}</Text>
                </View>

                <View style={styles.statsRow}>
                    <StatCard colors={colors} icon="list-outline" value={String(totalTasks)} label="Tasks Today" />
                    <StatCard colors={colors} icon="checkmark-done-outline" value={`${doneCount}/${totalTasks}`} label="Completed" />
                    <StatCard colors={colors} icon="time-outline" value={freeTimeValue} label="Free Time" sub={freeTimeSub} />
                </View>
            </View>

            <View style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.mapHeader}>
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                    <Text style={[styles.mapLabel, { color: colors.text }]} numberOfLines={1}>{locationLabel}</Text>
                    {fitnessPlaces.length > 0 && (
                        <View style={[styles.fitnessBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="fitness-outline" size={12} color="white" />
                            <Text style={styles.fitnessBadgeText}>{fitnessPlaces.length}</Text>
                        </View>
                    )}
                </View>

                {selectedPlace && (
                    <View style={[styles.placeInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Ionicons name="fitness-outline" size={16} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>{selectedPlace.name}</Text>
                            <Text style={[styles.placeVicinity, { color: colors.subtext }]} numberOfLines={1}>{selectedPlace.vicinity}</Text>
                        </View>
                        {selectedPlace.id === nearestPlace?.id && (
                            <View style={[styles.nearestBadge, { backgroundColor: '#2ECC71' }]}>
                                <Text style={styles.nearestBadgeText}>Nearest</Text>
                            </View>
                        )}
                        {selectedPlace.rating && (
                            <Text style={[styles.placeRating, { color: colors.primary }]}>★ {selectedPlace.rating}</Text>
                        )}
                    </View>
                )}

                <View style={styles.mapWrapper}>
                    <MapView
                        style={styles.map}
                        region={location ? {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        } : {
                            latitude: 0,
                            longitude: 0,
                            latitudeDelta: 180,
                            longitudeDelta: 360,
                        }}
                        showsUserLocation={!!location}
                        showsMyLocationButton={false}
                        onPress={() => setSelectedPlace(null)}
                    >
                        {fitnessPlaces.map(place => (
                            <Marker
                                key={place.id}
                                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                                title={place.name}
                                description={place.vicinity}
                                pinColor={place.id === nearestPlace?.id ? '#2ECC71' : '#FF4500'}
                                onPress={() => setSelectedPlace(place)}
                            />
                        ))}
                    </MapView>
                    {!location && (
                        <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder, { backgroundColor: colors.border }]}>
                            <Ionicons name="map-outline" size={32} color={colors.subtext} />
                            <Text style={[styles.mapPlaceholderText, { color: colors.subtext }]}>{locationLabel}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

function StatCard({ colors, icon, value, label, sub }) {
    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name={icon} size={26} color={colors.primary} />
            <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.cardLabel, { color: colors.subtext }]}>{label}</Text>
            {sub && <Text style={[styles.cardSub, { color: colors.subtext }]}>{sub}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    topSection: { marginBottom: 20 },
    greetingBlock: { marginBottom: 20 },
    greeting: { fontSize: 22, fontWeight: 'bold' },
    dateText: { fontSize: 14, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 12 },
    card: {
        flex: 1, borderRadius: 14, borderWidth: 1,
        padding: 14, alignItems: 'center', gap: 5,
    },
    cardValue: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
    cardLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    cardSub: { fontSize: 10, textAlign: 'center', opacity: 0.7 },
    mapCard: { flex: 1, borderRadius: 14, borderWidth: 1 },
    mapHeader: {
        flexDirection: 'row', alignItems: 'center',
        gap: 6, padding: 12,
    },
    mapLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
    fitnessBadge: {
        flexDirection: 'row', alignItems: 'center',
        gap: 3, paddingHorizontal: 7, paddingVertical: 3,
        borderRadius: 10,
    },
    fitnessBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    placeInfo: {
        flexDirection: 'row', alignItems: 'center',
        gap: 8, marginHorizontal: 12, marginBottom: 8,
        padding: 10, borderRadius: 10, borderWidth: 1,
    },
    placeName: { fontSize: 13, fontWeight: '600' },
    placeVicinity: { fontSize: 11, marginTop: 1 },
    placeRating: { fontSize: 13, fontWeight: 'bold' },
    mapWrapper: { flex: 1, borderRadius: 14, overflow: 'hidden' },
    map: { flex: 1 },
    mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    mapPlaceholderText: { fontSize: 13 },
    nearestBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    nearestBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});
