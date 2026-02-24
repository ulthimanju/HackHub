package com.ehub.event.service;

import com.ehub.event.entity.Event;
import com.ehub.event.entity.EventReference;
import com.ehub.event.repository.EventReferenceRepository;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.ehub.event.util.MessageKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReferenceService {

    private final EventReferenceRepository referenceRepository;
    private final EventRepository eventRepository;

    /** Returns the Markdown string for an event, or an empty string if none exists. */
    public String getReferences(String eventId) {
        return referenceRepository.findById(eventId)
                .map(EventReference::getContentMd)
                .orElse("");
    }

    /** Replaces (upserts) the Markdown content. Only the event organizer may call this. */
    @Transactional
    public void upsertReferences(String eventId, String contentMd, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_CREATOR.getMessage());
        }

        EventReference ref = EventReference.builder()
                .eventId(eventId)
                .contentMd(contentMd != null ? contentMd : "")
                .build();
        referenceRepository.save(ref);
    }
}
