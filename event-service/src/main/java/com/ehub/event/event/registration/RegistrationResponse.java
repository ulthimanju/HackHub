package com.ehub.event.event.registration;

import com.ehub.event.shared.enums.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {
    private String id;
    private String eventId;
    private String userId;
    private String username;
    private String userEmail;
    private RegistrationStatus status;
    private LocalDateTime registrationTime;
}
