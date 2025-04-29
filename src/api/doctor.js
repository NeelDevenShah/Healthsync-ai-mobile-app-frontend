import api from './axios';

export const getDoctorProfile = async () => {
    const response = await api.get('/doctors/profile');
    return response.data;
};

export const updateDoctorProfile = async (profileData) => {
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
};

export const getDoctorAppointments = async (filters = {}) => {
    const response = await api.get('/doctors/appointments', { params: filters });
    return response.data;
};

export const getDoctorPatients = async () => {
    const response = await api.get('/doctors/patients');
    return response.data;
};

export const getDoctorSchedule = async () => {
    const response = await api.get('/doctors/schedule');
    return response.data;
};

export const updateDoctorSchedule = async (availableSlots) => {
    const response = await api.put('/doctors/schedule', { availableSlots });
    return response.data;
};

export const getPendingDiagnoses = async () => {
    const response = await api.get('/doctors/pending-reviews');
    return response.data;
};

export const getPendingReports = async () => {
    const response = await api.get('/doctors/pending-reports');
    return response.data;
};

export const approveDiagnosis = async (diagnosisId, modifications) => {
    const response = await api.put(`/doctors/diagnoses/${diagnosisId}/approve`, modifications);
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await api.post('/doctors/appointments', appointmentData);
    return response.data;
};

export const updateAppointment = async (appointmentId, updateData) => {
    const response = await api.put(`/doctors/appointments/${appointmentId}`, updateData);
    return response.data;
};

export const completeAppointment = async (appointmentId, completionData) => {
    const response = await api.post(`/doctors/appointments/${appointmentId}/complete`, completionData);
    return response.data;
};

export const cancelAppointment = async (appointmentId, cancelReason) => {
    const response = await api.patch(`/doctors/appointments/${appointmentId}/cancel`, {
        cancelReason
    });
    return response.data;
};

export const reviewReport = async (reportId, notes) => {
    const response = await api.put(`/doctors/reports/${reportId}/review`, { notes });
    return response.data;
};