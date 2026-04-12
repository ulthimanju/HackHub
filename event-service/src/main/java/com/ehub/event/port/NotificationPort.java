package com.ehub.event.port;

public interface NotificationPort {
    void sendEmail(String to, String subject, String message);
}
