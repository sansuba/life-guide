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

interface Point {
    x: number;
    y: number;
}

interface PatternDrawProps {
    visible: boolean;
    onClose: () => void;
    onPatternDraw: (pattern: string) => void;
}

export const PatternDraw = ({ visible, onClose, onPatternDraw }: PatternDrawProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [points, setPoints] = React.useState<Point[]>([]);
    const [patternCode, setPatternCode] = React.useState('');
    const canvasRef = useRef<View>(null);
    const gridSize = 3;
    const dotRadius = 20;
    const canvasSize = 300;
    const cellSize = canvasSize / gridSize;

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

        // Find closest grid point
        let closest: { point: Point; index: number } | null = null;
        let minDistance = Infinity;

        for (let i = 0; i < gridPoints.length; i++) {
            const point = gridPoints[i];
            const distance = Math.sqrt(
                Math.pow(locationX - point.x, 2) + Math.pow(locationY - point.y, 2)
            );

            if (distance < minDistance && distance < 50) {
                minDistance = distance;
                closest = { point, index: i };
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

    const handleSubmit = () => {
        if (patternCode.length >= 4) {
            onPatternDraw(patternCode);
            resetPattern();
            onClose();
        }
    };

    const resetPattern = () => {
        setPoints([]);
        setPatternCode('');
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
                            <View style={styles.header}>
                                <Text style={[styles.title, isDark && styles.titleDark]}>
                                    Draw Pattern
                                </Text>
                                <TouchableOpacity onPress={handleCancel}>
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={isDark ? theme.colors.dark.text : theme.colors.text}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                                Connect at least 4 dots to create a pattern
                            </Text>

                            <View
                                ref={canvasRef}
                                style={[styles.canvas, isDark && styles.canvasDark]}
                                onStartShouldSetResponder={() => true}
                                onResponderGrant={handleCanvasPress}
                                onResponderMove={handleCanvasPress}
                            >
                                {/* Grid dots */}
                                {gridPoints.map((point, index) => {
                                    const isInPattern = points.some(p => p.x === point.x && p.y === point.y);
                                    return (
                                        <View
                                            key={index}
                                            style={[
                                                styles.dot,
                                                {
                                                    left: point.x - dotRadius / 2,
                                                    top: point.y - dotRadius / 2,
                                                },
                                                isInPattern && styles.dotActive,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.dotInner,
                                                    isInPattern && styles.dotInnerActive,
                                                ]}
                                            />
                                        </View>
                                    );
                                })}

                                {/* Connection lines */}
                                {points.map((point, index) => {
                                    if (index === 0) return null;
                                    const prevPoint = points[index - 1];
                                    return (
                                        <View
                                            key={`line-${index}`}
                                            style={[
                                                styles.line,
                                                {
                                                    left: prevPoint.x,
                                                    top: prevPoint.y,
                                                    width: Math.sqrt(
                                                        Math.pow(point.x - prevPoint.x, 2) +
                                                        Math.pow(point.y - prevPoint.y, 2)
                                                    ),
                                                    transform: [
                                                        {
                                                            rotate: `${Math.atan2(
                                                                point.y - prevPoint.y,
                                                                point.x - prevPoint.x
                                                            )}rad`,
                                                        },
                                                    ],
                                                },
                                            ]}
                                        />
                                    );
                                })}
                            </View>

                            <View style={styles.info}>
                                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                    Pattern: {patternCode.length > 0 ? patternCode : 'Empty'}
                                </Text>
                                <Text style={[styles.infoSubtext, isDark && styles.infoSubtextDark]}>
                                    {patternCode.length < 4
                                        ? `${4 - patternCode.length} more dots needed`
                                        : 'Ready to save!'}
                                </Text>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.resetButton]}
                                    onPress={resetPattern}
                                >
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.submitButton,
                                        patternCode.length < 4 && styles.submitButtonDisabled,
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={patternCode.length < 4}
                                >
                                    <Text style={styles.submitButtonText}>Save Pattern</Text>
                                </TouchableOpacity>
                            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    titleDark: {
        color: theme.colors.dark.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    subtitleDark: {
        color: theme.colors.dark.textSecondary,
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
    line: {
        position: 'absolute',
        height: 3,
        backgroundColor: theme.colors.primary,
        opacity: 0.7,
    },
    info: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    infoText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontSize: 14,
    },
    infoTextDark: {
        color: theme.colors.dark.text,
    },
    infoSubtext: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    infoSubtextDark: {
        color: theme.colors.dark.textSecondary,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    resetButtonText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontWeight: '600',
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
