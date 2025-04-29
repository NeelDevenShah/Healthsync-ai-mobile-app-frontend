import api from './axios';
import FormData from 'form-data';

export const uploadPrescription = async (prescriptionImage, metadata = {}) => {
    const formData = new FormData();

    console.log(prescriptionImage)

    // Add metadata if provided
    Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
    });

    // Add prescription image
    const fileUri = prescriptionImage.uri;
    const fileName = fileUri.split('/').pop();
    const fileType = 'image/jpeg'; // Adjust based on actual image type

    formData.append('prescriptionImage', {
        uri: fileUri,
        name: fileName,
        type: fileType
    });

    console.log("formdata:", formData.get("prescriptionImage"));

    const response = await api.post('/medications', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getMedication = async (medicationId) => {
    const response = await api.get(`/medications/${medicationId}`);
    return response.data;
};

export const updateMedication = async (medicationId, updateData) => {
    const response = await api.put(`/medications/${medicationId}`, updateData);
    return response.data;
};

export const parsePrescription = async (medicationId) => {
    const response = await api.post(`/medications/${medicationId}/parse`);
    return response.data;
};

export const markMedicationTaken = async (medicationId, medicationIndex, scheduleIndex, takenAt = new Date()) => {
    const response = await api.put(`/medications/${medicationId}/taken`, {
        medicationIndex,
        scheduleIndex,
        takenAt
    });

    return response.data;
};

export const getUpcomingMedications = async (days = 1) => {
    const response = await api.get('/medications/upcoming', {
        params: { days }
    });

    return response.data;
};