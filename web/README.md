```sh
python3 build.py
python3 verify.py
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000/`.

Shared HTML is maintained in `src/templates/`, page content in `src/pages/`, and runtime CSS/JavaScript in `src/assets/`.

The GitHub Pages workflow rebuilds and verifies the public site from `src/` on every push to `main`. It publishes the generated site at `/` and the internal application at `/portal/`.
