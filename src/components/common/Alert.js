import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const Alert = ({
    title,
    message,
    type = 'info',
    onClose,
    className = '',
    ...props
}) => {
    const alertTypes = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            iconName: 'information-circle',
            iconColor: '#3b82f6',
            textColor: 'text-blue-800',
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            iconName: 'checkmark-circle',
            iconColor: '#10b981',
            textColor: 'text-green-800',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            iconName: 'warning',
            iconColor: '#f59e0b',
            textColor: 'text-amber-800',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            iconName: 'alert-circle',
            iconColor: '#ef4444',
            textColor: 'text-red-800',
        },
    };

    const { bg, border, iconName, iconColor, textColor } = alertTypes[type];

    return (
        <StyledView
            className={`
        ${bg}
        ${border}
        border
        rounded-lg
        p-4
        flex-row
        items-start
        ${className}
      `}
            {...props}
        >
            <Ionicons name={iconName} size={24} color={iconColor} style={{ marginRight: 12 }} />

            <StyledView className="flex-1">
                {title && (
                    <StyledText className={`font-bold ${textColor} text-base mb-1`}>
                        {title}
                    </StyledText>
                )}

                <StyledText className={`${textColor}`}>
                    {message}
                </StyledText>
            </StyledView>

            {onClose && (
                <StyledTouchableOpacity
                    onPress={onClose}
                    className="ml-2"
                >
                    <Ionicons name="close" size={20} color="#6b7280" />
                </StyledTouchableOpacity>
            )}
        </StyledView>
    );
};

export default styled(Alert);