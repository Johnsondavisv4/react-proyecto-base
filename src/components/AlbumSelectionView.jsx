import React from "react";

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export function AlbumSelectionView({
  titulo,
  handleBack,
  format,
  setFormat,
  handleDownload,
  albums,
  eps,
  singles,
  onAlbumToggle,
}) {
  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <>
        <h3 style={{ marginTop: "30px" }}>{title}</h3>
        <div className="row" style={{ rowGap: "10px" }}>
          {items.map((album) => (
            <div className="album-list album-list-box card p-4" key={album.id}>
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
                      <span className="album-name">{album.title}</span>
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
                onChange={(e) => onAlbumToggle(album, e.target.checked)}
                style={{ marginRight: "20px" }}
              />
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
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
        {renderSection("Albumes", albums)}
        {renderSection("Eps", eps)}
        {renderSection("Singles", singles)}
      </div>
    </>
  );
}
