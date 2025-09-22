import { Fragment, useRef, useState } from "react";
import { Juego } from "./Juego";
import { v4 as uuidv4 } from "uuid";
import React from "react";

export function Steam() {
  //Inicializar variables que estaran viendo y oyendo react
  //Para saber si sufren cambios de estado
  //listadoJuegos = constantes
  //setJuegos = Metodo para ver si hay juegos nuevos o se eliminan de la lista
  //useState = state que provee react para capturar estados

  const [listadoJuegos, setJuegos] = useState([
    { id: 1, titulo: "Hollow Knight" },
    { id: 2, titulo: "Hollow Knight: Silksong" },
    { id: 3, titulo: "God of War" },
    { id: 4, titulo: "GTA V: Enhanced Edition" },
  ]);

  const inputJuego = useRef();

  const agregarJuego = () => {
    const inputJuegoTexto = inputJuego.current.value;
    if (inputJuegoTexto !== "") {
      setJuegos((prevJuegos) => {
        const nuevoJuego = {
          id: uuidv4(),
          titulo: inputJuegoTexto,
        };
        inputJuego.current.value = "";
        return [...prevJuegos, nuevoJuego];
      });
    }
  };

  return (
    <Fragment>
      <div className="container">
        <h1 style={{ textAlign: "center" }}>
          ¡¡¡EH MUCHACHOS, PONGAN BACHATA!!!
        </h1>

        <hr />

        <div className="input-group">
          <input
            ref={inputJuego}
            className="form-control"
            type="text"
            placeholder="Ingrese el nombre del juego"
          />
          <button onClick={agregarJuego} className="btn btn-success">
            <i className="bi bi-check"></i>
          </button>
        </div>

        <ul className="list-group">
          {listadoJuegos.map((juegoActual) => (
            <Juego juegoProps={juegoActual} key={juegoActual.id}></Juego>
          ))}
        </ul>
      </div>
    </Fragment>
  );
}
