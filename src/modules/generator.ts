import md5 = require('md5');
import { DigestHeader } from '../types/generator';

export function generateDigestAuth({
  authenticateHeader,
  username,
  password,
  uri,
  method,
  cnonce,
  nc,
  entityBody,
}: {
  authenticateHeader: string;
  username: string;
  password: string;
  uri: string;
  method: string;
  cnonce?: string;
  nc?: string;
  entityBody?: string;
}) {
  let digestOptions = parseHeaderForData(authenticateHeader);

  if (!cnonce) {
    cnonce = '';
  }

  if (!nc) {
    nc = '00000000';
  } else {
    let ncDecimal = parseInt(nc, 16);
    ncDecimal += 1;
    nc = ncDecimal.toString(16);
  }

  let algorithm: string;
  if (digestOptions.algorithm) {
    algorithm = digestOptions.algorithm;
  } else {
    algorithm = 'MD5';
  }

  let qop: string;
  if (digestOptions.qop) {
    qop = digestOptions.qop;
  } else {
    qop = '';
  }

  method = method.toUpperCase();

  const a1 = generateA1Hash({ digestOptions, username, password, cnonce });
  const a2 = generateA2Hash({ qop, method, uri, entityBody });
  const response = generateResponse({ digestOptions, a1, a2, nc, cnonce });

  let header = `Digest username="${username}" realm="${digestOptions.realm}" nonce="${digestOptions.nonce}" uri="${uri}" algorithm="${algorithm}" `;

  if (digestOptions.qop) {
    header += `qop=${digestOptions.qop} nc=${nc} cnonce="${cnonce}" `;
  }

  if (digestOptions.opaque) {
    header += `opaque="${digestOptions.opaque}" `;
  }

  header += `response=${response}`;

  return header;
}

function parseHeaderForData(authenticateHeader: string) {
  const headers: DigestHeader = [
    ...authenticateHeader.matchAll(/(realm|domain|nonce|opaque|stale|algorithm|qop)="([^"]+)"/g),
  ].reduce(
    (acc, [, k, v]) => {
      acc[k] = v;
      return acc;
    },
    { realm: '', nonce: '' },
  );

  return headers;
}

function generateA1Hash({
  digestOptions,
  username,
  password,
  cnonce,
}: {
  digestOptions: DigestHeader;
  username: string;
  password: string;
  cnonce: string;
}) {
  let a1: string;
  if (!digestOptions.algorithm || digestOptions.algorithm === 'MD5') {
    a1 = md5(`${username}:${digestOptions.realm}:${password}`);
  } else if (digestOptions.algorithm === 'MD5-sess') {
    a1 = md5(`${username}:${digestOptions.realm}:${password}:${digestOptions.nonce}:${cnonce}`);
  }

  return a1;
}

function generateA2Hash({
  qop,
  method,
  uri,
  entityBody,
}: {
  qop: string;
  method: string;
  uri: string;
  entityBody: string;
}) {
  let a2: string;
  if (qop === 'auth' || qop === '') {
    a2 = md5(`${method}:${uri}`);
  } else if (qop === 'auth-int') {
    a2 = md5(`${method}:${uri}:${md5(entityBody)}`);
  }

  return a2;
}

function generateResponse({
  digestOptions,
  a1,
  a2,
  nc,
  cnonce,
}: {
  digestOptions: DigestHeader;
  a1: string;
  a2: string;
  nc: string;
  cnonce: string;
}) {
  let response: string;
  if (digestOptions.qop) {
    response = md5(`${a1}:${digestOptions.nonce}:${nc}:${cnonce}:${digestOptions.qop}:${a2}`);
  } else {
    response = md5(`${a1}:${digestOptions.nonce}:${a2}`);
  }
  return response;
}

export function findNonceCount(auth: string) {
  return auth.match(/nc=([^"]+) /)[1];
}
