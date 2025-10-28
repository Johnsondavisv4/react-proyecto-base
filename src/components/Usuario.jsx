import React, { useState, useEffect, Fragment } from "react";
import db from "../firebaseConfig.js";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

const Usuario = () => {
  const [Usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState("");
  useEffect(() => {
    const usuariosRef = collection(db, "usuarios");

    const unsubscribe = onSnapshot(usuariosRef, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(lista);
    });
    return () => unsubscribe();
  }, []);

  const agregarUsuario = async () => {
    if (nuevoUsuario.trim() === "") return;
    const usuariosRef = collection(db, "usuarios");
    await addDoc(usuariosRef, { nombre: nuevoUsuario });
    setNuevoUsuario("");
    alert("Usuario agregado con éxito");
  };

  return (
    <Fragment>
      <div className="container">
        <h1 className="d-flex justify-content-center">Lista de usuarios</h1>
        <hr />

        <div className="input-group">
          <input
            value={nuevoUsuario}
            onChange={(e) => setNuevoUsuario(e.target.value)}
            className="form-control"
            type="text"
            placeholder="Ingrese el nombre del Usuario"
          />

          <button onClick={agregarUsuario} className="btn btn-success">
            <i class="bi bi-check"></i>
          </button>
        </div>

        <ul className="list-group mt-3">
          {Usuarios.map((usuario) => (
            <li key={usuario.id} className="list-group-item">
              {usuario.nombre}
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Usuario;
