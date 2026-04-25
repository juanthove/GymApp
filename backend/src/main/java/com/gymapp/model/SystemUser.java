package com.gymapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "system_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username"})
})
public class SystemUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SystemUserType role;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public SystemUserType getRole() {
        return role;
    }

    public void setRole(SystemUserType role) {
        this.role = role;
    }
}