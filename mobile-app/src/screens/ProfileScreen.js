import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import ModeToggle from '../components/ModeToggle';

// -----------------------------------------------------------------------
// ProfileScreen
//
// PENTEST NOTE (vulnerable mode): GET /api/profile/:id performs NO
// ownership check -- any authenticated user can view ANY other user's
// profile (IDOR) by entering a different user ID in the box below.
// In safe mode, the backend returns 403 Forbidden unless the requested
// ID matches the authenticated user's own ID.
// -----------------------------------------------------------------------
export default function ProfileScreen({ route, navigation }) {
    const initialUserId = route.params?.userId;
    const { mode, auth } = useApp();
    const [lookupId, setLookupId] = useState(String(initialUserId ?? auth?.user?.id ?? ''));
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async (id) => {
        if (!auth) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.profile(id, auth.token, mode);
            setProfile(data.profile);
            setBio(data.profile.bio || '');
        } catch (err) {
            setProfile(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [auth, mode]);

    useEffect(() => {
        if (lookupId) load(lookupId);
    }, [mode]);

    if (!auth) {
        return (
            <View style={styles.container}>
                <ModeToggle />
                <Text style={styles.notLoggedIn}>Please log in to view profiles.</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const onSave = async () => {
        try {
            await api.updateProfile(auth.user.id, bio, auth.token, mode);
            Alert.alert('Saved', 'Profile updated.');
        } catch (err) {
            Alert.alert('Failed', err.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ModeToggle />
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Logged in as: {auth.user.username} (id: {auth.user.id})</Text>

            <Text style={styles.label}>View profile by ID:</Text>
            <View style={styles.lookupRow}>
                <TextInput
                    style={styles.lookupInput}
                    value={lookupId}
                    onChangeText={setLookupId}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.lookupBtn} onPress={() => load(lookupId)}>
                    <Text style={styles.lookupBtnText}>Load</Text>
                </TouchableOpacity>
            </View>

            {mode === 'vulnerable' && (
                <View style={styles.hintBox}>
                    <Text style={styles.hintTitle}>Pentest hint (Vulnerable Mode — IDOR)</Text>
                    <Text style={styles.hintText}>
                        Enter a different user ID (e.g. 1) and tap Load. The backend
                        performs no ownership check, so you can view any user's
                        profile and bio.
                    </Text>
                </View>
            )}

            {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
            {error && <Text style={styles.error}>{error}</Text>}

            {profile && (
                <View style={styles.card}>
                    <Text style={styles.cardRow}><Text style={styles.cardLabel}>ID:</Text> {profile.id}</Text>
                    <Text style={styles.cardRow}><Text style={styles.cardLabel}>Username:</Text> {profile.username}</Text>
                    <Text style={styles.cardRow}><Text style={styles.cardLabel}>Full name:</Text> {profile.fullname}</Text>
                    <Text style={styles.cardRow}><Text style={styles.cardLabel}>Bio:</Text> {profile.bio}</Text>

                    {String(profile.id) === String(auth.user.id) && (
                        <>
                            <Text style={[styles.label, { marginTop: 16 }]}>Edit your bio:</Text>
                            <TextInput
                                style={styles.bioInput}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                            />
                            <TouchableOpacity style={styles.button} onPress={onSave}>
                                <Text style={styles.buttonText}>Save Bio</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingTop: 56, paddingHorizontal: 16, paddingBottom: 40, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    lookupRow: { flexDirection: 'row', marginBottom: 12 },
    lookupInput: {
        flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, fontSize: 14,
    },
    lookupBtn: { backgroundColor: '#1a73e8', borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
    lookupBtnText: { color: '#fff', fontWeight: '700' },
    hintBox: {
        padding: 12, backgroundColor: '#fff3e0', borderRadius: 8,
        borderWidth: 1, borderColor: '#ffb74d', marginBottom: 12,
    },
    hintTitle: { fontWeight: '700', fontSize: 12, marginBottom: 4, color: '#e65100' },
    hintText: { fontSize: 12, color: '#5d4037', lineHeight: 17 },
    error: { color: '#d32f2f', marginTop: 12, fontSize: 13 },
    card: {
        marginTop: 16, padding: 14, borderWidth: 1, borderColor: '#eee',
        borderRadius: 10, backgroundColor: '#fafafa',
    },
    cardRow: { fontSize: 14, marginBottom: 6 },
    cardLabel: { fontWeight: '700' },
    bioInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 70, marginBottom: 10,
    },
    button: {
        backgroundColor: '#1a73e8', borderRadius: 8, paddingVertical: 12, alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '700' },
    notLoggedIn: { marginTop: 100, textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 16 },
});
