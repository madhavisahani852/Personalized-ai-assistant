import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const fetchDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.documents;
};

export const uploadPDF = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const deleteDocument = async (fileId) => {
  const response = await api.delete(`/documents/${fileId}`);
  return response.data;
};

export const sendChatMessage = async ({ question, fileIds = [], history = [], model = 'tinyllama', k = 3 }) => {
  const response = await api.post('/chat', {
    question,
    file_ids: fileIds,
    history,
    model,
    k,
  });
  return response.data;
};

export const generateSummary = async ({ fileId = null, fileIds = [], summaryType = 'comprehensive', model = 'tinyllama' }) => {
  const response = await api.post('/summary', {
    file_id: fileId,
    file_ids: fileIds,
    summary_type: summaryType,
    model,
  });
  return response.data;
};

export const generateQuiz = async ({ fileId = null, fileIds = [], numQuestions = 5, topic = null, model = 'tinyllama' }) => {
  const response = await api.post('/quiz', {
    file_id: fileId,
    file_ids: fileIds,
    num_questions: numQuestions,
    topic,
    model,
  });
  return response.data;
};

export const generateFlashcards = async ({ fileId = null, fileIds = [], numCards = 5, topic = null, model = 'tinyllama' }) => {
  const response = await api.post('/flashcards', {
    file_id: fileId,
    file_ids: fileIds,
    num_cards: numCards,
    topic,
    model,
  });
  return response.data;
};
