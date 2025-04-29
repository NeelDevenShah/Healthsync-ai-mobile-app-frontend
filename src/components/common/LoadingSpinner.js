import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const LoadingSpinner = ({
    text = 'Loading...',
    fullScreen = false,
    size = 'large',
    color = '#1766da',
    className = '',
    ...props
}) => {
    return (
        <StyledView
            className={`
        items-center 
        justify-center 
        ${fullScreen ? 'flex-1 w-screen h-screen absolute inset-0 bg-white bg-opacity-90 z-50' : 'py-4'}
        ${className}
      `}
            {...props}
        >
            <ActivityIndicator size={size} color={color} />
            {text && (
                <StyledText className="text-neutral-600 mt-2 font-medium">
                    {text}
                </StyledText>
            )}
        </StyledView>
    );
};

export default styled(LoadingSpinner);