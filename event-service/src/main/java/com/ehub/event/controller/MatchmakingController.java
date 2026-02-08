package com.ehub.event.controller;

import com.ehub.event.client.AuthClient;
import com.ehub.event.entity.Team;
import com.ehub.event.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/events/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final TeamRepository teamRepository;
    private final AuthClient authClient;

    @GetMapping("/suggest-members/{teamId}")
    public ResponseEntity<List<Map<String, Object>>> suggestMembers(@PathVariable String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

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

        List<Map<String, Object>> filteredSuggestions = suggestions.stream()
                .filter(u -> !memberIds.contains(u.get("id").toString()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredSuggestions);
    }
}
