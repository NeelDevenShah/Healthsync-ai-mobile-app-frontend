import api from './axios';
import FormData from 'form-data';

export const uploadReport = async (reportData, reportFile) => {
    const formData = new FormData();

    console.log(reportFile)

    // Add report metadata
    Object.keys(reportData).forEach(key => {
        formData.append(key, reportData[key]);
    });

    // Add report file
    const fileUri = reportFile.uri;
    const fileName = fileUri.split('/').pop();
    const fileType = 'image/jpeg';

    formData.append('reportFile', {
        uri: fileUri,
        name: fileName,
        type: fileType
    });

    console.log("formdata:", formData.get("reportFile"));

    const response = await api.post('/reports', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    console.log("report:", response.data);

    return response.data;
};

export const getReport = async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
};

export const updateReportNotes = async (reportId, notes) => {
    const response = await api.put(`/reports/${reportId}/notes`, { notes });
    return response.data;
};

export const processReport = async (reportId) => {
    const response = await api.post(`/reports/${reportId}/analyze`);
    return response.data;
};

export const getPendingReports = async (diagnosisId) => {
    const response = await api.get(`/reports/pending/${diagnosisId}`);
    return response.data;
};