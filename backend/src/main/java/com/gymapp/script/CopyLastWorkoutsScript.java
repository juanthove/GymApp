package com.gymapp.script;

import com.gymapp.model.User;
import com.gymapp.model.Workout;
import com.gymapp.model.WorkoutDay;
import com.gymapp.model.WorkoutExercise;
import com.gymapp.repository.UserRepository;
import com.gymapp.repository.WorkoutDayRepository;
import com.gymapp.repository.WorkoutExerciseRepository;
import com.gymapp.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Script que copia el último workout (el más reciente) de cada usuario.
 * El nuevo workout mantiene los mismos días y ejercicios. Para cada ejercicio,
 * el peso se establece en nextWeight si existe; de lo contrario, se mantiene el peso actual.
 *
 * Para ejecutar, inicia la aplicación con la propiedad:
 *   script.copy-last-workouts=true
 * Ejemplo:  java -jar app.jar --script.copy-last-workouts=true
 */
@Component
@ConditionalOnProperty(name = "script.copy-last-workouts", havingValue = "true")
public class CopyLastWorkoutsScript implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutDayRepository workoutDayRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            List<Workout> workouts = workoutRepository.findByUserIdOrderByStartDateDesc(user.getId());
            if (workouts.isEmpty()) {
                System.out.println("[CopyLastWorkoutsScript] Usuario " + user.getId()
                        + " (" + user.getName() + " " + user.getSurname() + ") no tiene workouts. Se omite.");
                continue;
            }

            Workout lastWorkout = workouts.get(0);

            // Crear nuevo workout como copia (sin fechas; se completarán cuando empiece el nuevo ciclo)
            Workout newWorkout = new Workout();
            newWorkout.setName(lastWorkout.getName());
            newWorkout.setReps(lastWorkout.getReps());
            newWorkout.setStartDate(null);
            newWorkout.setEndDate(null);
            newWorkout.setUser(user);
            newWorkout = workoutRepository.save(newWorkout);

            List<WorkoutDay> days = workoutDayRepository.findByWorkoutIdOrderByDayOrder(lastWorkout.getId());

            for (WorkoutDay oldDay : days) {
                WorkoutDay newDay = new WorkoutDay();
                newDay.setName(oldDay.getName());
                newDay.setDayOrder(oldDay.getDayOrder());
                newDay.setMuscleImage(oldDay.getMuscleImage());
                newDay.setAbdominal(oldDay.getAbdominal());
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
