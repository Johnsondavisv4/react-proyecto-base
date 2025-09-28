import React from "react";
import { Fragment, useRef, useState } from "react";
import DeezerService from "../services/deezer.service";

export function SearchManager() {
  /*
  Buscar al artista
  Listar los resultados
  Seleccionar un artista
  Almacenarlo en artista
  
  Cambiar al Listado de TODOS los Albumes del Artista con un Selector de Formato
  Marcar Albums deseados
  Colocar un Boton de Descargar Seleccionados
  Generar los enlaces y Empezar Descargas  
  */
  const [artistList, setArtistList] = useState([]);
  const [artista, setArtista] = useState("");
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [titulo, setTitulo] = useState("Busca un artista");

  const search = useRef();

  const handleSearchArtist = async () => {
    const input = search.current.value.trim();
    if (input !== "") {
      try {
        const res = await DeezerService.searchArtist(input);
        console.log(res);
        setArtistList(res.data);
      } catch (error) {
        console.error("Error buscando artistas:", error);
        setArtistList([]);
      }
      search.current.value = "";
    }
  };

  const searchArtist = (
    <div>
      <h1>{titulo}</h1>
      <div className="input-group">
        <input
          ref={search}
          type="text"
          className="form-control"
          placeholder="Ingrese el nombre del artista que quiere buscar"
        />
        <button onClick={handleSearchArtist} className="btn btn-success">
          <i className="bi bi-search-heart"></i>
        </button>
      </div>
      <ul className="list-group">
        {artistList.map((artist) => (
          <li key={artist.id} className="list-group-item">
            {artist.name}
          </li>
        ))}
      </ul>
    </div>
  );

  return searchArtist;
}
