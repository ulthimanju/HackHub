package com.ehub.notification.events.model;

import lombok.Data;

@Data
public class NotificationEventPayload {
    private String eventId;
    private String to;
    private String subject;
    private String message;
}