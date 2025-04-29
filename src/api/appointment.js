import api from './axios';

export const getAppointment = async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
};

export const cancelAppointment = async (appointmentId, cancelReason) => {
    const response = await api.delete(`/appointments/${appointmentId}`, {
        data: { cancelReason }
    });
    return response.data;
};

export const getAppointmentReports = async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}/reports`);
    return response.data;
};