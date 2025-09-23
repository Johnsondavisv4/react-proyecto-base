import { Fragment, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import { Post } from "./Post";

export function Container() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      titulo: "Buscar receta del café perfecto",
      descripcion:
        "Paso a paso para preparar un café... útil en tiempos de certamen :v",
    },
    {
      id: 2,
      titulo: "Escapada de fin de semana",
      descripcion:
        "Al negocio de la esquina a comprar pan",
    },
    {
      id: 3,
      titulo: "Tips de productividad",
      descripcion:
        "Tiene que tlabajal",
    },
    {
      id: 4,
      titulo: "Aprendiendo React Hooks",
      descripcion:
        "Qué son useState, useEffect y useRef para el certamen que estamos haciendo",
    },
  ]);
  const inputTitulo = useRef();
  const inputDescripcion = useRef();

  const AddPost = () => {
    if (
      inputTitulo.current.value !== "" &&
      inputDescripcion.current.value !== ""
    ) {
      setPosts((prevPosts) => {
        const nuevoPost = {
          id: uuidv4(),
          titulo: inputTitulo.current.value,
          descripcion: inputDescripcion.current.value,
        };
        inputTitulo.current.value = "";
        inputDescripcion.current.value = "";
        return [...prevPosts, nuevoPost];
      });
    }
  };

  return (
    <Fragment>
      <div>
        <h1>Post It Simulator</h1>
        <div className="input-group gap-3">
          <div>
            <input
              ref={inputTitulo}
              className="form-control"
              type="text"
              placeholder="Titulo"
            />
          </div>
          <div>
            <input
              ref={inputDescripcion}
              className="form-control"
              type="text"
              placeholder="Descripcion"
            />
          </div>
          <div>
            <button onClick={AddPost} className="btn btn-dark">
              Agregar
            </button>
          </div>
        </div>

        <ul>
          {posts.map((post) => (
            <Post postProps={post} key={post.id}></Post>
          ))}
        </ul>
      </div>
    </Fragment>
  );
}
