package com.ehub.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/common")
public class HealthController {

    @GetMapping("/status")
    public String status() {
        return "Common Services is UP and Running";
    }
}
