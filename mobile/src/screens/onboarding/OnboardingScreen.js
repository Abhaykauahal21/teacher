import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated as RNAnimated, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const onboardingData = [

    {
        id: 1,
        title: 'Welcome',
        description:
            'Welcome to a smart app built for teachers to manage student fees and track attendance effortlessly, all in one place.',
        lottie: require('../../../Welcome.json'),
    },
    {
        id: 2,
        title: 'Attendance Made Simple',
        description:
            'Mark daily attendance batch-wise, track student presence, and view attendance percentages in real time.',
        lottie: require('../../../attendence.json'),
    },
    {
        id: 3,
        title: 'Smart Fees Management',
        description:
            'Track collected fees, pending payments, and student-wise records with a clear and organized dashboard.',
        lottie: require('../../../money.json'),
    },
    {
        id: 4,
        title: 'Let’s Begin',
        description:
            'You’re all set! Start managing your students, attendance, and fees smarter from today.',
        lottie: require('../../../rocket.json'),
    },


];

import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = ({ onDone }) => {
    const navigation = useNavigation();
    const { theme, isDarkMode } = useTheme();
    const { colors } = theme;
    const pagerRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageSelected = (e) => {
        setCurrentPage(e.nativeEvent.position);
    };

    const handleNext = () => {
        if (currentPage < onboardingData.length - 1) {
            pagerRef.current?.setPage(currentPage + 1);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        if (onDone) {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            onDone();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />

            <PagerView
                style={styles.pagerView}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={handlePageSelected}
            >
                {onboardingData.map((item, index) => (
                    <View key={item.id} style={styles.page}>
                        <View style={styles.animationContainer}>
                            <LottieView
                                source={item.lottie}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </PagerView>

            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: currentPage === index ? colors.primary : colors.border,
                                    width: currentPage === index ? 24 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {currentPage === onboardingData.length - 1 ? (
                        <TouchableOpacity
                            style={[styles.button, styles.getStartedButton, { backgroundColor: colors.primary }]}
                            onPress={handleFinish}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.getStartedText}>Get Started</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.navButtons}>
                            <TouchableOpacity
                                onPress={handleSkip}
                                style={styles.skipButton}
                            >
                                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleNext}
                                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="arrow-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    animationContainer: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    controls: {
        height: 60,
        justifyContent: 'center',
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        gap: 8,
    },
    getStartedText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
