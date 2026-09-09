# Restore deerva.com and concepts.deerva.com

## Confirmed diagnosis

- Cloudflare is the active DNS provider; Hostinger only remains the registrar and mail provider. DNS edits in Hostinger are inactive and should not be used.
- `deerva.com`, `www.deerva.com`, and `concepts.deerva.com` publicly resolve to Lovable at `185.158.133.1`.
- The required Lovable verification records are publicly visible, and valid HTTPS certificates already exist for all three names.
- Despite that, all three names currently return HTTP 421. In this project, `deerva.com` and `www.deerva.com` have been stuck as **drifted/offline** for more than three days, so this is no longer normal propagation.
- `concepts.deerva.com` belongs to the separate **Concepts** project, not this Deerva project.
- Cloudflare contains two verification values for `www`; one matches Lovable and one appears mistyped. The correct one is already visible, but the duplicate should be removed to keep DNS unambiguous.

## Recovery steps

1. Keep Cloudflare authoritative and leave the website A records in **DNS only** mode. Do not move nameservers back to Hostinger and do not remove the delegated `notify.*` email nameservers.
2. Remove only the incorrect duplicate `_lovable.www` TXT value in Cloudflare; preserve the exact value shown by Lovable.
3. Use **Recover** for `deerva.com` and `www.deerva.com` in this Deerva project so Lovable re-registers routing and completes activation.
4. Open the separate [Concepts project](/projects/3706a191-aa62-423c-9e13-760744934a67) and use **Recover** for `concepts.deerva.com` there. Do not connect it to the Deerva project, because that would move the domain away from Concepts.
5. Verify that each address returns the intended site over HTTPS:
   - `https://deerva.com`
   - `https://www.deerva.com`
   - `https://concepts.deerva.com`
6. If Lovable still returns HTTP 421 after recovery while DNS remains correct, contact Lovable Support with the confirmed details: correct A/TXT records, valid certificates, and routing stuck after three days. This isolates the remaining issue to Lovable’s domain-binding layer rather than Cloudflare or Hostinger.

## Safety boundary

No website code, mail routing, MX/SPF/DKIM records, or delegated Lovable email nameservers will be changed.
