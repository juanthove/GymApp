package com.gymapp.script;

import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutRepository;
import com.gymapp.service.SelectedWorkoutExerciseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Script que copia el último workout (el más reciente) de cada usuario.
 * El nuevo workout mantiene los mismos días y ejercicios. Para cada ejercicio,
 * el peso se establece en nextWeight si existe; de lo contrario, se mantiene el
 * peso actual.
 */
@Component
public class CopyLastWorkoutsScript {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private SelectedWorkoutExerciseService selectedWorkoutExerciseService;

    @Transactional
    public void execute() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            Workout lastWorkout = user.getCurrentWorkout();

            if (lastWorkout == null) {
                System.out.println("Usuario sin workout actual");
                continue;
            }

            // Ver si el workout no terminó
            if (lastWorkout.getEndDate().isAfter(LocalDate.now())) {
                continue;
            }

            // Traigo los dias del workout
            List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(lastWorkout.getId());

            // Verificar si algun día fue iniciado, si no solo se mueve la fecha
            boolean startedAnyDay = days.stream()
                    .anyMatch(day -> day.getStartedAt() != null);

            if (!startedAnyDay) {
                lastWorkout.setStartDate(lastWorkout.getStartDate().plusDays(7));
                lastWorkout.setEndDate(lastWorkout.getEndDate().plusDays(7));

                workoutRepository.save(lastWorkout);

                continue;
            }

            // Crear nuevo workout como copia desplazada una semana hacia adelante.
            // Se asume que la semana anterior empieza el lunes y termina el domingo.
            Workout newWorkout = new Workout();
            newWorkout.setName(lastWorkout.getName());
            newWorkout.setReps(lastWorkout.getReps());

            var newStartDate = lastWorkout.getStartDate().plusDays(7);
            var newEndDate = (lastWorkout.getEndDate() != null)
                    ? lastWorkout.getEndDate().plusDays(7)
                    : newStartDate.plusDays(6);

            newWorkout.setStartDate(newStartDate);
            newWorkout.setEndDate(newEndDate);
            newWorkout.setUser(user);
            newWorkout = workoutRepository.save(newWorkout);

            user.setCurrentWorkout(newWorkout);
            userRepository.save(user);

            // Cerrar días que quedaron iniciados pero no finalizados
            for (WorkoutDay day : days) {
                if (day.getStartedAt() != null && day.getFinishedAt() == null) {
                    day.setFinishedAt(lastWorkout.getEndDate().atTime(23, 58, 59));
                    workoutDayRepository.save(day);

                    selectedWorkoutExerciseService.deleteSelectedFile(day.getId());
                }
            }

            for (WorkoutDay oldDay : days) {
                WorkoutDay newDay = new WorkoutDay();
                newDay.setName(oldDay.getName());
                newDay.setDayOrder(oldDay.getDayOrder());
                newDay.setMuscleImage(oldDay.getMuscleImage());
                newDay.setAbdominal(false);
                newDay.setWorkout(newWorkout);
                newDay = workoutDayRepository.save(newDay);

                List<WorkoutExercise> exercises = workoutExerciseRepository
                        .findByWorkoutDayIdOrderByExerciseOrder(oldDay.getId());

                for (WorkoutExercise oldEx : exercises) {
                    WorkoutExercise newEx = new WorkoutExercise();
                    newEx.setWorkoutDay(newDay);
                    newEx.setExercise(oldEx.getExercise());
                    newEx.setExerciseOrder(oldEx.getExerciseOrder());
                    newEx.setComment(oldEx.getComment());

                    // Usar nextWeight si está definido; si no, mantener el peso actual
                    Double newWeight = (oldEx.getNextWeight() != null) ? oldEx.getNextWeight() : oldEx.getWeight();
                    newEx.setWeight(newWeight);

                    workoutExerciseRepository.save(newEx);
                }
            }

            System.out.println("[CopyLastWorkoutsScript] Copiado workout '" + lastWorkout.getName()
                    + "' (id=" + lastWorkout.getId() + ") -> nuevo workout id=" + newWorkout.getId()
                    + " para usuario " + user.getId() + " (" + user.getName() + " " + user.getSurname() + ")");
        }

        System.out.println("[CopyLastWorkoutsScript] Proceso finalizado.");
    }
}
