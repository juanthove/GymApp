package com.gymapp.repository;

import com.gymapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByIsLoggedIn(boolean isLoggedIn);

}