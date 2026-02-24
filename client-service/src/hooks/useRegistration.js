import { useState } from 'react';
import eventService from '../services/eventService';
import { extractErrorMessage } from '../services/api';

/**
 * Manages the multi-step event registration flow (confirm → submit → success/error).
 *
 * Usage:
 * ```jsx
 * const reg = useRegistration(user, markRegistered);
 * <Button onClick={() => reg.openModal(event)}>Register</Button>
 * <RegistrationModal {...reg} />
 * ```
 *
 * @param {{ id: string, username: string, email: string }} user - The authenticated user.
 * @param {(eventId: string) => void} [onSuccess] - Called with the eventId after a successful registration.
 * @returns {{
 *   registerEvent: object|null,
 *   registering: boolean,
 *   registerError: string,
 *   registerSuccess: boolean,
 *   openModal: (event: object) => void,
 *   closeModal: () => void,
 *   handleRegister: () => Promise<void>,
 * }}
 */
export function useRegistration(user, onSuccess) {
  const [registerEvent,   setRegisterEvent]   = useState(null);
  const [registering,     setRegistering]     = useState(false);
  const [registerError,   setRegisterError]   = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const openModal = (event) => {
    setRegisterEvent(event);
    setRegisterError('');
    setRegisterSuccess(false);
  };

  const closeModal = () => {
    setRegisterEvent(null);
    setRegisterError('');
    setRegisterSuccess(false);
  };

  const handleRegister = async () => {
    if (!registerEvent) return;
    setRegistering(true);
    setRegisterError('');
    try {
      await eventService.registerForEvent(registerEvent.id, {
        username:  user.username,
        userEmail: user.email,
      });
      setRegisterSuccess(true);
      onSuccess?.(registerEvent.id);
    } catch (err) {
      setRegisterError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setRegistering(false);
    }
  };

  return {
    registerEvent,
    registering,
    registerError,
    registerSuccess,
    openModal,
    closeModal,
    handleRegister,
  };
}
