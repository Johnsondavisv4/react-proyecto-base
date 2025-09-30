import React from "react";
import { Fragment, useRef, useState } from "react";
import DeezerService from "../services/deezer.service";

export function SearchManager() {
  /*
  Buscar al artista ✓
  Listar los resultados ✓
  Seleccionar un artista ✓
  Almacenarlo en artista ✓
  
  Cambiar al Listado de TODOS los Albumes del Artista con un Selector de Formato ✓
  Marcar Albums deseados
  Colocar un Boton de Descargar Seleccionados
  Generar los enlaces y Empezar Descargas  
  */
  const [artistList, setArtistList] = useState([]);
  const [artista, setArtista] = useState("");
  const [albums, setAlbums] = useState([]);
  const [albumSelect, setAlbumSelect] = useState(new Set());
  const [tracks, setTracks] = useState([]);
  const [titulo, setTitulo] = useState("Busca un artista");
  const [format, setFormat] = useState("FLAC");

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

  const handleSelectArtist = async (artist) => {
    const res = await DeezerService.getArtistAlbums(artist.id);
    setAlbums(res.data);
    setArtista(artist.id);
    setArtistList([]);
    setTitulo(`Listado de albumes de ${artist.name}`);
  };

  const searchArtist = (
    <div>
      <h1>{titulo}</h1>
      <hr />
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
      <div className="py-5">
        <div
          className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3"
          style={{ justifyContent: "center" }}
        >
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

  const selectAlbumfromArtist = (
    <>
      <h1>{titulo}</h1>
      <hr />

      <div>
        <span className="form-label d-block mb-2">Formato</span>
        <div className="d-flex align-items-center">
          <div className="form-check form-check-inline">
            <input
              id="inputFLAC"
              type="radio"
              className="form-check-input"
              name="Formato"
              value="FLAC"
              checked={format === "FLAC"}
              onChange={() => setFormat("FLAC")}
            />
            <label className="form-check-label" htmlFor="inputFLAC">
              FLAC
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              id="inputMP3"
              type="radio"
              className="form-check-input"
              name="Formato"
              value="MP3"
              checked={format === "MP3"}
              onChange={() => setFormat("MP3")}
            />
            <label className="form-check-label" htmlFor="inputMP3">
              MP3
            </label>
          </div>

          <button className="btn btn-success ms-auto">
            <i className="bi bi-cloud-arrow-down-fill"></i> Descargar álbumes
            seleccionados
          </button>
        </div>
      </div>
      <br />
      <p>Listado de Prueba</p>
      <ul className="listgroup">
        {albums.map((album) => (
          <li className="list-group-item" key={album.id}>
            {album.title}
          </li>
        ))}
      </ul>
    </>
  );

  return artista === "" ? searchArtist : selectAlbumfromArtist;
}
