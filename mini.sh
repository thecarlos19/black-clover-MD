#!/data/data/com.termux/files/usr/bin/bash
# Código creado por The Carlos 👑

# Comandos sugeridos en caso de fallo
COMANDOS="pkg install git -y
pkg install nodejs -y
pkg install ffmpeg -y
pkg install imagemagick -y
pkg install yarn -y
git clone https://github.com/thecarlos19/black-clover-MD.git
cd black-clover-MD
yarn install
npm install
npm start"

# Verifica conexión a Internet
ping -c 1 google.com &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "\033[0;31mSin conexión a Internet. Verifique su red e intente nuevamente.\033[0m"
  exit 1
fi

# Arte inicial
echo -e "\e[35m
_░▒███████
░██▓▒░░▒▓██
██▓▒░__░▒▓██___██████
██▓▒░____░▓███▓__░▒▓██
██▓▒░___░▓██▓_____░▒▓██
██▓▒░_______________░▒▓██
_██▓▒░______________░▒▓██
__██▓▒░____________░▒▓██
___██▓▒░__________░▒▓██
____██▓▒░________░▒▓██
_____██▓▒░_____░▒▓██
______██▓▒░__░▒▓██
_______█▓▒░░▒▓██
_________░▒▓██
_______░▒▓██
_____░▒▓██\n\e[0m"

echo -e "\033[01;93mPreparando instalación de Black Clover-MD...\033[0m"
echo -e "\033[01;32mInstalando dependencias necesarias...\033[0m"

# Función de instalación genérica
instalar_dependencia() {
  local paquete=$1
  local comando_check=$2

  if command -v $comando_check >/dev/null 2>&1; then
    echo -e "\033[01;33m$paquete ya está instalado.\033[0m"
  else
    salida=$(pkg install $paquete -y 2>&1)
    if echo "$salida" | grep -E -i -q '(command not found|unable to locate package|Failed to fetch|Timeout)'; then
      echo -e "\033[0;31mError al instalar $paquete:\n$salida\033[0m"
      echo -e "\033[0;34mInstálelo manualmente:\n$COMANDOS\033[0m"
      exit 1
    else
      echo -e "\033[01;32m$paquete se ha instalado correctamente.\033[0m"
    fi
  fi
}

# Instalación de dependencias esenciales
instalar_dependencia git git
instalar_dependencia nodejs node
instalar_dependencia ffmpeg ffmpeg
instalar_dependencia imagemagick convert

# Yarn desde npm si no está instalado
if command -v yarn >/dev/null 2>&1; then
  echo -e "\033[01;33mYarn ya está instalado.\033[0m"
else
  salida=$(npm install -g yarn 2>&1)
  if echo "$salida" | grep -E -i -q '(command not found|Failed)'; then
    echo -e "\033[0;31mError al instalar yarn:\n$salida\033[0m"
    echo -e "\033[0;34mInstálelo manualmente:\n$COMANDOS\033[0m"
    exit 1
  else
    echo -e "\033[01;32mYarn se ha instalado correctamente.\033[0m"
  fi
fi

# Clonar repositorio de Black Clover-MD
if [ ! -d "black-clover-MD" ]; then
  echo -e "\033[1;35mClonando el repositorio de Black Clover-MD...\033[0m"
  git clone https://github.com/thecarlos19/black-clover-MD.git
  echo -e "\033[01;32mRepositorio clonado correctamente.\033[0m"
fi

cd black-clover-MD || { echo -e "\033[0;31mNo se pudo entrar al directorio black-clover-MD\033[0m"; exit 1; }

# Instalar dependencias del proyecto
echo -e "\033[0;34mInstalando dependencias con yarn...\033[0m"
yarn install || { echo -e "\033[0;31mError instalando dependencias de yarn.\033[0m"; exit 1; }

echo -e "\033[0;34mInstalando dependencias con npm...\033[0m"
npm install || { echo -e "\033[0;31mError instalando dependencias de npm.\033[0m"; exit 1; }

# Mensaje final
clear
echo -e "\e[36m
┏━━━━━━━━━⪩
┃˚₊ · ͟͟͞͞➳❥ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈𝐎́𝐍
┃⏤͟͟͞͞ Black Clover - MD
┗━━━━━━━━━⪩

✰ Código creado por:
» The Carlos 👑
✰ Créditos originales:
» devcarlos 
✰ GitHub:
» https://github.com/Thecarlos19 

Gracias por preferirnos.\n\e[0m"

# Iniciar bot
echo -e "\033[01;32mIniciando Black Clover Bot...\033[0m"
npm start