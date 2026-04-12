package com.ehub.event.service;

import com.ehub.event.dto.TeamResponse;
import com.ehub.event.entity.Team;
import com.ehub.event.mapper.TeamMapper;
import com.ehub.event.repository.TeamMemberRepository;
import com.ehub.event.repository.TeamRepository;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamQueryService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMapper teamMapper;

    public List<TeamResponse> getTeamsByEvent(String eventId, String name) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        if (name != null && !name.isBlank()) {
            String lower = name.toLowerCase();
            teams = teams.stream().filter(t -> t.getName().toLowerCase().contains(lower)).toList();
        }
        return teams.stream().map(this::toTeamResponse).toList();
    }

    public Page<TeamResponse> getTeamsByEvent(String eventId, String name, Pageable pageable) {
        Page<Team> page = teamRepository.findByEventId(eventId, pageable);
        List<Team> teams = page.getContent();
        if (name != null && !name.isBlank()) {
            String lower = name.toLowerCase();
            teams = teams.stream().filter(t -> t.getName().toLowerCase().contains(lower)).toList();
        }
        List<TeamResponse> content = teams.stream().map(this::toTeamResponse).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        Team team = teamRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException(MessageKeys.TEAM_NOT_FOUND.getMessage()));
        return toTeamResponse(team);
    }

    private TeamResponse toTeamResponse(Team team) {
        return teamMapper.toTeamResponse(team, teamMemberRepository.findByTeamId(team.getId()));
    }
}
