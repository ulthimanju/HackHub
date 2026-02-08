package com.ehub.common.controller;

import com.ehub.common.service.UuidService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/common/uuid")
@RequiredArgsConstructor
public class UuidController {

    private final UuidService uuidService;

    @GetMapping
    public String getUuid() {
        return uuidService.generateUuid();
    }
}
