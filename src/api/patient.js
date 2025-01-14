import api from './axios';

export const getPatientProfile = async () => {
    const response = await api.get('/patients/profile');
    return response.data;
};

export const updatePatientProfile = async (profileData) => {
    const response = await api.put('/patients/profile', profileData);
    return response.data;
};

export const getPatientAppointments = async (filters = {}) => {
    const response = await api.get('/patients/appointments', { params: filters });
    return response.data;
};

export const getPatientDiagnoses = async (filters = {}) => {
    const response = await api.get('/patients/diagnoses', { params: filters });
    return response.data;
};

export const getPatientMedications = async (includeExpired = false) => {
    const response = await api.get('/patients/medications', {
        params: { includeExpired }
    });
    return response.data;
};

export const getPatientReports = async (filters = {}) => {
    const response = await api.get('/patients/reports', { params: filters });
    return response.data;
};

export const getHealthMetrics = async (filters = {}) => {
    const response = await api.get('/patients/health-metrics', { params: filters });
    return response.data;
};

export const addHealthMetric = async (metricData) => {
    const response = await api.post('/patients/health-metrics', metricData);
    return response.data;
};

export const getHealthDashboard = async (timeframe = '7d') => {
    const response = await api.get('/patients/health-metrics/dashboard', {
        params: { timeframe }
    });
    return response.data;
};

export const getAbnormalReadings = async (timeframe = '7d') => {
    const response = await api.get('/patients/health-metrics/abnormal', {
        params: { timeframe }
    });
    return response.data;
};

export const getHealthRecommendations = async () => {
    const response = await api.get('/patients/health-metrics/recommendations');
    return response.data;
};

export const cancelAppointment = async (appointmentId, cancelReason) => {
    const response = await api.patch(`/patients/appointments/${appointmentId}/cancel`, {
        cancelReason
    });
    return response.data;
};

export const getUpcomingMedications = async (days = 1) => {
    const response = await api.get('/patients/medications/upcoming', {
        params: { days }
    });
    return response.data;
};