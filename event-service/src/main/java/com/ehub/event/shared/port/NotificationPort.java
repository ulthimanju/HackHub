package com.ehub.event.shared.port;

public interface NotificationPort {
    void sendEmail(String to, String subject, String message);
}
