import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { WebLink } from '../../types';

interface Point {
    x: number;
    y: number;
}

interface PatternDrawProps {
    visible: boolean;
    onClose: () => void;
    onPatternDraw: (pattern: string, shouldHide?: boolean, action?: 'hide' | 'unhide') => void;
    mode?: 'hide' | 'attach' | 'unlock'; // 'hide' for group hiding, 'attach' for link attachment, 'unlock' for pattern verification
    links?: WebLink[]; // For auto-navigation on pattern match
    onNavigate?: (url: string, title: string) => void; // Callback for navigation
}

export const PatternDraw = ({ visible, onClose, onPatternDraw, mode = 'hide', links = [], onNavigate }: PatternDrawProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [points, setPoints] = React.useState<Point[]>([]);
    const [patternCode, setPatternCode] = React.useState('');
    const [patternAction, setPatternAction] = React.useState<'hide' | 'unhide'>('hide'); // Changed to action-based
    const [currentPosition, setCurrentPosition] = React.useState<Point | null>(null); // Track current finger position for smooth line
    const canvasRef = useRef<View>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const gridSize = 3;
    const canvasSize = 300;
    const cellSize = canvasSize / gridSize;

    // Set up auto-close timer when modal becomes visible
    React.useEffect(() => {
        if (visible) {
            // Start 5 second idle timer
            idleTimerRef.current = setTimeout(() => {
                setPoints([]);
                setPatternCode('');
                setPatternAction('hide');
                setCurrentPosition(null);
                onClose();
            }, 5000);

            return () => {
                if (idleTimerRef.current) {
                    clearTimeout(idleTimerRef.current);
                }
            };
        }
    }, [visible, onClose]);

    // Reset idle timer whenever user starts drawing
    const resetIdleTimer = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
            setPoints([]);
            setPatternCode('');
            setPatternAction('hide');
            setCurrentPosition(null);
            onClose();
        }, 5000);
    };

    // Create 3x3 grid of points for pattern
    const createGridPoints = () => {
        const gridPoints: Point[] = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                gridPoints.push({
                    x: cellSize * j + cellSize / 2,
                    y: cellSize * i + cellSize / 2,
                });
            }
        }
        return gridPoints;
    };

    const gridPoints = createGridPoints();

    const handleCanvasPress = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;

        // Reset idle timer when user starts interacting
        resetIdleTimer();

        // Find closest grid point - only connect if finger is directly on the dot
        let closest: { point: Point; index: number } | null = null;
        let minDistance = Infinity;
        const touchRadius = 28; // Increased to 28px for quicker linking

        for (let i = 0; i < gridPoints.length; i++) {
            const point = gridPoints[i];
            const distance = Math.sqrt(
                Math.pow(locationX - point.x, 2) + Math.pow(locationY - point.y, 2)
            );

            if (distance < minDistance && distance < touchRadius) {
                minDistance = distance;
                closest = { point, index: i };
            }
        }

        // Show preview line only when finger is on a dot
        if (points.length > 0) {
            if (closest) {
                // Only show line when finger is exactly on a dot
                setCurrentPosition({ x: closest.point.x, y: closest.point.y });
            } else {
                // Clear preview line when finger is not on a dot
                setCurrentPosition(null);
            }
        }

        if (closest) {
            const closestPoint = closest.point;
            const closestIndex = closest.index;
            const isAlreadySelected = points.some(
                (p: Point) => p.x === closestPoint.x && p.y === closestPoint.y
            );
            if (!isAlreadySelected) {
                setPoints([...points, { x: closestPoint.x, y: closestPoint.y }]);
                setPatternCode(prev => prev + closestIndex);
            }
        }
    };

    const checkPatternMatch = (pattern: string) => {
        if (mode === 'unlock' && pattern.length >= 4) {
            // Look for a matching pattern in the links
            const matchedLink = links.find(link => link.pattern === pattern);
            if (matchedLink && onNavigate) {
                // Found a match - navigate immediately
                onNavigate(matchedLink.url, matchedLink.title);
                resetPattern();
                onClose();
                return true;
            }
        }
        return false;
    };

    const handleCanvasRelease = () => {
        // Clear the current position line
        setCurrentPosition(null);

        // Check if pattern matches any existing link pattern when gesture is lost
        if (patternCode.length >= 4) {
            const matched = checkPatternMatch(patternCode);

            // If no match, reset after 1 second to let user see the complete pattern
            if (!matched) {
                setTimeout(() => {
                    resetPattern();
                }, 1000);
            }
        } else if (patternCode.length > 0) {
            // If pattern is incomplete, clear after 1 second
            setTimeout(() => {
                resetPattern();
            }, 1000);
        }
    };

    const handleSubmit = () => {
        if (patternCode.length >= 4) {
            // Check for auto-match first
            if (!checkPatternMatch(patternCode)) {
                // No match, use normal flow
                onPatternDraw(patternCode, mode === 'attach' ? undefined : patternAction === 'hide', mode === 'attach' ? patternAction : undefined);
            }
            resetPattern();
            onClose();
        }
    };

    const resetPattern = () => {
        setPoints([]);
        setPatternCode('');
        setPatternAction('hide');
    };

    const handleCancel = () => {
        resetPattern();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <TouchableWithoutFeedback onPress={handleCancel}>
                <View style={[styles.overlay, isDark && styles.overlayDark]}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, isDark && styles.containerDark]}>
                            <View
                                ref={canvasRef}
                                style={[styles.canvas, isDark && styles.canvasDark]}
                                onStartShouldSetResponder={() => true}
                                onResponderGrant={handleCanvasPress}
                                onResponderMove={handleCanvasPress}
                                onResponderRelease={handleCanvasRelease}
                            >
                                {/* SVG overlay for smooth lines */}
                                <Svg
                                    width={canvasSize}
                                    height={canvasSize}
                                    style={styles.svgOverlay}
                                    pointerEvents="none"
                                >
                                    {/* Draw lines between connected points */}
                                    {points.length > 1 && points.map((point, index) => {
                                        if (index === 0) return null;
                                        const prevPoint = points[index - 1];
                                        return (
                                            <Line
                                                key={`line-${index}`}
                                                x1={prevPoint.x}
                                                y1={prevPoint.y}
                                                x2={point.x}
                                                y2={point.y}
                                                stroke={theme.colors.primary}
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                opacity="0.7"
                                            />
                                        );
                                    })}

                                    {/* Draw live line from last point to current finger position */}
                                    {points.length > 0 && currentPosition !== null && (
                                        <Line
                                            x1={points[points.length - 1].x}
                                            y1={points[points.length - 1].y}
                                            x2={currentPosition.x}
                                            y2={currentPosition.y}
                                            stroke={theme.colors.primary}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            opacity="0.7"
                                        />
                                    )}
                                </Svg>

                                {/* Grid dots */}
                                {gridPoints.map((point, index) => {
                                    const isInPattern = points.some(p => p.x === point.x && p.y === point.y);
                                    return (
                                        <View
                                            key={index}
                                            style={[
                                                styles.dotContainer,
                                                {
                                                    left: point.x - (isInPattern ? 14 : 8),
                                                    top: point.y - (isInPattern ? 14 : 8),
                                                },
                                                isInPattern && styles.dotContainerActive,
                                            ]}
                                        />
                                    );
                                })}
                            </View>

                            {/* Action selector for attach mode */}
                            {mode === 'attach' && (
                                <View style={styles.actionContainer}>
                                    <Text style={[styles.actionLabel, isDark && styles.actionLabelDark]}>
                                        Pattern Action:
                                    </Text>
                                    <View style={styles.actionButtonsGroup}>
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                patternAction === 'hide' && styles.actionButtonActive,
                                                isDark && styles.actionButtonDark,
                                            ]}
                                            onPress={() => setPatternAction('hide')}
                                        >
                                            <Ionicons
                                                name="eye-off"
                                                size={18}
                                                color={patternAction === 'hide' ? theme.colors.primary : (isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary)}
                                            />
                                            <Text
                                                style={[
                                                    styles.actionButtonText,
                                                    patternAction === 'hide' && styles.actionButtonTextActive,
                                                    isDark && styles.actionButtonTextDark,
                                                ]}
                                            >
                                                Hide
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                patternAction === 'unhide' && styles.actionButtonActive,
                                                isDark && styles.actionButtonDark,
                                            ]}
                                            onPress={() => setPatternAction('unhide')}
                                        >
                                            <Ionicons
                                                name="eye"
                                                size={18}
                                                color={patternAction === 'unhide' ? theme.colors.primary : (isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary)}
                                            />
                                            <Text
                                                style={[
                                                    styles.actionButtonText,
                                                    patternAction === 'unhide' && styles.actionButtonTextActive,
                                                    isDark && styles.actionButtonTextDark,
                                                ]}
                                            >
                                                Unhide
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Submit button only shown for attach mode */}
                            {mode === 'attach' && (
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.submitButton,
                                        patternCode.length < 4 && styles.submitButtonDisabled,
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={patternCode.length < 4}
                                >
                                    <Text style={styles.submitButtonText}>
                                        Attach Pattern
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayDark: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        width: '85%',
        maxWidth: 400,
    },
    containerDark: {
        backgroundColor: theme.colors.dark.surface,
    },
    canvas: {
        width: 300,
        height: 300,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        alignSelf: 'center',
        marginBottom: theme.spacing.md,
        position: 'relative',
        overflow: 'hidden',
    },
    canvasDark: {
        backgroundColor: theme.colors.dark.backgroundSecondary,
        borderColor: theme.colors.dark.border,
    },
    dot: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotContainer: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.textTertiary,
    },
    dotContainerActive: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
    },
    dotInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.textTertiary,
    },
    dotActive: {
        backgroundColor: theme.colors.primaryLight,
    },
    dotInnerActive: {
        backgroundColor: theme.colors.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    svgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    hideToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.sm,
    },
    hideToggleActive: {
        backgroundColor: `${theme.colors.primary}15`,
        borderColor: theme.colors.primary,
    },
    hideToggleText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    hideToggleTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    actionContainer: {
        marginBottom: theme.spacing.md,
    },
    actionLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '600',
    },
    actionLabelDark: {
        color: theme.colors.dark.textSecondary,
    },
    actionButtonsGroup: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.xs,
    },
    actionButtonDark: {
        backgroundColor: theme.colors.dark.surface,
        borderColor: theme.colors.dark.border,
    },
    actionButtonActive: {
        backgroundColor: `${theme.colors.primary}15`,
        borderColor: theme.colors.primary,
    },
    actionButtonText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    actionButtonTextDark: {
        color: theme.colors.dark.textSecondary,
    },
    actionButtonTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        ...theme.typography.body,
        color: 'white',
        fontWeight: '600',
    },
});
