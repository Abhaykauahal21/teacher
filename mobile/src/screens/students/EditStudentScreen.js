import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const EditStudentScreen = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { student } = route.params;

    const [name, setName] = useState(student.name);
    const [phone, setPhone] = useState(student.phone);
    const [parentPhone, setParentPhone] = useState(student.parentPhone || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Name and Phone are required');
            return;
        }

        setLoading(true);
        try {
            await client.put(`/students/${student._id}`, {
                name,
                phone,
                parentPhone
            });
            // Navigate back? We could navigate back to BatchDetails which will refresh on focus.
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Student Name</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Enter Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Student Phone</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Enter Phone Number"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Parent Phone (Optional)</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Enter Parent Phone"
                placeholderTextColor={colors.textSecondary}
                value={parentPhone}
                onChangeText={setParentPhone}
                keyboardType="phone-pad"
                maxLength={10}
            />

            <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Student</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        marginTop: 10,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditStudentScreen;
