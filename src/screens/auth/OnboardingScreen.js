import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import Button from '../../components/common/Button';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const onboardingData = [
    {
        id: '1',
        title: 'Welcome to HealthCare',
        description: 'Your all-in-one healthcare companion for smarter, faster healthcare decisions.',
        image: require('../../../assets/onboarding-1.png'),
    },
    {
        id: '2',
        title: 'AI Diagnosis Assistant',
        description: 'Get an initial assessment of your symptoms with our advanced AI diagnosis assistant.',
        image: require('../../../assets/onboarding-2.png'),
    },
    {
        id: '3',
        title: 'Manage Appointments',
        description: 'Schedule and manage appointments with your healthcare providers seamlessly.',
        image: require('../../../assets/onboarding-3.png'),
    },
    {
        id: '4',
        title: 'Track Medications',
        description: 'Never miss a dose with medication reminders and tracking.',
        image: require('../../../assets/onboarding-4.png'),
    },
];

const OnboardingScreen = () => {
    const navigation = useNavigation();

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    return (
        <StyledView className="flex-1 bg-white">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            <Swiper
                style={styles.wrapper}
                loop={false}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.pagination}
            >
                {onboardingData.map((item) => (
                    <StyledView key={item.id} className="flex-1 items-center justify-center px-5">
                        <StyledImage
                            source={item.image}
                            className="w-64 h-64 mb-10"
                            resizeMode="contain"
                        />
                        <StyledText className="text-2xl font-bold text-primary-500 text-center mb-4">
                            {item.title}
                        </StyledText>
                        <StyledText className="text-base text-neutral-600 text-center px-5 mb-8">
                            {item.description}
                        </StyledText>
                    </StyledView>
                ))}
            </Swiper>

            <StyledView className="px-5 pb-10">
                <Button
                    title="Get Started"
                    onPress={handleGetStarted}
                    fullWidth
                    size="large"
                />
                <StyledText
                    className="text-center mt-4 text-neutral-600"
                    onPress={() => navigation.navigate('Login')}
                >
                    Already have an account? <StyledText className="text-primary-500 font-bold">Sign In</StyledText>
                </StyledText>
            </StyledView>
        </StyledView>
    );
};

const styles = StyleSheet.create({
    wrapper: {},
    dot: {
        backgroundColor: '#E5E7EB',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 4,
        marginRight: 4,
    },
    activeDot: {
        backgroundColor: '#1766da',
        width: 18,
        height: 8,
        borderRadius: 4,
        marginLeft: 4,
        marginRight: 4,
    },
    pagination: {
        bottom: 120,
    },
});

export default OnboardingScreen;