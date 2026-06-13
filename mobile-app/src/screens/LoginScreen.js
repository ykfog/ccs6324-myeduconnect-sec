import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import ModeToggle from '../components/ModeToggle';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { mode, login } = useApp();

    const handleLogin = async () => {
        console.log('1. Login button clicked');
        
        try {
            const url = 'http://localhost:8080/api/login';
            const body = JSON.stringify({ username, password });
            
            console.log('2. Sending to:', url);
            console.log('3. Body:', body);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });
            
            console.log('4. Response status:', response.status);
            
            const data = await response.json();
            console.log('5. Response data:', data);
            
            if (response.ok) {
                const { sessionToken, user } = data;
                login(sessionToken, user);
                console.log('6. Login successful, navigating to Courses');
                navigation.replace('Courses');
            } else {
                Alert.alert('Login Failed', data.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('7. Error:', error.message);
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ModeToggle />
            <Text style={styles.title}>MyEduConnect</Text>
            <Text style={styles.subtitle}>Companion App Login</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
            
            {mode === 'vulnerable' && (
                <View style={styles.hintBox}>
                    <Text style={styles.hintTitle}>Pentest hint (Vulnerable Mode)</Text>
                    <Text style={styles.hintText}>
                        Try username: ' OR '1'='1' -- {'\n'}
                        password: anything
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#2c3e50'
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: '#7f8c8d'
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    link: {
        textAlign: 'center',
        marginTop: 20,
        color: '#3498db'
    },
    hintBox: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#fff3cd',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffc107'
    },
    hintTitle: {
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 5
    },
    hintText: {
        color: '#856404',
        fontSize: 12
    }
});