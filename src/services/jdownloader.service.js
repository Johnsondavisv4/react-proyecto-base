// src/services/jdownloader.service.js
// Reimplementación completa basada en myjdownloader adaptada para navegador
import CryptoJS from "crypto-js";
import aesjs from "aes-js";
import pkcs7 from "pkcs7-padding";
import { Buffer } from "buffer";

// Asegurar que Buffer esté disponible globalmente para pkcs7-padding
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// ===== UTILIDADES CRYPTO (adaptadas de myjdownloader/utils/crypto.js) =====

/**
 * Convierte un WordArray de CryptoJS a Uint8Array
 */
function wordArrayToUint8Array(wordArray) {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
}

/**
 * Convierte Uint8Array a un string binario
 */
function uint8ArrayToBinaryString(uint8Array) {
  let result = "";
  for (let i = 0; i < uint8Array.length; i++) {
    result += String.fromCharCode(uint8Array[i]);
  }
  return result;
}

/**
 * Convierte string binario a Uint8Array
 */
function binaryStringToUint8Array(str) {
  const uint8Array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    uint8Array[i] = str.charCodeAt(i);
  }
  return uint8Array;
}

/**
 * Crea el secret inicial: SHA256(email + password + domain)
 */
function createSecret(email, password, domain) {
  const hash = CryptoJS.SHA256(email + password + domain);
  return wordArrayToUint8Array(hash);
}

/**
 * Firma un queryString con HMAC-SHA256
 */
function sign(key, data) {
  // key es Uint8Array, convertimos a WordArray
  const keyWordArray = CryptoJS.lib.WordArray.create(key);
  const hmac = CryptoJS.HmacSHA256(data, keyWordArray);
  return hmac.toString(CryptoJS.enc.Hex);
}

/**
 * Encripta datos usando AES-CBC (simula lo que hace myjdownloader)
 */
function encrypt(data, ivKey) {
  const stringIvKey = uint8ArrayToBinaryString(ivKey);
  const stringIv = stringIvKey.substring(0, stringIvKey.length / 2);
  const stringKey = stringIvKey.substring(stringIvKey.length / 2);

  const iv = binaryStringToUint8Array(stringIv);
  const key = binaryStringToUint8Array(stringKey);

  const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  const dataBytes = aesjs.utils.utf8.toBytes(data);

  // Padding PKCS7
  const dataBuffer = Buffer.from(dataBytes);
  const paddedData = pkcs7.pad(dataBuffer);
  const encryptedBytes = aesCbc.encrypt(paddedData);

  // Convertir a base64
  return btoa(String.fromCharCode(...encryptedBytes));
}

/**
 * Desencripta datos usando AES-CBC
 */
function decrypt(data, ivKey) {
  const stringIvKey = uint8ArrayToBinaryString(ivKey);
  const stringIv = stringIvKey.substring(0, stringIvKey.length / 2);
  const stringKey = stringIvKey.substring(stringIvKey.length / 2);

  const iv = binaryStringToUint8Array(stringIv);
  const key = binaryStringToUint8Array(stringKey);

  const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);

  // Decodificar base64
  const encryptedBytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const decryptedBytes = aesCbc.decrypt(encryptedBytes);

  // Unpad PKCS7
  const decryptedBuffer = Buffer.from(decryptedBytes);
  const unpaddedData = pkcs7.unpad(decryptedBuffer);

  // Convertir a string UTF-8 y limpiar null bytes al final
  let result = unpaddedData.toString("utf8");
  // Remover caracteres null al final que pueden quedar del padding
  result = result.replace(/\0+$/, "");

  return result;
}

/**
 * Actualiza el encryption token: SHA256(oldToken + updateToken)
 */
function updateEncryptionToken(oldToken, updateToken) {
  // updateToken es hex string, convertir a bytes
  const updateTokenBytes = new Uint8Array(
    updateToken.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  // Concatenar oldToken + updateTokenBytes
  const combined = new Uint8Array(oldToken.length + updateTokenBytes.length);
  combined.set(oldToken);
  combined.set(updateTokenBytes, oldToken.length);

  // Hash SHA256
  const combinedWordArray = CryptoJS.lib.WordArray.create(combined);
  const hash = CryptoJS.SHA256(combinedWordArray);
  return wordArrayToUint8Array(hash);
}

// ===== CLASE PRINCIPAL (adaptada de myjdownloader/JDownloader.js) =====

class JDownloaderService {
  constructor() {
    this.apiUrl = "https://api.jdownloader.org";
    this.email = process.env.REACT_APP_JDOWNLOADER_EMAIL;
    this.password = process.env.REACT_APP_JDOWNLOADER_PASSWORD;
    this.deviceName = process.env.REACT_APP_JDOWNLOADER_DEVICE_NAME;
    this.appKey = "react-client";

    this.serverDomain = "server";
    this.deviceDomain = "device";

    this.loginSecret = null;
    this.deviceSecret = null;
    this.serverEncryptionToken = null;
    this.deviceEncryptionToken = null;
    this.sessionToken = null;
    this.regainToken = null;
    this.ridCounter = 0;

    this.device = null;
    this.deviceInfo = null;

    if (this.email && this.password) {
      this.email = this.email.toLowerCase();
    }
  }

  /**
   * Genera un RequestID único monotónico
   */
  uniqueRid() {
    this.ridCounter = Date.now();
    return this.ridCounter;
  }

  /**
   * Llama al servidor MyJDownloader (/my/connect, /my/listdevices, /my/disconnect)
   */
  async callServer(query, key, params = null) {
    let rid = this.uniqueRid();

    if (params) {
      params = encrypt(JSON.stringify(params), key);
      rid = this.ridCounter;
    }

    if (query.includes("?")) {
      query += "&";
    } else {
      query += "?";
    }
    query = `${query}rid=${rid}`;

    const signature = sign(key, query);
    query += `&signature=${signature}`;

    const url = this.apiUrl + query;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/aesjson-jd; charset=utf-8",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    const decrypted = decrypt(data, key);
    const cleaned = decrypted.replace(/[^\x20-\x7E]/g, "").trim();
    return JSON.parse(cleaned);
  }

  /**
   * Llama a una acción en un dispositivo específico
   * AHORA CON AUTO-RECONEXIÓN SILENCIOSA
   */
  async callAction(action, deviceId, params = null, retry = false) {
    if (!this.sessionToken || !this.deviceEncryptionToken) {
      // Si no hay sesión, intentamos loguear antes de fallar (si es el primer intento)
      if (!retry) {
        await this.login();
        return this.callAction(action, this.device, params, true);
      }
      throw new Error("Not connected");
    }

    const query = `/t_${encodeURIComponent(
      this.sessionToken
    )}_${encodeURIComponent(deviceId)}${action}`;

    const json = {
      url: action,
      params,
      rid: this.uniqueRid(),
      apiVer: 1,
    };

    const encrypted = encrypt(JSON.stringify(json), this.deviceEncryptionToken);

    const response = await fetch(this.apiUrl + query, {
      method: "POST",
      headers: {
        "Content-Type": "application/aesjson-jd; charset=utf-8",
      },
      body: encrypted,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error(`JD Error Raw (${response.status}):`, errorText); // Comentado para no ensuciar consola

      try {
        // Intentamos desencriptar por si es un error de API estándar
        const decryptedError = decrypt(errorText, this.deviceEncryptionToken);

        // === LÓGICA DE RECONEXIÓN ===
        // Si el token es inválido y no hemos reintentado todavía...
        if (decryptedError.includes("TOKEN_INVALID") && !retry) {
          console.warn(
            "Sesión JDownloader caducada. Renovando credenciales..."
          );

          // 1. Refrescamos la sesión
          await this.login();

          // 2. Reintentamos la MISMA acción recursivamente
          // Importante: Usamos 'this.device' para asegurar que usamos el ID actualizado
          return this.callAction(action, this.device, params, true);
        }
        // ============================

        throw new Error(decryptedError);
      } catch (e) {
        // Si falló el decrypt o era otro error, lanzamos la excepción
        // (Solo aquí saltaría el alert en tu componente, si falla la reconexión)
        if (e.message.includes("atob") || e.name === "InvalidCharacterError") {
          throw new Error(
            `JDownloader Server Error: ${response.status} ${response.statusText}`
          );
        }
        throw e;
      }
    }

    const data = await response.text();

    const decrypted = decrypt(data, this.deviceEncryptionToken);
    const cleaned = decrypted.replace(/[^\x20-\x7E]/g, "").trim();
    return JSON.parse(cleaned);
  }

  /**
   * 🔑 Conecta a MyJDownloader y obtiene tokens de sesión
   */
  async connect() {
    if (!this.email || !this.password) {
      throw new Error("Email and password are required");
    }

    this.loginSecret = createSecret(
      this.email,
      this.password,
      this.serverDomain
    );
    this.deviceSecret = createSecret(
      this.email,
      this.password,
      this.deviceDomain
    );

    const query = `/my/connect?email=${encodeURIComponent(this.email)}&appkey=${
      this.appKey
    }`;

    const response = await this.callServer(query, this.loginSecret);

    this.sessionToken = response.sessiontoken;
    this.regainToken = response.regaintoken;

    this.serverEncryptionToken = updateEncryptionToken(
      this.loginSecret,
      this.sessionToken
    );
    this.deviceEncryptionToken = updateEncryptionToken(
      this.deviceSecret,
      this.sessionToken
    );

    return response.deviceid;
  }

  /**
   * 🔌 Desconecta de MyJDownloader
   */
  async disconnect() {
    if (!this.sessionToken || !this.serverEncryptionToken) {
      this.sessionToken = null;
      this.regainToken = null;
      this.device = null;
      this.deviceInfo = null;
      return;
    }

    const query = `/my/disconnect?sessiontoken=${encodeURIComponent(
      this.sessionToken
    )}`;
    await this.callServer(query, this.serverEncryptionToken);

    this.sessionToken = null;
    this.regainToken = null;
    this.serverEncryptionToken = null;
    this.deviceEncryptionToken = null;
    this.device = null;
    this.deviceInfo = null;
  }

  /**
   * 📋 Lista dispositivos disponibles
   */
  async listDevices() {
    if (!this.sessionToken || !this.serverEncryptionToken) {
      throw new Error("Not connected");
    }

    const query = `/my/listdevices?sessiontoken=${encodeURIComponent(
      this.sessionToken
    )}`;
    return this.callServer(query, this.serverEncryptionToken);
  }

  /**
   * 🔑 Login: conecta y selecciona dispositivo por nombre
   */
  async login() {
    await this.connect();

    const devicesResponse = await this.listDevices();
    const devices = devicesResponse.list || [];

    const device = devices.find((d) => d.name === this.deviceName);
    if (!device) {
      throw new Error(`No se encontró el dispositivo: ${this.deviceName}`);
    }

    this.device = device.id;
    this.deviceInfo = device;

    return device;
  }

  /**
   * 📦 Añade links al LinkGrabber (adaptado de LinkgrabberV2.addLinks)
   */
  async addLinks({
    links,
    packageName,
    destinationFolder = "Canciones",
    autostart = false,
  }) {
    if (!this.device) {
      throw new Error(
        "No hay dispositivo seleccionado. Llama a login() primero."
      );
    }

    if (!Array.isArray(links) || links.length === 0) {
      throw new Error("Debes proporcionar un array de links");
    }

    const defaultOptions = {
      autostart: autostart,
      priority: "DEFAULT",
      deepDecrypt: true,
    };

    const options = {
      links: links.join("\n"),
      packageName,
      destinationFolder,
      ...defaultOptions,
    };

    const params = JSON.stringify(options);

    return this.callAction("/linkgrabberv2/addLinks", this.device, [params]);
  }

  /**
   * 🔍 Consulta paquetes en LinkGrabber
   */
  async queryPackages() {
    if (!this.device) {
      throw new Error(
        "No hay dispositivo seleccionado. Llama a login() primero."
      );
    }

    const defaultOptions = {
      availableOfflineCount: true,
      availableOnlineCount: true,
      bytesTotal: true,
      childCount: true,
      comment: true,
      enabled: true,
      hosts: true,
      name: true,
      saveTo: true,
      uuid: true,
    };

    const params = JSON.stringify(defaultOptions);

    return this.callAction("/linkgrabberv2/queryPackages", this.device, [
      params,
    ]);
  }
}

// Exportamos como singleton
const jdService = new JDownloaderService();
export default jdService;
