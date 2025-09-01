#!/data/data/com.termux/files/usr/bin/bash
# Script para iniciar el bot en Termux

termux-wake-lock
cd ~/black-clover-MD
tmux new -d -s blackclover "npm start"
echo "✅ Bot iniciado en segundo plano usando tmux"