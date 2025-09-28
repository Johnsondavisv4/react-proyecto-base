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

  const search = useRef(null);

  const handleSearchArtist = async () => {
    const input = search.current.value.trim();
    if (input !== "") {
      try {
        const res = await DeezerService.searchArtist(input);
        setArtistList(res.data);
      } catch (error) {
        console.error("Error buscando artistas:", error);
        setArtistList([]);
      }
      search.current.value = "";
    }
  };

  const handleSelectArtist = (artist) => {
    setArtista(artist.id);
    setArtistList([]);
    //llamar albumes a la API
    setTitulo(`Listado de albumes de ${artist.name}`);
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
      <div className="album py-5">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {artistList.map((artist) => (
            <div className="col" key={artist.id} style={{ maxWidth: "250px" }}>
              <div className="card shadow-sm">
                <img
                  className="bd-placeholder-img card-img-top"
                  src={artist.picture_medium}
                  alt={artist.name}
                  height="250"
                  width="250"
                />
                <div className="card-body">
                  <p className="card-text d-flex justify-content-center">
                    {artist.name}
                  </p>
                  <div className="d-flex justify-content-center">
                    <div>
                      <button
                        onClick={() => handleSelectArtist(artist)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return searchArtist;
}
