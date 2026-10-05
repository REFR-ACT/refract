# Refract

The frontend for [refracthack.org](https://refracthack.org), a student hackathon at PRISMS.

Plain HTML, CSS and JavaScript. The site includes the logo lighting effect, a scrolling timeline, and draggable team icons.

## Preview locally

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. The event page works without a build step. Sign-in, account details and the organizer dashboard need the private backend; a static preview cannot provide those features.

## Files

- `dist/index.html`: event details, schedule, sponsorship and FAQ
- `dist/app.js`: lighting, navigation, timeline and counters
- `dist/teams.js` and `dist/teams.css`: team animation and dragging
- `dist/register/`, `dist/account/`, `dist/admin/`: browser interfaces
- `dist/assets/`: artwork and fonts, with the font licenses alongside them

The browser uses relative `/api/` URLs. Production serves these files and the private API on the same origin. Never put server credentials or participant data in this repository.

The backend, deployment files and earlier project history stay in the private `REFR-ACT/refract-backend` repository. This frontend copy starts with a new history. For a release, copy the reviewed `dist/` contents into the private deployment checkout and use its existing deployment process.
