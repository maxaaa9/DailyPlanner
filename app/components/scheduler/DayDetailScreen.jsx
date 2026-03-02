import {
    View, Text, FlatList, TouchableOpacity, TextInput, Switch,
    Modal, StyleSheet, Alert, KeyboardAvoidingView, RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocsFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../context/ThemeContext';
import { auth, firestore } from '../../firebaseConfig';
import { scheduleTaskNotification, cancelTaskNotification } from '../../utils/internalNotification';

const DAY_FULL = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const isValidTime = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const timeStrToDate = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
};

export default function DayDetailScreen({ route, navigation }) {
    const { day } = route.params;
    const { colors } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [notifyEnabled, setNotifyEnabled] = useState(true);

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const onStartTimeChange = (_, selectedDate) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            setStartTime(formatTime(selectedDate));
        }
    };

    const onEndTimeChange = (_, selectedDate) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
            setEndTime(formatTime(selectedDate));
        }
    };

    const onRefresh = useCallback(async () => {
        if (!userId) return;
        setRefreshing(true);
        try {
            const snapshot = await getDocsFromServer(collection(firestore, 'users', userId, 'scheduleTasks'));
            const dayTasks = [];
            snapshot.forEach(docSnap => {
                if (docSnap.data().day === day) {
                    dayTasks.push({ id: docSnap.id, ...docSnap.data() });
                }
            });
            dayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setTasks(dayTasks);
        } finally {
            setRefreshing(false);
        }
    }, [userId, day]);

    useEffect(() => {
        let firestoreUnsub = null;
        const authUnsub = onAuthStateChanged(auth, user => {
            if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
            if (!user) return;
            setUserId(user.uid);
            firestoreUnsub = onSnapshot(collection(firestore, 'users', user.uid, 'scheduleTasks'), snapshot => {
                const dayTasks = [];
                snapshot.forEach(docSnap => {
                    if (docSnap.data().day === day) {
                        dayTasks.push({ id: docSnap.id, ...docSnap.data() });
                    }
                });
                dayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setTasks(dayTasks);
            });
        });
        return () => { authUnsub(); if (firestoreUnsub) firestoreUnsub(); };
    }, [day]);

    const resetModal = () => {
        setTitle('');
        setStartTime('');
        setEndTime('');
        setStartDate(new Date());
        setEndDate(new Date());
        setEditingTask(null);
        setNotifyEnabled(true);
        setModalVisible(false);
    };

    const handleLongPress = (task) => {
        setEditingTask(task);
        setTitle(task.title);
        setStartTime(task.startTime);
        setEndTime(task.endTime);
        setStartDate(timeStrToDate(task.startTime));
        setEndDate(timeStrToDate(task.endTime));
        setNotifyEnabled(!!task.notificationId);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert('Error', 'Please enter a task title.');
        if (!isValidTime(startTime)) return Alert.alert('Error', 'Please select a start time.');
        if (!isValidTime(endTime)) return Alert.alert('Error', 'Please select an end time.');
        if (startTime >= endTime) return Alert.alert('Error', 'End time must be after start time.');
        if (!userId) return;

        if (editingTask) {
            await cancelTaskNotification(editingTask.notificationId);
            const notificationId = notifyEnabled
                ? await scheduleTaskNotification(title.trim(), startTime, endTime, day)
                : null;
            await updateDoc(doc(firestore, 'users', userId, 'scheduleTasks', editingTask.id), {
                title: title.trim(),
                startTime,
                endTime,
                notificationId: notificationId ?? null,
                notificationsEnabled: notifyEnabled,
            });
        } else {
            const notificationId = notifyEnabled
                ? await scheduleTaskNotification(title.trim(), startTime, endTime, day)
                : null;
            await addDoc(collection(firestore, 'users', userId, 'scheduleTasks'), {
                day,
                title: title.trim(),
                startTime,
                endTime,
                notificationId: notificationId ?? null,
                notificationsEnabled: notifyEnabled,
            });
        }

        resetModal();
    };

    const handleDelete = async (task) => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Confirm delete "${task.title}"`,
                cancelLabel: 'Cancel',
                fallbackLabel: 'Use PIN',
            });
            if (!result.success) return;
        }

        Alert.alert('Delete Task', `Delete "${task.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await cancelTaskNotification(task.notificationId);
                    await deleteDoc(doc(firestore, 'users', userId, 'scheduleTasks', task.id));
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.header }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.headerText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.headerText }]}>{DAY_FULL[day]}</Text>
                <View style={{ width: 36 }} />
            </View>

            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : { paddingBottom: 90 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No tasks for {DAY_FULL[day]}</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onLongPress={() => handleLongPress(item)}
                        delayLongPress={400}
                        activeOpacity={1}
                        style={[styles.taskRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                    >
                        <View style={[styles.timeBar, { backgroundColor: colors.primary }]} />
                        <View style={styles.taskInfo}>
                            <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.taskTime, { color: colors.subtext }]}>{item.startTime} – {item.endTime}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={resetModal}
            >
                <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{editingTask ? 'Edit Task' : 'Add Task'} — {DAY_FULL[day]}</Text>

                        <TextInput
                            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                            placeholder="Task title"
                            placeholderTextColor={colors.subtext}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <TouchableOpacity
                            style={[styles.input, styles.timePickerBtn, { borderColor: colors.border }]}
                            onPress={() => setShowStartPicker(true)}
                        >
                            <Ionicons name="time-outline" size={16} color={colors.subtext} />
                            <Text style={{ color: startTime ? colors.text : colors.subtext, fontSize: 15 }}>
                                {startTime || 'Start time'}
                            </Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="time"
                                is24Hour={true}
                                onChange={onStartTimeChange}
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.input, styles.timePickerBtn, { borderColor: colors.border }]}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Ionicons name="time-outline" size={16} color={colors.subtext} />
                            <Text style={{ color: endTime ? colors.text : colors.subtext, fontSize: 15 }}>
                                {endTime || 'End time'}
                            </Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="time"
                                is24Hour={true}
                                onChange={onEndTimeChange}
                            />
                        )}

                        <View style={styles.switchRow}>
                            <Text style={[styles.switchLabel, { color: colors.text }]}>Enable notification</Text>
                            <Switch
                                value={notifyEnabled}
                                onValueChange={setNotifyEnabled}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="white"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={resetModal}
                                style={[styles.modalBtn, { borderColor: colors.border }]}
                            >
                                <Text style={{ color: colors.subtext }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{editingTask ? 'Update' : 'Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16 },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingRight: 12,
    },
    timeBar: { width: 4, alignSelf: 'stretch' },
    taskInfo: { flex: 1, padding: 14 },
    taskTitle: { fontSize: 16, fontWeight: '500' },
    taskTime: { fontSize: 13, marginTop: 2 },
    deleteBtn: { padding: 8 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
        marginBottom: 50,
    },
    modalBox: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
    },
    timePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchLabel: { fontSize: 15 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
    modalBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
});
