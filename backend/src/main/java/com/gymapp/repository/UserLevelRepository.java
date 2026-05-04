package com.gymapp.repository;

import com.gymapp.model.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {

    List<UserLevel> findAllByOrderByLevelOrderAsc();
}