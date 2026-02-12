import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttendanceHistoryList = ({ history }) => {
    if (!history || history.length === 0) {
        return <Text style={styles.emptyText}>No recent attendance records.</Text>;
    }

    const renderItem = ({ item }) => {
        const isPresent = item.status === 'present';
        return (
            <View style={styles.item}>
                <View style={styles.dateContainer}>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                    <Text style={styles.day}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isPresent ? '#e8f5e9' : '#ffebee' }]}>
                    <Ionicons
                        name={isPresent ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={isPresent ? '#28a745' : '#dc3545'}
                    />
                    <Text style={[styles.statusText, { color: isPresent ? '#28a745' : '#dc3545' }]}>
                        {isPresent ? 'Present' : 'Absent'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recent Attendance</Text>
            {history.map((item, index) => (
                <View key={index} style={styles.wrapper}>
                    {renderItem({ item })}
                </View>
            ))}
            {/* Use map instead of FlatList if inside a ScrollView to avoid nesting errors */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    wrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    dateContainer: {
        flexDirection: 'column',
    },
    date: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    day: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
    },
    statusText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default AttendanceHistoryList;
