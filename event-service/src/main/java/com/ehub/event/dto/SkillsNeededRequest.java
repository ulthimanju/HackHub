package com.ehub.event.dto;

import lombok.Data;
import java.util.List;

@Data
public class SkillsNeededRequest {
    private List<String> skills;
}
