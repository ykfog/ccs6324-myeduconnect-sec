import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import ModeToggle from '../components/ModeToggle';

// -----------------------------------------------------------------------
// RegisterScreen
//
// PENTEST NOTE: in vulnerable mode, passwords are stored as MD5 hashes
// (backend/server.js -> /api/register). In safe mode, bcrypt is used.
// -----------------------------------------------------------------------
export default function RegisterScreen({ navigation }) {
    const { mode } = useApp();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [loading, setLoading] = useState(false);

    const onRegister = async () => {
        if (!username || !password) {
            Alert.alert('Missing fields', 'Username and password are required.');
            return;
        }
        setLoading(true);
        try {
            await api.register(username, password, fullname, mode);
            Alert.alert('Success', 'Account created. You can now log in.', [
                { text: 'OK', onPress: () => navigation.replace('Login') },
            ]);
        } catch (err) {
            Alert.alert('Registration failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container}>
                <ModeToggle />
                <Text style={styles.title}>Create Account</Text>

                <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="Full name" value={fullname} onChangeText={setFullname} />
                <TextInput style={styles.input} placeholder="Password" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />

                <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                    <Text style={styles.link}>Already have an account? Log in</Text>
                </TouchableOpacity>

                <View style={styles.hintBox}>
                    <Text style={styles.hintTitle}>
                        Password storage: {mode === 'vulnerable' ? 'MD5 (weak)' : 'bcrypt (12 rounds)'}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 32 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 15,
    },
    button: {
        backgroundColor: '#1a73e8', borderRadius: 8, paddingVertical: 14,
        alignItems: 'center', marginTop: 8,
    },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    link: { color: '#1a73e8', textAlign: 'center', marginTop: 16, fontSize: 13 },
    hintBox: {
        marginTop: 24, padding: 12, backgroundColor: '#f3f4f6',
        borderRadius: 8, borderWidth: 1, borderColor: '#ddd',
    },
    hintTitle: { fontWeight: '600', fontSize: 12, color: '#444', textAlign: 'center' },
});
