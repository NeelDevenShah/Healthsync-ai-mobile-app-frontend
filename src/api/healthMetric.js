import api from './axios';

export const recordHealthMetric = async (metricData) => {
    const response = await api.post('/health-metrics', metricData);
    return response.data;
};

export const getHealthMetrics = async (filters = {}) => {
    const response = await api.get('/health-metrics', {
        params: filters
    });
    return response.data;
};

export const getDashboard = async (timeframe = '7d') => {
    const response = await api.get('/health-metrics/dashboard', {
        params: { timeframe }
    });
    return response.data;
};

export const getAbnormalReadings = async (timeframe = '7d') => {
    const response = await api.get('/health-metrics/abnormal', {
        params: { timeframe }
    });
    return response.data;
};

export const getRecommendations = async () => {
    const response = await api.get('/health-metrics/recommendations');
    return response.data;
};