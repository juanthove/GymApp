import React, { useEffect, useState } from "react";
import { getLoggedUser, getNotLoggedUser, loginUser } from "../services/userService";
import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getLoggedUser();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const openModal = async () => {
    try {
      const data = await getNotLoggedUser();
      setAllUsers(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  //Función para ir a Workout con el usuario ya logueado
  const goWorkoutWithUser = (user) => {
    navigate(`/workout/${user.id}`);
  };

  //Función para loguear el usuario seleccionado e ir a Workout
  const goWorkout = async () => {
    try {
      if (!selectedUser) return;

      await loginUser(selectedUser.id);

      navigate(`/workout/${selectedUser.id}`);
    } catch (error) {
      console.error("Error logueando usuario:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Usuarios activos</h1>

      <div style={styles.cardsContainer}>
        {users.map((user) => (
          <div key={user.id} style={styles.card} onClick={() => goWorkoutWithUser(user)}>
            <h2 style={styles.name}>
              {user.name} {user.surname}
            </h2>
          </div>
        ))}

        {/* Tarjeta + */}
        <div style={styles.addCard} onClick={openModal}>
          +
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Seleccionar usuario</h2>

            <div style={styles.userList}>
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    ...styles.userItem,
                    backgroundColor:
                      selectedUser?.id === user.id ? "#FF6B00" : "#1C1F2A",
                  }}
                  onClick={() => setSelectedUser(user)}
                >
                  {user.name} {user.surname}
                </div>
              ))}
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.button}
                disabled={!selectedUser}
                onClick={goWorkout}
              >
                Ingresar
              </button>

              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0B0F1A",
    padding: "40px",
  },

  title: {
    color: "#FF6B00",
    fontSize: "32px",
    marginBottom: "30px",
  },

  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },

  card: {
    width: "250px",
    height: "120px",
    backgroundColor: "#1C1F2A",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.4)",
    cursor: "pointer",
  },

  addCard: {
    width: "250px",
    height: "120px",
    backgroundColor: "#1C1F2A",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "60px",
    color: "#FF6B00",
    cursor: "pointer",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.4)",
  },

  name: {
    color: "white",
    fontSize: "20px",
  },

  /* MODAL */

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    backgroundColor: "#0B0F1A",
    padding: "30px",
    borderRadius: "20px",
    width: "400px",
  },

  modalTitle: {
    color: "#FF6B00",
    marginBottom: "20px",
  },

  userList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  userItem: {
    padding: "10px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
  },

  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
  },

  button: {
    backgroundColor: "#FF6B00",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  cancelButton: {
    backgroundColor: "#444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};