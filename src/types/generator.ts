export interface IDigestHeader {
  realm: string;
  domain?: string;
  nonce: string;
  opaque?: string;
  stale?: string;
  algorithm?: string;
  qop?: string;
}

export interface IParamOptions {
  authenticateHeader: string;
  username: string;
  password: string;
  uri: string;
  method: string;
  cnonce?: string;
  nc?: string;
  entityBody?: string;
}
