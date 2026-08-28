import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_URL || '',
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const isProduction = import.meta.env.PROD;

      switch (status) {
        case 400:
          Swal.fire({
            title: 'Bad Request',
            text: data.message || 'The request could not be processed.',
            icon: 'warning',
            confirmButtonText: 'OK',
          });
          break;
        case 401:
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonText: 'OK',
          }).then(() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/';
          });
          break;
        case 403:
          Swal.fire({
            title: 'Access Denied',
            text:
              data.message ||
              'You do not have permission to perform this action.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          break;
        case 404:
          Swal.fire({
            title: 'Not Found',
            text: data.message || 'The requested resource was not found.',
            icon: 'question',
            confirmButtonText: 'OK',
          });
          break;
        case 419:
          Swal.fire({
            title: 'Session Expired',
            text: 'Session expired. Please refresh the page.',
            icon: 'warning',
            confirmButtonText: 'Refresh',
          }).then(() => {
            window.location.reload();
          });
          break;
        case 422:
          if (data.message && !data.errors) {
            Swal.fire({
              title: 'Validation Error',
              text: data.message,
              icon: 'warning',
              confirmButtonText: 'OK',
            });
          }

          break;
        case 500:
          Swal.fire({
            title: 'Server Error',
            text: isProduction
              ? 'A server error occurred. Our team has been notified.'
              : data.message || 'A server error occurred.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          break;
        default:
          if (isProduction) {
            Swal.fire({
              title: 'Error',
              text: 'An unexpected error occurred.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
      }
    } else if (error.request) {
      Swal.fire({
        title: 'Connection Error',
        text: 'Could not connect to the server. Please check your network connection.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }

    return Promise.reject(error);
  },
);

export default api;
