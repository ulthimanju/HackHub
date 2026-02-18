import api from './api';

const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getOrganizerEvents: async () => {
    const response = await api.get('/events/organizer');
    return response.data;
  },

  getParticipantEvents: async () => {
    const response = await api.get('/events/my-registrations');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  registerForEvent: async (eventId, registrationData) => {
    const response = await api.post(`/events/${eventId}/register`, registrationData);
    return response.data;
  },

  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  updateRegistrationStatus: async (registrationId, status) => {
    const response = await api.patch(`/events/registrations/${registrationId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  cancelRegistration: async (registrationId) => {
    const response = await api.delete(`/events/registrations/${registrationId}`);
    return response.data;
  }
};

export default eventService;
