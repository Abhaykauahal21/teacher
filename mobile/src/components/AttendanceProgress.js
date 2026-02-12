import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AttendanceProgress = ({ percentage, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = circumference - (percentage / 100) * circumference;

    // Determine color based on percentage
    let color = '#dc3545'; // Red (< 50%)
    if (percentage >= 75) color = '#28a745'; // Green
    else if (percentage >= 50) color = '#ffc107'; // Yellow

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    stroke="#e6e6e6"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <Circle
                    stroke={color}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Centered Text */}
            <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: size * 0.22, fontWeight: 'bold', color: '#333' }}>
                        {percentage}%
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Attendance</Text>
                </View>
            </View>
        </View>
    );
};

export default AttendanceProgress;
