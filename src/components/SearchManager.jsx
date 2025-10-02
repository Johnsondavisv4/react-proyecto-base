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
  Marcar Albums deseados ✓
  Colocar un Boton de Descargar Seleccionados ✓
  Generar los enlaces y Empezar Descargas  
  */
  const [artistList, setArtistList] = useState([]);
  const [artista, setArtista] = useState("");
  const [albums, setAlbums] = useState([]);
  const [singles, setSingles] = useState([]);
  const [eps, setEps] = useState([]);
  const [titulo, setTitulo] = useState("Busca un artista");
  const [format, setFormat] = useState("FLAC");

  const search = useRef(null);

  let albumSelect = new Set();
  let tracks;

  const handleBack = () => {
    setAlbums([]);
    setEps([]);
    setSingles([]);
    setArtista("");
    setArtistList([]);
    setTitulo("Busca un artista");
    setFormat("FLAC");
    albumSelect = new Set();
    tracks = [];
  };

  // helper: formatea Date o string a dd-mm-aaaa
  const formatDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

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
    let albums = [];
    let eps = [];
    let singles = [];
    res.data.sort(
      (a, b) => b.release_date.getTime() - a.release_date.getTime()
    );
    res.data.map((res) => {
      switch (res.record_type) {
        case "album":
          albums.push(res);
          break;
        case "ep":
          eps.push(res);
          break;
        case "single":
          singles.push(res);
          break;
      }
    });
    setAlbums(albums);
    setSingles(singles);
    setEps(eps);
    setArtista(artist.id);
    setArtistList([]);
    setTitulo(`Listado de albumes de ${artist.name}`);
  };

  const handleDownload = () => {
    tracks = [];
    albumSelect.forEach(async (albumId) => {
      tracks.push(...(await DeezerService.getAlbumTracks(albumId)).data);
    });
  };

  const searchArtist = (
    <div>
      <div className="position-relative mb-3">
        <h1 className="text-center w-100 m-0">{titulo}</h1>
      </div>
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

      <div className="container py-5">
        <div className="row" style={{ rowGap: "10px" }}>
          {artistList.map((artist) => (
            <div className="album-list album-list-box card p-4" key={artist.id}>
              <div className="align-items-center row">
                <div className="col-auto">
                  <div className="album-list-images">
                    <img
                      src={artist.picture_medium}
                      alt={artist.name}
                      className="cover-md img-thumbnail"
                    />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="album-list-content mt-3 mt-lg-0">
                    <h5 className="mb-0">
                      <a className="album-name">{artist.name}</a>
                    </h5>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSelectArtist(artist)}
                className="select-artista btn btn-sm btn-outline-primary"
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const selectAlbumfromArtist = (
    <>
      <div className="position-relative mb-3">
        <button
          onClick={handleBack}
          className="btn btn-outline-secondary position-absolute start-0"
          style={{ transform: "translateY(2px)" }}
        >
          <i className="bi bi-arrow-left-circle-fill"> Volver</i>
        </button>

        <h1 className="text-center w-100 m-0">{titulo}</h1>
      </div>

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

          <button onClick={handleDownload} className="btn btn-success ms-auto">
            <i className="bi bi-download"> Descargar álbumes seleccionados</i>
          </button>
        </div>
      </div>

      <div className="container py-5">
        {albums.length !== 0 && (
          <>
            <h3>Albumes</h3>
            <div className="row" style={{ rowGap: "10px" }}>
              {albums.map((album) => (
                <div
                  className="album-list album-list-box card p-4"
                  key={album.id}
                >
                  <div className="align-items-center row">
                    <div className="col-auto">
                      <div className="album-list-images">
                        <img
                          src={album.cover_medium}
                          alt={album.title}
                          className="cover-md img-thumbnail"
                        />
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="album-list-content mt-3 mt-lg-0">
                        <h5 className="mb-0">
                          <a className="album-name">{album.title}</a>
                        </h5>
                        <p className="text-muted mb-0">
                          {formatDate(album.release_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    className="select-album"
                    type="checkbox"
                    id={`select-album-${album.id}`}
                    onChange={(e) => {
                      e.target.checked
                        ? albumSelect.add(album.id)
                        : albumSelect.delete(album.id);
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {eps.length !== 0 && (
          <>
            <h3 style={{ marginTop: "30px" }}>Eps</h3>
            <div className="row" style={{ rowGap: "10px" }}>
              {eps.map((album) => (
                <div
                  className="album-list album-list-box card p-4"
                  key={album.id}
                >
                  <div className="align-items-center row">
                    <div className="col-auto">
                      <div className="album-list-images">
                        <img
                          src={album.cover_medium}
                          alt=""
                          className="cover-md img-thumbnail"
                        />
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="album-list-content mt-3 mt-lg-0">
                        <h5 className="mb-0">
                          <a className="album-name">{album.title}</a>
                        </h5>
                        <p className="text-muted mb-0">
                          {formatDate(album.release_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    className="select-album"
                    type="checkbox"
                    id={`select-album-${album.id}`}
                    onChange={(e) => {
                      e.target.checked
                        ? albumSelect.add(album.id)
                        : albumSelect.delete(album.id);
                    }}
                    style={{ marginRight: "20px" }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {singles.length !== 0 && (
          <>
            <h3 style={{ marginTop: "30px" }}>Singles</h3>
            <div className="row" style={{ rowGap: "10px" }}>
              {singles.map((album) => (
                <div
                  className="album-list album-list-box card p-4"
                  key={album.id}
                >
                  <div className="align-items-center row">
                    <div className="col-auto">
                      <div className="album-list-images">
                        <img
                          src={album.cover_medium}
                          alt=""
                          className="cover-md img-thumbnail"
                        />
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="album-list-content mt-3 mt-lg-0">
                        <h5 className="mb-0">
                          <a className="album-name">{album.title}</a>
                        </h5>
                        <p className="text-muted mb-0">
                          {formatDate(album.release_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    className="select-album"
                    type="checkbox"
                    id={`select-album-${album.id}`}
                    onChange={(e) => {
                      e.target.checked
                        ? albumSelect.add(album.id)
                        : albumSelect.delete(album.id);
                    }}
                    style={{ marginRight: "20px" }}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );

  return artista === "" ? searchArtist : selectAlbumfromArtist;
}
