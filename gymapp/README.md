# GymApp

Aplicacion para gestion y ejecucion de rutinas de gimnasio, con frontend en React + Vite y backend en Spring Boot.

## Stack

- Frontend: React 19, Vite 8, Material UI, React Router.
- Backend: Spring Boot 3.1, Java 17, Spring Web, Spring Data JPA, Bean Validation.
- Base de datos: PostgreSQL.

## Estructura del proyecto

- `backend/`: API REST, logica de negocio, persistencia y validaciones.
- `gymapp/`: interfaz de usuario y consumo de API.
- `backend/uploads/images` y `backend/uploads/videos`: archivos multimedia de ejercicios.

## Como funciona (resumen funcional)

La app tiene dos flujos principales:

1. Flujo de uso diario:
- Seleccion de usuario activo en Home.
- Visualizacion del workout actual del usuario.
- Navegacion por dias y ejercicios.
- Pantalla de cierre/resumen final.

2. Flujo administrativo:
- Alta/edicion de usuarios.
- Alta/edicion de ejercicios (incluye imagen y video).
- Creacion de plantillas de entrenamiento.
- Creacion de workouts completos para usuarios.

## Organizacion de datos de entrenamiento

La app esta pensada para guardar el entrenamiento en niveles, desde lo general a lo puntual:

1. Usuario (`User`)
- Representa la persona que entrena.
- Puede tener un workout actual asignado.

2. Plan de entrenamiento (`Workout`)
- Datos principales: `name`, `startDate`, `endDate`, `userId`.
- Campo clave: `reps`.
- En este proyecto, `reps` se usa como referencia global de series/repeticiones objetivo del plan.

3. Dia de entrenamiento (`WorkoutDay`)
- Pertenece a un `Workout`.
- Datos: `name`, `muscles`, `dayOrder`.
- Seguimiento temporal: `startedAt`, `finishedAt`.
- Estado calculado: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.

4. Ejercicio dentro del dia (`WorkoutExercise`)
- Relaciona un ejercicio base (`Exercise`) con un dia (`WorkoutDay`).
- Datos operativos para entrenar: `exerciseOrder` (orden del ejercicio), `weight` (peso usado), `comment` (observaciones) y `completed` (si fue completado o no).

5. Catalogo de ejercicios (`Exercise`)
- Datos base: `name`, `description`, `type`.
- Soporte multimedia: `image` y `video` para referencia tecnica.

## Como se usan series, pesos y progreso

- Series/repeticiones: se definen a nivel `Workout` con `reps` y aplican como guia del plan.
- Pesos: se guardan a nivel `WorkoutExercise.weight`, permitiendo registrar carga por ejercicio.
- Orden de ejecucion: se guarda en `WorkoutExercise.exerciseOrder`.
- Progreso diario: se mide con `startedAt/finishedAt` y `status` del `WorkoutDay`.
- Progreso por ejercicio: se controla con `WorkoutExercise.completed` y `comment`.

## Plantillas vs workouts reales

- `WorkoutTemplate*`: define estructuras reutilizables (base para crear planes).
- `Workout*`: representa el plan real asignado a un usuario, con datos de ejecucion (estado, peso, completado).

Esto permite separar el diseno del plan (plantilla) de la ejecucion real del entrenamiento (workout del usuario).

## Arquitectura backend

Capas implementadas:

- `controller`: endpoints REST.
- `service`: logica de negocio (interfaces + implementaciones).
- `repository`: acceso a datos con Spring Data JPA.
- `dto/request` y `dto/response`: contratos de entrada/salida.
- `exception` + `config/GlobalExceptionHandler`: manejo centralizado de errores.

### Validaciones

Los Request DTOs usan `jakarta.validation` (`@NotNull`, `@NotBlank`, `@Size`, `@Positive`, etc.) y los controllers validan con `@Valid` en `@RequestBody`.

### Manejo de errores

Se definio un manejo consistente de errores con:

- `ResourceNotFoundException` -> HTTP 404
- `ConflictException` -> HTTP 409
- Errores de validacion -> HTTP 400
- Fallback runtime -> HTTP 500

Formato de respuesta de error:

```json
{
	"status": 400,
	"error": "Bad Request",
	"message": "Validation failed",
	"fields": {
		"name": "must not be blank"
	}
}
```

En errores no de validacion, `fields` puede no aparecer.

## Endpoints principales

Base URL backend: `http://localhost:8080`

- `/api/users`
- `/api/exercises`
- `/api/workouts`
- `/api/workout-days`
- `/api/workout-exercises`
- `/api/workout-template`
- `/api/workout-template-days`
- `/api/workout-template-exercises`

## Frontend

Rutas principales:

- `/home`
- `/workout/:userId`
- `/exercise/:userId/:workoutDayId`
- `/final/:userId/:workoutDayId`
- `/admin`
- `/admin/users`
- `/admin/exercises`
- `/admin/workout-templates`
- `/admin/workouts`

El frontend consume la API mediante `fetch` a rutas `/api/...` y Vite redirige al backend usando proxy:

- `vite.config.js`: `"/api" -> "http://localhost:8080"`

## CORS

El backend permite origen `http://localhost:5173` (configurado en `CorsConfig`).

## Como levantar el proyecto

### 1. Backend

Desde `backend/`:

```bash
mvn spring-boot:run
```

Requisitos:

- Java 17+
- Maven 3.9+
- PostgreSQL corriendo
- Configurar credenciales/URL de DB en `application.properties` si corresponde

### 2. Frontend

Desde `gymapp/`:

```bash
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`.

## Estado actual del backend

- Service layer completa para todos los modulos.
- DTOs Request/Response aplicados en toda la API.
- Validaciones con Bean Validation en todos los Request DTOs.
- `@ControllerAdvice` global para 404/409/400/500.

## Nota

Si cambias puertos de frontend o backend, actualiza:

- `backend/src/main/java/com/gymapp/config/CorsConfig.java`
- `gymapp/vite.config.js`
