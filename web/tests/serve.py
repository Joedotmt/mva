"""Serve the exported files with the same optional path prefix as GitHub Pages."""

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent / "build"
BASE = os.environ.get("BASE_PATH", "").rstrip("/")


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if BASE:
            path = urlsplit(self.path).path
            if path == BASE:
                self.send_response(301)
                self.send_header("Location", BASE + "/")
                self.end_headers()
                return
            if not path.startswith(BASE + "/"):
                self.send_error(404)
                return
            self.path = self.path[len(BASE):]
        super().do_GET()

    def log_message(self, *_args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 4173), partial(Handler, directory=str(ROOT))).serve_forever()
