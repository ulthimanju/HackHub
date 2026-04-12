package com.ehub.event.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.enums.OutboxStatus;
import com.ehub.event.service.OutboxService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/outbox")
@RequiredArgsConstructor
public class OutboxController {

    private final OutboxService outboxService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<Map<OutboxStatus, Long>> getStats() {
        return ResponseEntity.ok(outboxService.getStatusCounts());
    }

    @PostMapping("/{id}/replay")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<String> replay(@PathVariable String id) {
        boolean replayed = outboxService.replay(id);
        if (!replayed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("OUTBOX_EVENT_NOT_FOUND");
        }
        return ResponseEntity.ok("REQUEUED");
    }
}