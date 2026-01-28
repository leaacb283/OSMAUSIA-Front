/**
 * API Client - OSMAUSIA
 * Configuration Axios avec gestion des cookies HttpOnly
 */

// Utiliser fetch natif pour éviter dépendances supplémentaires
const API_BASE_URL = '/api';

/**
 * Effectue une requête API avec credentials (cookies)
 */
async function apiRequest(endpoint, options = {}) {
  const config = {
    credentials: 'include', // OBLIGATOIRE pour les cookies HttpOnly
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Convertir body en JSON si objet (sauf FormData)
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Si FormData, laisser le navigateur gérer le Content-Type (boundary)
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const error = new Error(data.message || data || 'Une erreur est survenue');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { data, status: response.status };
  } catch (error) {
    // Re-throw avec plus d'infos
    if (!error.status) {
      error.status = 0;
      error.message = 'Impossible de contacter le serveur';
    }
    throw error;
  }
}

/**
 * Méthodes HTTP helpers
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Codes d'erreur HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export default api;
