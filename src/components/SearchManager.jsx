import React, { useEffect, useRef, useState } from "react";
import DeezerService from "@services/deezer.service";
import JDownloaderService from "@services/jdownloader.service";
import { ArtistSearchView } from "./ArtistSearchView";
import { AlbumSelectionView } from "./AlbumSelectionView";

export function SearchManager() {
  const [artistList, setArtistList] = useState([]);
  const [artista, setArtista] = useState("");
  const [albums, setAlbums] = useState([]);
  const [singles, setSingles] = useState([]);
  const [eps, setEps] = useState([]);
  const [titulo, setTitulo] = useState("Busca un artista");
  const [format, setFormat] = useState("FLAC");
  const [isDownloading, setIsDownloading] = useState(false);

  const search = useRef(null);
  const albumSelect = useRef(new Map());

  useEffect(() => {
    const connect = async () => {
      try {
        await JDownloaderService.login();
      } catch (error) {
        alert(`Error iniciando sesión en JDownloader: ${error}`);
      }
    };

    connect();

    return () => {
      JDownloaderService.disconnect().catch((error) => {
        alert(`Error cerrando sesión en JDownloader: ${error}`);
      });
    };
  }, []);

  const handleBack = () => {
    setAlbums([]);
    setEps([]);
    setSingles([]);
    setArtista("");
    setArtistList([]);
    setTitulo("Busca un artista");
    setFormat("FLAC");
    albumSelect.current = new Map();
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
    let albumsArr = [];
    let epsArr = [];
    let singlesArr = [];

    res.data.sort(
      (a, b) => b.release_date.getTime() - a.release_date.getTime()
    );
    res.data.forEach((res) => {
      switch (res.record_type) {
        case "album":
          albumsArr.push(res);
          break;
        case "ep":
          epsArr.push(res);
          break;
        case "single":
          singlesArr.push(res);
          break;
        default:
          break;
      }
    });

    setAlbums(albumsArr);
    setSingles(singlesArr);
    setEps(epsArr);
    setArtista(artist.id);
    setArtistList([]);
    setTitulo(`Listado de albumes de ${artist.name}`);
  };

  const handleAlbumToggle = (album, isChecked) => {
    if (isChecked) {
      albumSelect.current.set(album.id, {
        id: album.id,
        title: album.title,
      });
    } else {
      albumSelect.current.delete(album.id);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    let tracks;
    for (const album of albumSelect.current.values()) {
      let links = [];
      try {
        tracks = (await DeezerService.getAlbumTracks(album.id)).data;
        tracks.forEach((e) => {
          links.push(
            `https://flacdownloader.com/flac/download?t=${e.id}&f=${format}`
          );
        });

        await JDownloaderService.addLinks({
          links: links,
          packageName: `${album.title} [${format}]`,
          autostart: false,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error procesando "${album.title}":`, error);
        alert(`Hubo un error al procesar el álbum: ${album.title}`);
      }
    }
    alert("Proceso de envío finalizado.");
    setIsDownloading(false);
  };

  if (artista === "") {
    return (
      <ArtistSearchView
        titulo={titulo}
        searchRef={search}
        handleSearchArtist={handleSearchArtist}
        artistList={artistList}
        handleSelectArtist={handleSelectArtist}
      />
    );
  }

  return (
    <AlbumSelectionView
      titulo={titulo}
      handleBack={handleBack}
      format={format}
      setFormat={setFormat}
      handleDownload={handleDownload}
      albums={albums}
      eps={eps}
      singles={singles}
      onAlbumToggle={handleAlbumToggle}
      isDownloading={isDownloading}
    />
  );
}
