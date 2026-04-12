package com.ehub.event.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ehub.event.dto.ProblemStatementRequest;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.ProblemStatement;
import com.ehub.event.enums.EventStatus;
import com.ehub.event.exception.ProblemStatementException;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.ProblemStatementRepository;
import com.ehub.event.util.MessageKeys;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemStatementService {

    private final EventRepository eventRepository;
    private final ProblemStatementRepository problemRepository;

    @Transactional
    public void addProblemStatements(String eventId, List<ProblemStatementRequest> requests, String requesterId) {
        Event event = requireEventOwnership(eventId, requesterId);
        if (!isRegistrationPhase(event)) {
            throw new ProblemStatementException(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage());
        }

        int currentCount = event.getProblemStatements().size();

        for (int i = 0; i < requests.size(); i++) {
            String autoStatementId = String.format("PS%03d", currentCount + i + 1);
            ProblemStatement problem = ProblemStatement.builder()
                    .id(UUID.randomUUID().toString())
                    .statementId(autoStatementId)
                    .name(requests.get(i).getName())
                    .statement(requests.get(i).getStatement())
                    .requirements(requests.get(i).getRequirements())
                    .event(event)
                    .build();
            problemRepository.save(problem);
        }
    }

    @Transactional
    public void addProblemStatement(String eventId, ProblemStatementRequest request, String requesterId) {
        Event event = requireEventOwnership(eventId, requesterId);
        if (!isRegistrationPhase(event)) {
            throw new ProblemStatementException(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage());
        }

        String autoStatementId = String.format("PS%03d", event.getProblemStatements().size() + 1);
        ProblemStatement problem = ProblemStatement.builder()
                .id(UUID.randomUUID().toString())
                .statementId(autoStatementId)
                .name(request.getName())
                .statement(request.getStatement())
                .requirements(request.getRequirements())
                .event(event)
                .build();

        problemRepository.save(problem);
    }

    @Transactional
    public void updateProblemStatement(String id, ProblemStatementRequest request, String requesterId) {
        ProblemStatement problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.PROBLEM_NOT_FOUND.getMessage()));

        if (!problem.getEvent().getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        if (isEventStarted(problem.getEvent())) {
            throw new ProblemStatementException(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage());
        }

        problem.setName(request.getName());
        problem.setStatement(request.getStatement());
        problem.setRequirements(request.getRequirements());
        problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblemStatement(String id, String requesterId) {
        ProblemStatement problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.PROBLEM_NOT_FOUND.getMessage()));

        if (!problem.getEvent().getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        if (!isRegistrationPhase(problem.getEvent())) {
            throw new ProblemStatementException(MessageKeys.PROBLEM_STATEMENTS_LOCKED.getMessage());
        }

        problemRepository.deleteById(id);
    }

    private Event requireEventOwnership(String eventId, String requesterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        if (!event.getOrganizerId().equals(requesterId)) {
            throw new AccessDeniedException(MessageKeys.UNAUTHORIZED_ORGANIZER.getMessage());
        }
        return event;
    }

    private boolean isRegistrationPhase(Event event) {
        EventStatus status = event.getStatus();
        return status == EventStatus.UPCOMING || status == EventStatus.REGISTRATION_OPEN;
    }

    private boolean isEventStarted(Event event) {
        EventStatus s = event.getStatus();
        return s == EventStatus.ONGOING || s == EventStatus.JUDGING
                || s == EventStatus.RESULTS_ANNOUNCED || s == EventStatus.COMPLETED;
    }
}
