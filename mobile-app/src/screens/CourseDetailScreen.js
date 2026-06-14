import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import ModeToggle from '../components/ModeToggle';

// -----------------------------------------------------------------------
// CourseDetailScreen
//
// PENTEST NOTE (vulnerable mode): comments are stored without any
// sanitization. The web frontend (views/course_detail.ejs) renders
// `c.comment` using the unescaped EJS tag `<%- %>`, so a comment posted
// here containing e.g.  <script>alert(document.cookie)</script>
// will execute as stored XSS when viewed on the web platform.
// In safe mode, the backend HTML-escapes comments before storing them.
// -----------------------------------------------------------------------
export default function CourseDetailScreen({ route, navigation }) {
    const { courseId } = route.params;
    const { mode, auth } = useApp();
    const [course, setCourse] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await api.courseDetail(courseId, mode);
            setCourse(data.course);
            setComments(data.comments || []);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    }, [courseId, mode]);

    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [load]);

    const onEnroll = async () => {
        if (!auth) {
            Alert.alert('Login required', 'Please log in to enroll.');
            return;
        }
        try {
            await api.enroll(courseId, auth.token, mode);
            Alert.alert('Enrolled', 'You have been enrolled (mock payment).');
        } catch (err) {
            Alert.alert('Enroll failed', err.message);
        }
    };

    const onPostComment = async () => {
        if (!auth) {
            Alert.alert('Login required', 'Please log in to comment.');
            return;
        }
        if (!commentText.trim()) return;
        setPosting(true);
        try {
            await api.postComment(courseId, commentText, auth.token, mode);
            setCommentText('');
            await load();
        } catch (err) {
            Alert.alert('Failed to post comment', err.message);
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 80 }} />;
    if (!course) return <Text style={{ marginTop: 80, textAlign: 'center' }}>Course not found.</Text>;

    return (
        <View style={styles.container}>
            <ModeToggle />
            <FlatList
                contentContainerStyle={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 }}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>{course.title}</Text>
                        <Text style={styles.desc}>{course.description}</Text>

                        <TouchableOpacity style={styles.enrollBtn} onPress={onEnroll}>
                            <Text style={styles.enrollBtnText}>Enroll (Mock Payment)</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

                        {mode === 'vulnerable' && (
                            <View style={styles.hintBox}>
                                <Text style={styles.hintTitle}>Pentest hint (Vulnerable Mode)</Text>
                                <Text style={styles.hintText}>
                                    Comments are stored unsanitized. A payload like{'\n'}
                                    {'<script>alert(document.cookie)</script>'}{'\n'}
                                    will execute as stored XSS on the web frontend.
                                </Text>
                            </View>
                        )}
                    </>
                }
                data={comments}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.comment}>
                        <Text style={styles.commentUser}>{item.username}</Text>
                        <Text style={styles.commentText}>{item.comment}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
                ListFooterComponent={
                    <View style={styles.commentForm}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder={auth ? 'Add a comment...' : 'Log in to comment'}
                            value={commentText}
                            onChangeText={setCommentText}
                            editable={!!auth}
                            multiline
                        />
                        <TouchableOpacity style={styles.postBtn} onPress={onPostComment} disabled={posting}>
                            {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.postBtnText}>Post</Text>}
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
    desc: { fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 20 },
    enrollBtn: {
        backgroundColor: '#1a73e8', borderRadius: 8, paddingVertical: 12,
        alignItems: 'center', marginBottom: 24,
    },
    enrollBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    comment: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
    commentUser: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
    commentText: { fontSize: 14, color: '#333' },
    empty: { color: '#999', fontStyle: 'italic', marginBottom: 12 },
    commentForm: { marginTop: 12, flexDirection: 'row', alignItems: 'flex-end' },
    commentInput: {
        flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, fontSize: 14, minHeight: 44,
    },
    postBtn: {
        backgroundColor: '#1a73e8', borderRadius: 8, paddingHorizontal: 18,
        paddingVertical: 12, justifyContent: 'center',
    },
    postBtnText: { color: '#fff', fontWeight: '700' },
    hintBox: {
        padding: 12, backgroundColor: '#fff3e0', borderRadius: 8,
        borderWidth: 1, borderColor: '#ffb74d', marginBottom: 16,
    },
    hintTitle: { fontWeight: '700', fontSize: 12, marginBottom: 4, color: '#e65100' },
    hintText: { fontSize: 12, color: '#5d4037' },
});
