package com.gymapp.config;

import com.gymapp.model.SystemUser;
import com.gymapp.model.SystemUserType;
import com.gymapp.repository.SystemUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final SystemUserRepository systemUserRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void initialize() {

        if (systemUserRepository.count() > 0) {
            return;
        }

        SystemUser admin = new SystemUser();
        admin.setUsername("Admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(SystemUserType.ADMIN);

        SystemUser staff = new SystemUser();
        staff.setUsername("Comun");
        staff.setPassword(passwordEncoder.encode("comun123"));
        staff.setRole(SystemUserType.STAFF);

        systemUserRepository.save(admin);
        systemUserRepository.save(staff);

        System.out.println("Usuarios iniciales creados.");
    }
}