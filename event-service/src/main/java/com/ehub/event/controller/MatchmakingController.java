package com.ehub.event.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.client.AuthClient;
import com.ehub.event.entity.Team;
import com.ehub.event.exception.ResourceNotFoundException;
import com.ehub.event.repository.TeamRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

        private final TeamRepository teamRepository;
        private final AuthClient authClient;

        @GetMapping("/suggest-members/{teamId}")
        public ResponseEntity<List<Map<String, Object>>> suggestMembers(
                        @PathVariable String teamId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "50") int size) {
                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

                List<String> needed = team.getSkillsNeeded();
                if (needed == null || needed.isEmpty()) {
                        return ResponseEntity.ok(List.of());
                }

                // Get suggestions from Auth service
                List<Map<String, Object>> suggestions = authClient.getUsersBySkills(needed);

                // Filter out existing members
                List<String> memberIds = team.getMembers().stream()
                                .map(m -> m.getUserId())
                                .collect(Collectors.toList());

                List<Map<String, Object>> filtered = suggestions.stream()
                                .filter(u -> !memberIds.contains(u.get("id").toString()))
                                .collect(Collectors.toList());

                // Apply pagination slicing
                int start = page * size;
                int end = Math.min(start + size, filtered.size());
                List<Map<String, Object>> paged = (start >= filtered.size()) ? List.of() : filtered.subList(start, end);

                return ResponseEntity.ok(paged);
        }
}
