import React from 'react';
import { View, Text, Image } from 'react-native';
import { styled } from 'nativewind';
import Button from './Button';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const EmptyState = ({
    title,
    message,
    icon,
    image,
    actionLabel,
    onAction,
    className = '',
    ...props
}) => {
    return (
        <StyledView
            className={`
        items-center
        justify-center
        py-10
        px-4
        ${className}
      `}
            {...props}
        >
            {icon && (
                <StyledView className="mb-4">
                    {icon}
                </StyledView>
            )}

            {image && (
                <StyledImage
                    source={image}
                    className="w-40 h-40 mb-4"
                    resizeMode="contain"
                />
            )}

            {title && (
                <StyledText className="text-lg font-bold text-neutral-800 text-center mb-2">
                    {title}
                </StyledText>
            )}

            {message && (
                <StyledText className="text-neutral-600 text-center mb-6 max-w-xs">
                    {message}
                </StyledText>
            )}

            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                />
            )}
        </StyledView>
    );
};

export default styled(EmptyState);