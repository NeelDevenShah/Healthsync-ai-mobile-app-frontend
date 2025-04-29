import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    touched,
    leftIcon,
    rightIcon,
    keyboardType,
    autoCapitalize = 'none',
    disabled = false,
    multiline = false,
    numberOfLines = 1,
    className = '',
    inputClassName = '',
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <StyledView className={`mb-4 ${className}`}>
            {label && (
                <StyledText className="text-neutral-700 font-medium mb-1">
                    {label}
                </StyledText>
            )}

            <StyledView className="relative">
                {leftIcon && (
                    <StyledView className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        {leftIcon}
                    </StyledView>
                )}

                <StyledTextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    className={`
            bg-white
            border
            rounded-lg
            px-4
            py-3
            text-neutral-800
            ${leftIcon ? 'pl-10' : ''}
            ${(secureTextEntry || rightIcon) ? 'pr-10' : ''}
            ${disabled ? 'bg-neutral-100 text-neutral-500' : ''}
            ${error && touched ? 'border-error' : 'border-neutral-300'}
            ${multiline ? 'min-h-[100px] text-top' : ''}
            ${inputClassName}
          `}
                    {...props}
                />

                {(secureTextEntry || rightIcon) && (
                    <StyledTouchableOpacity
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                        onPress={secureTextEntry ? togglePasswordVisibility : null}
                    >
                        {secureTextEntry ? (
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off' : 'eye'}
                                size={20}
                                color="#6b7280"
                            />
                        ) : (
                            rightIcon
                        )}
                    </StyledTouchableOpacity>
                )}
            </StyledView>

            {error && touched && (
                <StyledText className="text-error text-sm mt-1">
                    {error}
                </StyledText>
            )}
        </StyledView>
    );
};

export default styled(Input);