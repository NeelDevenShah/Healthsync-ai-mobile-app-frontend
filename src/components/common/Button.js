import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    ...props
}) => {
    // Define variant styles
    const variantStyles = {
        primary: 'bg-primary-500 border-primary-500',
        secondary: 'bg-secondary-500 border-secondary-500',
        outline: 'bg-transparent border-primary-500',
        ghost: 'bg-transparent border-transparent',
        success: 'bg-success border-success',
        warning: 'bg-warning border-warning',
        error: 'bg-error border-error',
    };

    const textStyles = {
        primary: 'text-white',
        secondary: 'text-white',
        outline: 'text-primary-500',
        ghost: 'text-primary-500',
        success: 'text-white',
        warning: 'text-white',
        error: 'text-white',
    };

    // Define size styles
    const sizeStyles = {
        small: 'px-3 py-1',
        medium: 'px-4 py-2',
        large: 'px-6 py-3',
    };

    const textSizeStyles = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
    };

    return (
        <StyledTouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
        rounded-lg border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50' : 'opacity-100'}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed' : ''}
        flex flex-row items-center justify-center
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? '#1766da' : '#FFFFFF'}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <StyledView className="mr-2">{icon}</StyledView>
                    )}
                    <StyledText
                        className={`
              font-medium
              ${textStyles[variant]}
              ${textSizeStyles[size]}
            `}
                    >
                        {title}
                    </StyledText>
                    {icon && iconPosition === 'right' && (
                        <StyledView className="ml-2">{icon}</StyledView>
                    )}
                </>
            )}
        </StyledTouchableOpacity>
    );
};

export default styled(Button);