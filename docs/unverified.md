# Unverified or unavailable

- `assets/bg-mars.png`: commit `b84c157` added this image with the message “fix(scene): transparent sky keying for Mars panorama and smooth horizon haze,” but the commit contains no source or license. The file is absent from this checkout. Its provenance and reuse rights remain unverified. The attribution record intentionally has an empty URL so the credits screen will not present an invented license.
- `data/flares_2024_05.json` is absent. May 2024 storm dates and flare classes can be checked against NASA, but no local records can be audited.
- No individual crew members or worker choice appear in the engine public API. A true crew choice balance comparison cannot be made here.
- The user-supplied task calls for Fredoka and Nunito, and a planned switch to Archivo and IBM Plex Mono. This checkout has no font imports, so actual runtime font usage is not verified. Font license URLs are valid, but the `live` flag follows the stated current/planned status.
- NASA CCMC DONKI: the attribution uses the official database page as its source URL. A dataset-specific license page was not found, so reuse terms are not asserted.
- `ui/audio.js` synthesizes sounds in code and needs no external sound license. `main.js` also tries `assets/sfx-<name>.mp3`, but no such files are present here; any future files would need separate provenance.
