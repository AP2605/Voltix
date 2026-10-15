package com.voltix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class VoltixApplication {

    public static void main(String[] args) {
        SpringApplication.run(VoltixApplication.class, args);
    }
}
