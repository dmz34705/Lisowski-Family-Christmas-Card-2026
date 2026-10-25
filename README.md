# Lisowski Family Christmas Globe

A local, responsive Christmas card prototype built with plain HTML, CSS, SVG, and JavaScript. No build or installation required.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this folder and open http://127.0.0.1:4173.

## Personalize

Edit `content.js` for the three greetings. Add your photos to `assets/` and set each story's `image` path. Set `finalImage` to the final printed-card image. All current greetings are sample copy; portraits are illustrated placeholders. Remove the sample-message label in index.html when your final copy is ready. The current three doors represent scuba, crocheting, and your parents’ 40th anniversary; parents share a door.

Miller and Bean each have a greeting in `content.js` under `cats`. Add their portraits and edit their sample messages there. The rust-red and sage-green gifts reveal their greetings without affecting tree progress.

## Experience

Wake the globe → open any door → read its greeting → add light to the tree → repeat → final card. After all three wishes, the final-card button starts a star-and-snow reveal. Guests choose when to continue so there is time to discover the optional cat gifts. Previously visited doors can be reopened. Closing a greeting without adding its light does not complete it. Sound is opt-in and generated locally, without an audio download. There is no forced reading timer. Target pacing is 45–60 seconds, depending on reading speed.

Keyboard: Tab to controls, Enter/Space to activate, Escape to close a greeting. Reduced-motion preferences disable snowfall and visual transitions. Google Fonts are optional; system serif/sans-serif fallbacks work offline. No tracking, uploads, backend, or external image requests. Nothing is published yet.

## Cat audio and hints

Both gifts now sit among the presents beneath the tree. A single “meow!” bubble appears for two seconds at irregular intervals (roughly 5.5–12 seconds apart), or when a gift is hovered/focused. Hints pause while a greeting or the final card is open. Desktop mouse hover and gift activation play a short synthesized placeholder meow when Sound is on; a cooldown prevents repeated overlapping sounds. Sound off stops cat audio immediately. Add a local recording path to each cat's `sound` field in `content.js` to replace the placeholder (e.g. `assets/miller-meow.mp3`).

Once all three tree lights are added and both cat gifts have been opened, closing the last greeting starts a four-second pause before the automatic final reveal. Reopening a greeting or hiding the browser tab cancels the countdown; it restarts when the scene is visible again. The final-card button still allows an earlier reveal.

The cat recordings are extracted audio only (AAC/M4A) from the user-provided videos: Miller's 2.9-second clip and Bean's 1-second clip. They live in `assets/` and are assigned in `content.js`.
