import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const Badge = ({
    text,
    variant = 'primary',
    size = 'medium',
    icon = null,
    className = '',
    textClassName = '',
    ...props
}) => {
    // Define variant styles
    const variantStyles = {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        accent: 'bg-indigo-100 text-indigo-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        neutral: 'bg-neutral-100 text-neutral-800',
    };

    // Define size styles
    const sizeStyles = {
        small: 'text-xs px-2 py-0.5',
        medium: 'text-sm px-2.5 py-0.5',
        large: 'text-base px-3 py-1',
    };

    return (
        <StyledView
            className={`
        rounded-full
        items-center
        justify-center
        flex-row
        ${variantStyles[variant].split(' ')[0]}
        ${className}
      `}
            {...props}
        >
            {icon && <StyledView className="mr-1">{icon}</StyledView>}
            <StyledText
                className={`
          font-medium
          ${variantStyles[variant].split(' ')[1]}
          ${sizeStyles[size]}
          ${textClassName}
        `}
            >
                {text}
            </StyledText>
        </StyledView>
    );
};

export default styled(Badge);