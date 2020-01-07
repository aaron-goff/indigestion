export interface IDigestHeader {
  realm: string;
  domain?: string;
  nonce: string;
  opaque?: string;
  stale?: string;
  algorithm?: string;
  qop?: string;
}
