package com.ehub.event.team.query;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ehub.event.dto.TeamResponse;
import com.ehub.event.facade.TeamFacade;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events/teams")
@RequiredArgsConstructor
public class TeamQueryController {

    private final TeamFacade teamFacade;

    @GetMapping("/{eventId}")
    public ResponseEntity<Page<TeamResponse>> getTeamsByEvent(
            @PathVariable String eventId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ResponseEntity.ok(teamFacade.getTeamsByEvent(eventId, name, PageRequest.of(page, size)));
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<TeamResponse> getTeamByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(teamFacade.getTeamByShortCode(shortCode));
    }
}
