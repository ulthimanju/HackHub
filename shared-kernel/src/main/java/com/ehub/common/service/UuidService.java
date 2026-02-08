package com.ehub.common.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class UuidService {
    public String generateUuid() {
        return UUID.randomUUID().toString();
    }
}
