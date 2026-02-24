package com.ehub.event.service;

import com.ehub.event.entity.Event;
import com.ehub.event.entity.EventRule;
import com.ehub.event.repository.EventRuleRepository;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.ehub.event.util.MessageKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final EventRuleRepository ruleRepository;
    private final EventRepository eventRepository;

    /** Returns the Markdown string for an event, or an empty string if none exists. */
    public String getRules(String eventId) {
        return ruleRepository.findById(eventId)
                .map(EventRule::getContentMd)
                .orElse("");
    }

    /** Replaces (upserts) the Markdown content. Only the event organizer may call this. */
    @Transactional
    public void upsertRules(String eventId, String contentMd, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_CREATOR.getMessage());
        }

        EventRule rule = EventRule.builder()
                .eventId(eventId)
                .contentMd(contentMd != null ? contentMd : "")
                .build();
        ruleRepository.save(rule);
    }
}
