import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * Manages state across the multi-step event creation/edit flow:
 *   CreateEvent → AddProblems → EventDetails
 *
 * Also caches event data for EditEvent so navigating back from sub-pages
 * doesn't trigger redundant API fetches.
 *
 * State machine:
 *   null ──START_CREATE──► 'details' ──EVENT_CREATED──► 'problems' ──PROBLEMS_ADDED──► 'complete'
 *   null ──START_EDIT────► 'details' (edit mode, skips to EventDetails on submit)
 */

const initialState = {
  /** @type {'create'|'edit'|null} */
  mode: null,
  /** @type {'details'|'problems'|'complete'} */
  step: 'details',
  /** ID of the event being created or edited. */
  eventId: null,
  /** Display name of the event — shown in subsequent steps without a re-fetch. */
  eventName: '',
  /** Full cached event object used by EditEvent to avoid a redundant GET. */
  eventData: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_CREATE':
      return { ...initialState, mode: 'create', step: 'details' };

    case 'START_EDIT':
      return {
        ...initialState,
        mode: 'edit',
        step: 'details',
        eventId: action.eventId,
        eventData: action.eventData,
      };

    case 'EVENT_CREATED':
      return {
        ...state,
        step: 'problems',
        eventId: action.eventId,
        eventName: action.eventName,
      };

    case 'EVENT_UPDATED':
      // Refresh cached data after a successful edit
      return { ...state, eventData: action.eventData };

    case 'PROBLEMS_ADDED':
      return { ...state, step: 'complete' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

const EventCreationContext = createContext(null);

/**
 * Provider — wrap the authenticated portion of the app so context persists
 * across navigation between CreateEvent and AddProblems.
 */
export function EventCreationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startCreate    = useCallback(() => dispatch({ type: 'START_CREATE' }), []);
  const startEdit      = useCallback((eventId, eventData) => dispatch({ type: 'START_EDIT', eventId, eventData }), []);
  const eventCreated   = useCallback((eventId, eventName) => dispatch({ type: 'EVENT_CREATED', eventId, eventName }), []);
  const eventUpdated   = useCallback((eventData)           => dispatch({ type: 'EVENT_UPDATED', eventData }), []);
  const problemsAdded  = useCallback(() => dispatch({ type: 'PROBLEMS_ADDED' }), []);
  const reset          = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <EventCreationContext.Provider value={{
      state,
      startCreate,
      startEdit,
      eventCreated,
      eventUpdated,
      problemsAdded,
      reset,
    }}>
      {children}
    </EventCreationContext.Provider>
  );
}

/**
 * @returns {{ state, startCreate, startEdit, eventCreated, eventUpdated, problemsAdded, reset }}
 */
export function useEventCreation() {
  const ctx = useContext(EventCreationContext);
  if (!ctx) throw new Error('useEventCreation must be used within <EventCreationProvider>');
  return ctx;
}
