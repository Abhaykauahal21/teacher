import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FeesSummaryCard = ({ fees }) => {
    if (!fees) return null;

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.item}>
                    <Text style={styles.label}>Total Fees</Text>
                    <Text style={styles.value}>₹{fees.total.toLocaleString()}</Text>
                </View>
                <View style={[styles.item, styles.border]}>
                    <Text style={styles.label}>Paid</Text>
                    <Text style={[styles.value, { color: '#28a745' }]}>₹{fees.paid.toLocaleString()}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.label}>Pending</Text>
                    <Text style={[styles.value, { color: '#dc3545' }]}>₹{fees.remaining.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        flex: 1,
        alignItems: 'center',
    },
    border: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#eee',
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600'
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default FeesSummaryCard;
