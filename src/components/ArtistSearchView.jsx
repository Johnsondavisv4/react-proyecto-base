import React from "react";

export default function ArtistSearchView({
  titulo,
  searchRef,
  handleSearchArtist,
  artistList,
  handleSelectArtist,
}) {
  return (
    <div>
      <div className="position-relative mb-3">
        <h1 className="text-center w-100 m-0">{titulo}</h1>
      </div>
      <hr />
      <div className="input-group">
        <input
          ref={searchRef}
          type="text"
          className="form-control"
          placeholder="Ingrese el nombre del artista que quiere buscar"
          onKeyDown={(e) => e.key === "Enter" && handleSearchArtist()}
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
                      <span className="album-name">{artist.name}</span>
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
}
