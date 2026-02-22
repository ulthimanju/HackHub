import api from './api';

const eventService = {
  getAllEvents:              ()              => api.get('/events'),
  getEventById:             (id)            => api.get(`/events/${id}`),
  getOrganizerEvents:       ()              => api.get('/events/organizer'),
  getParticipantEvents:     ()              => api.get('/events/my-registrations'),
  getMyRegistrationStatuses:()              => api.get('/events/my-registrations/status'),
  createEvent:              (data)          => api.post('/events', data),
  updateEvent:              (id, data)      => api.put(`/events/${id}`, data),
  deleteEvent:              (id)            => api.delete(`/events/${id}`),
  registerForEvent:         (eventId, data) => api.post(`/events/${eventId}/register`, data),
  getEventRegistrations:    (eventId)       => api.get(`/events/${eventId}/registrations`),
  updateRegistrationStatus: (regId, status) => api.patch(`/events/registrations/${regId}/status`, null, { params: { status } }),
  cancelRegistration:       (regId)         => api.delete(`/events/registrations/${regId}`),
  addProblemStatement:      (eventId, data) => api.post(`/events/${eventId}/problemstatements`, data),
  addProblemStatementsBulk: (eventId, stmts)=> api.post(`/events/${eventId}/problemstatements/bulk`, stmts),
  deleteProblemStatement:   (problemId)     => api.delete(`/events/problemstatements/${problemId}`),
  updateProblemStatement:   (problemId, d)  => api.put(`/events/problemstatements/${problemId}`, d),
  getEventStats:            (eventId)       => api.get(`/events/${eventId}/stats`),
  advanceEventStatus:       (eventId)       => api.patch(`/events/${eventId}/advance-status`),
};

export default eventService;
