import md5 = require('md5');
import { IDigestHeader, IParamOptions } from '../types/generator';

export function generateDigestAuth(params: IParamOptions) {
  const digestOptions = parseHeaderForData(params.authenticateHeader);

  const cnonce = params.cnonce ? params.cnonce : '';

  const nc = params.nc ? parseInt(params.nc + 1, 16).toString(16) : '00000000';

  const algorithm = digestOptions.algorithm ? digestOptions.algorithm : 'MD5';

  const qop = digestOptions.qop ? digestOptions.qop : '';

  const method = params.method.toUpperCase();

  const { username, password, uri, entityBody } = params;

  const a1 = generateA1Hash({ digestOptions, username, password, cnonce });
  const a2 = generateA2Hash({ qop, method, uri, entityBody });
  const response = generateResponse({ digestOptions, a1, a2, nc, cnonce });

  return buildHeader(
    {
      algorithm,
      cnonce,
      nc,
      response,
      uri,
      username,
    },
    digestOptions,
  );
}

function buildHeader(
  params: {
    username: string;
    uri: string;
    algorithm: string;
    nc: string;
    cnonce: string;
    response: string;
  },
  digestOptions: IDigestHeader,
) {
  const { username, uri, algorithm, nc, cnonce, response } = params;
  let header = `Digest username="${username}" realm="${digestOptions.realm}" nonce="${digestOptions.nonce}" uri="${uri}" algorithm="${algorithm}" `;

  if (digestOptions.qop) {
    header += `qop=${digestOptions.qop} nc=${nc} cnonce="${cnonce}" `;
  }

  if (digestOptions.opaque) {
    header += `opaque="${digestOptions.opaque}" `;
  }

  header += `response="${response}"`;

  return header;
}

function parseHeaderForData(authenticateHeader: string) {
  const headers: IDigestHeader = [
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
  digestOptions: IDigestHeader;
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
  digestOptions: IDigestHeader;
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
