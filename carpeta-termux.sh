#!/data/data/com.termux/files/usr/bin/bash

# Rutas de las carpetas
CARPETAS=("blackSession'" "blackJadiBot")

for carpeta in "${CARPETAS[@]}"; do
    if [ -d "$HOME/$carpeta" ]; then
        rm -rf "$HOME/$carpeta"
        echo "Carpeta $carpeta eliminada ✅"
    else
        echo "Carpeta $carpeta no existe ❌"
    fi
done