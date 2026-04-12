package com.ehub.event.adapter;

import com.ehub.event.client.NotificationClient;
import com.ehub.event.port.NotificationPort;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NotificationClientAdapter implements NotificationPort {

    private final NotificationClient notificationClient;

    @Override
    public void sendEmail(String to, String subject, String message) {
        notificationClient.sendEmail(to, subject, message);
    }
}
