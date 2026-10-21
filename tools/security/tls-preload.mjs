// Bun 1.4.3 still bundles the compromised eMudhra trust paths. Keep this preload
// until a released Bun passes the negative TLS probes without it. The public CA
// snapshot is Homebrew ca-certificates 2026-10-20 (Mozilla roots).
import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import { setDefaultCACertificates } from "node:tls";

const ca = readFileSync(new URL("./ca.pem", import.meta.url), "utf8");

const certificates = ca.match(
	/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
);

const blocked = new Set([
	"D7A7A0FB5D7E2731D771E9484EBCDEF71D5F0C3E0A2948782BC83EE0EA699EF4",
	"86A1ECBA089C4A8D3BBE2734C612BA341D813E043CF9E8A862CD5C57A36BBE6B",
]);

if (!certificates?.length) throw new Error("TLS CA bundle is empty");

for (const certificate of certificates) {
	const fingerprint = new X509Certificate(
		certificate,
	).fingerprint256.replaceAll(":", "");

	if (blocked.has(fingerprint))
		throw new Error("TLS CA bundle contains a distrusted root");
}

setDefaultCACertificates(certificates);

const nativeFetch = globalThis.fetch;

globalThis.fetch = Object.assign(
	(input, init) => nativeFetch(input, { ...init, tls: { ...init?.tls, ca } }),
	{ preconnect: nativeFetch.preconnect },
);

const NativeWebSocket = globalThis.WebSocket;

globalThis.WebSocket = class extends NativeWebSocket {
	constructor(url, protocols) {
		const options =
			protocols instanceof Object && !Array.isArray(protocols)
				? protocols
				: { protocols };

		super(url, { ...options, tls: { ...options.tls, ca } });
	}
};
