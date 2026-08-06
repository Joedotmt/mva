```sh
python3 build.py
python3 verify.py
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000/`.

Shared HTML is maintained in `src/templates/`, page content in `src/pages/`, and runtime CSS/JavaScript in `src/assets/`.

