#!/usr/bin/env python3
"""Serve o Gabe's Chess somente no endereço local do próprio computador."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import signal
import time
import webbrowser


PROJECT_DIR = Path(__file__).resolve().parent
PORT = 8766


class ProjectHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def end_headers(self):
        # Sem cache: depois de atualizar os arquivos do projeto, o navegador sempre carrega a versão nova.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format_string, *args):
        # Mantém o terminal limpo enquanto o site carrega seus arquivos locais.
        return


def stop_on_hangup(_signum, _frame):
    raise SystemExit(0)


def main():
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), ProjectHandler)
    except OSError:
        print(f"Não foi possível iniciar o Gabe's Chess: a porta {PORT} já está em uso.")
        print("Feche a outra janela do Gabe's Chess (ela pode estar servindo uma pasta ANTIGA) e tente novamente.")
        print("Se não achar a janela, rode no terminal:  pkill -f iniciar-servidor.py")
        return
    server.daemon_threads = True
    url = f"http://127.0.0.1:{PORT}/"

    signal.signal(signal.SIGHUP, stop_on_hangup)
    print("Gabe's Chess está rodando somente neste computador.")
    print(f"Endereço: {url}")
    print(f"Pasta servida: {PROJECT_DIR}")
    print("Para encerrar o servidor, feche esta janela ou pressione Ctrl+C.")
    # O parâmetro muda a cada abertura: o navegador nunca reaproveita uma página antiga guardada em cache.
    webbrowser.open(f"{url}?abrir={int(time.time())}", new=2)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
