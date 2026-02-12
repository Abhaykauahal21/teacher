import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddBatchScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { colors } = theme;

    const [batchName, setBatchName] = useState('');
    const [classLevel, setClassLevel] = useState('');
    const [timing, setTiming] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreateBatch = async () => {
        if (!batchName || !classLevel || !timing || !monthlyFee) {
            Alert.alert('Incomplete', 'Please fill all details to create a batch.');
            return;
        }

        setSubmitting(true);
        try {
            await client.post('/batches', {
                batchName,
                classLevel,
                timing,
                monthlyFee: Number(monthlyFee)
            });
            Alert.alert('Success', 'Batch created successfully!');
            navigation.goBack();
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Could not create batch. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Batch</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>BATCH NAME</Text>
                            <TextInput
                                placeholder="e.g. Physics - Morning"
                                placeholderTextColor={colors.textSecondary + '80'}
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={batchName}
                                onChangeText={setBatchName}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>CLASS</Text>
                                <TextInput
                                    placeholder="e.g. 12th"
                                    placeholderTextColor={colors.textSecondary + '80'}
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    value={classLevel}
                                    onChangeText={setClassLevel}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>FEE (₹)</Text>
                                <TextInput
                                    placeholder="e.g. 5000"
                                    placeholderTextColor={colors.textSecondary + '80'}
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    value={monthlyFee}
                                    onChangeText={setMonthlyFee}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>TIMING</Text>
                            <TextInput
                                placeholder="e.g. 10:00 AM - 11:30 AM"
                                placeholderTextColor={colors.textSecondary + '80'}
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={timing}
                                onChangeText={setTiming}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: colors.primary }]}
                            onPress={handleCreateBatch}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Batch</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    formContent: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddBatchScreen;
