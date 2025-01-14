import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const Card = ({
    children,
    title,
    subtitle,
    footer,
    onPress,
    elevation = 1,
    className = '',
    contentClassName = '',
    ...props
}) => {
    const elevationStyles = {
        0: 'shadow-none',
        1: 'shadow-sm',
        2: 'shadow',
        3: 'shadow-md',
        4: 'shadow-lg',
    };

    const CardComponent = onPress ? StyledTouchableOpacity : StyledView;

    return (
        <CardComponent
            onPress={onPress}
            className={`
        bg-white
        rounded-lg
        overflow-hidden
        ${elevationStyles[elevation]}
        ${className}
      `}
            {...props}
        >
            {(title || subtitle) && (
                <StyledView className="px-4 pt-4 pb-2">
                    {title && (
                        <StyledText className="text-lg font-bold text-neutral-800">
                            {title}
                        </StyledText>
                    )}
                    {subtitle && (
                        <StyledText className="text-sm text-neutral-500 mt-1">
                            {subtitle}
                        </StyledText>
                    )}
                </StyledView>
            )}

            <StyledView className={`px-4 py-3 ${contentClassName}`}>
                {children}
            </StyledView>

            {footer && (
                <StyledView className="px-4 py-3 border-t border-neutral-200">
                    {footer}
                </StyledView>
            )}
        </CardComponent>
    );
};

export default styled(Card);