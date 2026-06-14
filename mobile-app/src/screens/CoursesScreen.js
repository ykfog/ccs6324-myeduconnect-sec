import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';
import api from '../api/client';
import ModeToggle from '../components/ModeToggle';

export default function CoursesScreen({ navigation }) {
    const { mode, auth, logout } = useApp();
    const [search, setSearch] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (q = '') => {
        try {
            const response = await api.get(`/api/courses?search=${q}`);
            setCourses(response.data.courses || []);
        } catch (err) {
            console.warn('Failed to load courses', err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        load(search).finally(() => setLoading(false));
    }, [mode, search]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load(search);
        setRefreshing(false);
    };

    const onSearch = async (text) => {
        setSearch(text);
        await load(text);
    };

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>
            <ModeToggle />

            <View style={styles.header}>
                <Text style={styles.title}>Courses</Text>
                <View style={styles.headerActions}>
                    {auth ? (
                        <>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: auth.user.id })}>
                                <Text style={styles.headerLink}>My Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 16 }}>
                                <Text style={[styles.headerLink, { color: '#d32f2f' }]}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.headerLink}>Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TextInput
                style={styles.search}
                placeholder="Search courses..."
                value={search}
                onChangeText={onSearch}
            />

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    ListEmptyComponent={<Text style={styles.empty}>No courses found.</Text>}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                        >
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 24, fontWeight: '800' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    headerLink: { color: '#1a73e8', fontWeight: '600', fontSize: 13 },
    search: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 14,
    },
    card: {
        borderWidth: 1, borderColor: '#eee', borderRadius: 10,
        padding: 14, marginBottom: 10, backgroundColor: '#fafafa',
    },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#666' },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});