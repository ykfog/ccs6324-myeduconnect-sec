import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

// -----------------------------------------------------------------------
// ModeToggle
//
// Small pill button rendered at the top-left of every screen. Tapping it
// flips the global mode between 'vulnerable' and 'safe'. Every API call
// made afterwards (via src/api/client.js) sends this as the X-Mode header,
// letting the backend switch between the deliberately-vulnerable and
// hardened implementations of the SAME endpoints -- useful for live
// before/after demos in Phase 4/5/7.
// -----------------------------------------------------------------------
export default function ModeToggle() {
    const { mode, toggleMode } = useApp();
    const isVulnerable = mode === 'vulnerable';

    return (
        <TouchableOpacity
            style={[styles.pill, isVulnerable ? styles.vulnerable : styles.safe]}
            onPress={toggleMode}
            activeOpacity={0.7}
        >
            <View style={[styles.dot, isVulnerable ? styles.dotVuln : styles.dotSafe]} />
            <Text style={styles.text}>
                {isVulnerable ? 'VULNERABLE MODE' : 'SAFE MODE'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pill: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    vulnerable: {
        backgroundColor: '#ffe5e5',
        borderWidth: 1,
        borderColor: '#d32f2f',
    },
    safe: {
        backgroundColor: '#e6f7ed',
        borderWidth: 1,
        borderColor: '#2e7d32',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    dotVuln: { backgroundColor: '#d32f2f' },
    dotSafe: { backgroundColor: '#2e7d32' },
    text: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
