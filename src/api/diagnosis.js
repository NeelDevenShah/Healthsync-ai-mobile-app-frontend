import api from './axios';
import FormData from 'form-data';

export const startDiagnosis = async (symptomDescription) => {
    const response = await api.post('/diagnoses', { symptomDescription });
    return response.data;
};

export const getDiagnosis = async (diagnosisId) => {
    const response = await api.get(`/diagnoses/${diagnosisId}`);
    return response.data;
};

export const addMessage = async (diagnosisId, message, attachments = []) => {
    // If there are attachments, use FormData
    if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('role', 'patient');

        attachments.forEach((attachment, index) => {
            const fileUri = attachment.uri;
            const fileName = fileUri.split('/').pop();
            const fileType = 'image/jpeg'; // Default to jpeg, adjust based on your needs

            formData.append('attachments', {
                uri: fileUri,
                name: fileName,
                type: fileType
            });
        });

        const response = await api.put(`/diagnoses/${diagnosisId}/message`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } else {
        // Regular JSON request if no attachments
        const response = await api.put(`/diagnoses/${diagnosisId}/message`, {
            message,
            role: 'patient'
        });

        return response.data;
    }
};

export const completeDiagnosis = async (diagnosisId) => {
    const response = await api.put(`/diagnoses/${diagnosisId}/complete`);
    return response.data;
};

export const selectDoctor = async (diagnosisId, doctorId) => {
    const response = await api.put(`/diagnoses/${diagnosisId}/doctor`, { doctorId });
    return response.data;
};

export const modifyTests = async (diagnosisId, tests, additionalTests) => {
    const response = await api.put(`/diagnoses/${diagnosisId}/tests`, {
        tests,
        additionalTests
    });
    return response.data;
};

export const approveDiagnosis = async (diagnosisId, modifications) => {
    const response = await api.put(`/diagnoses/${diagnosisId}/approve`, modifications);
    return response.data;
};