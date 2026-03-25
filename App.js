import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView
} from "react-native";

// 🔥 Firebase
import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

export default function App() {

  // 🔐 AUTH
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // 📦 DATA
  const [equipos, setEquipos] = useState([]);
  const [nombreEquipo, setNombreEquipo] = useState("");

  const [solicitudes, setSolicitudes] = useState([]);

  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  // 🔐 REGISTER
  const register = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email.trim(),
        role: "user"
      });

      alert("Usuario creado");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔑 LOGIN
  const login = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setUser(userCred.user);

      const docRef = doc(db, "users", userCred.user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setRole(snap.data().role);
      } else {
        await setDoc(docRef, {
          email: email.trim(),
          role: "user"
        });
        setRole("user");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  // 🔓 LOGOUT
  const logout = () => {
    setUser(null);
    setRole(null);
  };

  // 📦 CARGAR DATOS
  const cargarEquipos = async () => {
    const snap = await getDocs(collection(db, "equipos"));
    const lista = [];
    snap.forEach(docu => lista.push({ id: docu.id, ...docu.data() }));
    setEquipos(lista);
  };

  const cargarSolicitudes = async () => {
    const snap = await getDocs(collection(db, "solicitudes"));
    const lista = [];
    snap.forEach(docu => lista.push({ id: docu.id, ...docu.data() }));
    setSolicitudes(lista);
  };

  useEffect(() => {
    if (user) {
      cargarEquipos();
      cargarSolicitudes();
    }
  }, [user]);

  // ➕ CREAR EQUIPO
  const crearEquipo = async () => {
    if (!nombreEquipo) return alert("Escribe un nombre");

    await addDoc(collection(db, "equipos"), {
      nombre: nombreEquipo,
      estado: "disponible",
      creadoPor: user.uid
    });

    setNombreEquipo("");
    cargarEquipos();
  };

  // ❌ ELIMINAR
  const eliminarEquipo = async (id) => {
    await deleteDoc(doc(db, "equipos", id));
    cargarEquipos();
  };

  // ✏️ EDITAR
  const guardarEdicion = async (id) => {
    await updateDoc(doc(db, "equipos", id), {
      nombre: nuevoNombre
    });

    setEditandoId(null);
    setNuevoNombre("");
    cargarEquipos();
  };

  // 📩 SOLICITAR
  const solicitarEquipo = async (equipo) => {
    await addDoc(collection(db, "solicitudes"), {
      equipoId: equipo.id,
      nombreEquipo: equipo.nombre,
      usuarioId: user.uid,
      estado: "pendiente"
    });
  };

  // ✅ ACEPTAR
  const aceptarSolicitud = async (sol) => {
    await updateDoc(doc(db, "solicitudes", sol.id), {
      estado: "aceptado"
    });

    await updateDoc(doc(db, "equipos", sol.equipoId), {
      estado: "prestado"
    });

    cargarSolicitudes();
    cargarEquipos();
  };

  // ❌ RECHAZAR
  const rechazarSolicitud = async (sol) => {
    await updateDoc(doc(db, "solicitudes", sol.id), {
      estado: "rechazado"
    });

    cargarSolicitudes();
  };

  // 🔀 LOGIN
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>EcoTech</Text>

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>

        <Button title="Login" onPress={login}/>
        <Button title="Registrarse" onPress={register}/>
      </View>
    );
  }

  // 👨‍💼 ADMIN
  if (role === "admin") {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>ADMIN 👨‍💼</Text>

        <TextInput
          placeholder="Nuevo equipo"
          value={nombreEquipo}
          onChangeText={setNombreEquipo}
          style={styles.input}
        />

        <Button title="Crear equipo" onPress={crearEquipo}/>

        <Text style={styles.subtitle}>Equipos</Text>

        {equipos.map(item => (
          <View key={item.id} style={styles.card}>
            {editandoId === item.id ? (
              <>
                <TextInput
                  value={nuevoNombre}
                  onChangeText={setNuevoNombre}
                  style={styles.input}
                />
                <Button title="Guardar" onPress={() => guardarEdicion(item.id)}/>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text>{item.estado}</Text>

                <Button title="Editar" onPress={() => {
                  setEditandoId(item.id);
                  setNuevoNombre(item.nombre);
                }}/>

                <Button title="Eliminar" onPress={() => eliminarEquipo(item.id)}/>
              </>
            )}
          </View>
        ))}

        <Text style={styles.subtitle}>Solicitudes</Text>

        {solicitudes.map(item => (
          <View key={item.id} style={styles.card}>
            <Text>{item.nombreEquipo}</Text>
            <Text>{item.estado}</Text>

            {item.estado === "pendiente" && (
              <>
                <Button title="Aceptar" onPress={() => aceptarSolicitud(item)}/>
                <Button title="Rechazar" onPress={() => rechazarSolicitud(item)}/>
              </>
            )}
          </View>
        ))}

        <Button title="Cerrar sesión" onPress={logout}/>
      </ScrollView>
    );
  }

  // 👤 USER
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Usuario 👤</Text>

      {equipos.map(item => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text>{item.estado}</Text>

          {item.estado === "disponible" && (
            <Button title="Solicitar" onPress={() => solicitarEquipo(item)}/>
          )}
        </View>
      ))}

      <Button title="Cerrar sesión" onPress={logout}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff"
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold"
  }
});