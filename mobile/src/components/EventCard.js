import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeInRight
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';

const EventCard = ({ title, date, onPress, type = 'generic', index = 0 }) => {
    const { theme, colors } = useTheme();

    if (type === 'republic-day') {
        const wheelRotation = useSharedValue(0);
        const shimmerPosition = useSharedValue(-100);

        useEffect(() => {
            wheelRotation.value = withRepeat(
                withTiming(360, { duration: 8000, easing: Easing.linear }),
                -1,
                false
            );
            shimmerPosition.value = withRepeat(
                withTiming(200, { duration: 2500, easing: Easing.linear }),
                -1,
                false
            );
        }, []);

        const wheelStyle = useAnimatedStyle(() => ({
            transform: [{ rotate: `${wheelRotation.value}deg` }],
        }));

        const shimmerStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: shimmerPosition.value }],
        }));

        return (
            <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={[styles.card, styles.republicCard]}
                >
                    {/* Artistic Flag Background */}
                    <View style={styles.flagContainer}>
                        <LinearGradient
                            colors={['#FF9933', '#FFB366']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.flagBand}
                        />
                        <View style={[styles.flagBand, styles.whiteBand]}>
                            <Ionicons name="apps" size={12} color="rgba(0,0,0,0.03)" style={{ position: 'absolute', top: 5, left: 10 }} />
                            <Ionicons name="apps" size={16} color="rgba(0,0,0,0.03)" style={{ position: 'absolute', bottom: 5, right: 30 }} />
                        </View>
                        <LinearGradient
                            colors={['#138808', '#2E8B57']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.flagBand}
                        />
                    </View>

                    {/* Central Chakra with Glow */}
                    <View style={styles.chakraWrapper}>
                        <View style={styles.chakraGlow} />
                        <Animated.View style={[styles.chakraContainer, wheelStyle]}>
                            <Ionicons name="aperture" size={42} color="#000080" />
                        </Animated.View>
                    </View>

                    {/* Glassmorphism Content Overlay */}
                    <BlurView intensity={20} tint="light" style={styles.glassOverlay}>
                        <View style={styles.contentRow}>
                            <View>
                                <View style={styles.datePill}>
                                    <Text style={styles.dateText}>{date}</Text>
                                </View>
                                <Text style={styles.eventTitle}>Republic Day</Text>
                                <Text style={styles.eventSubtitle}>Celebrate Unity</Text>
                            </View>
                        </View>
                    </BlurView>

                    {/* Shimmer Effect */}
                    <Animated.View style={[styles.shimmer, shimmerStyle]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // Generic Fallback
    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[styles.card, { backgroundColor: theme.dark ? '#1E293B' : '#fff' }]}
            >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        width: 190,
        height: 110,
        justifyContent: 'space-between',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
        position: 'relative',
    },
    republicCard: {
        backgroundColor: '#fff',
        borderWidth: 0,
    },
    flagContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
    },
    flagBand: {
        flex: 1,
    },
    whiteBand: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chakraWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    chakraContainer: {
        opacity: 0.9,
    },
    chakraGlow: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,128,0.1)',
        transform: [{ scale: 1.5 }],
    },
    glassOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        justifyContent: 'center',
        zIndex: 2,
    },
    contentRow: {
        paddingHorizontal: 14,
        paddingBottom: 4,
    },
    datePill: {
        backgroundColor: '#000080',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 9,
        color: '#fff',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: 0.5,
    },
    eventSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },
    shimmer: {
        ...StyleSheet.absoluteFillObject,
        width: '50%',
        transform: [{ skewX: '-20deg' }],
        zIndex: 5,
    },
    // Generic styles
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 16,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginHorizontal: 16,
        marginBottom: 16,
    }
});

export default EventCard;
