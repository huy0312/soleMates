package com.solemates.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "strava")
public class StravaConfig {
    private String clientId;
    private String clientSecret;
}
