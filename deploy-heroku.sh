#!/bin/bash

# -----------------------------
# CONFIGURACIÓN INICIAL
# -----------------------------
APP_NAME="black-clover-md"

# Variables de entorno de ejemplo
SESSION_ID="tu_session_id_aqui"
OPENAI_KEY="tu_api_key_openai"
SPOTIFY_CLIENT_ID="tu_client_id_spotify"
SPOTIFY_CLIENT_SECRET="tu_client_secret_spotify"
MONGO_URI="mongodb+srv://usuario:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# -----------------------------
# DETECCIÓN DEL ENTORNO
# -----------------------------
OS_TYPE="$(uname)"
if [[ "$OS_TYPE" == "Linux" || "$OS_TYPE" == "Darwin" ]]; then
    echo "Sistema detectado: $OS_TYPE"
elif [[ "$PREFIX" == *"com.termux"* ]]; then
    echo "Sistema detectado: Termux"
else
    echo "Sistema desconocido, se intentará ejecutar de todas formas..."
fi

# -----------------------------
# COMPROBACIÓN HEROKU CLI
# -----------------------------
if ! command -v heroku &> /dev/null
then
    echo "Heroku CLI no encontrada. Instala desde https://devcenter.heroku.com/articles/heroku-cli"
    exit
fi

# -----------------------------
# LOGIN HEROKU
# -----------------------------
echo "Iniciando sesión en Heroku..."
heroku login

# -----------------------------
# CREACIÓN DE APP
# -----------------------------
echo "Creando app $APP_NAME en Heroku..."
heroku apps:create $APP_NAME || echo "La app ya existe. Continuando..."

# -----------------------------
# CREACIÓN DE PROCFILE
# -----------------------------
if [ ! -f "Procfile" ]; then
    echo "Creando Procfile..."
    echo "worker: node index.js" > Procfile
    echo "Procfile creado."
else
    echo "Procfile ya existe."
fi

# -----------------------------
# CONFIGURACIÓN NODEJS
# -----------------------------
echo "Configurando Node.js 18+..."
heroku buildpacks:set heroku/nodejs -a $APP_NAME

# -----------------------------
# VARIABLES DE ENTORNO
# -----------------------------
echo "Configurando variables de entorno..."
heroku config:set SESSION_ID="$SESSION_ID" -a $APP_NAME
heroku config:set OPENAI_KEY="$OPENAI_KEY" -a $APP_NAME
heroku config:set SPOTIFY_CLIENT_ID="$SPOTIFY_CLIENT_ID" -a $APP_NAME
heroku config:set SPOTIFY_CLIENT_SECRET="$SPOTIFY_CLIENT_SECRET" -a $APP_NAME
heroku config:set MONGO_URI="$MONGO_URI" -a $APP_NAME

# -----------------------------
# GIT INIT
# -----------------------------
if [ ! -d ".git" ]; then
    echo "Inicializando git..."
    git init
    git add .
    git commit -m "Deploy inicial a Heroku"
fi

# -----------------------------
# REMOTE HEROKU
# -----------------------------
git remote remove heroku 2>/dev/null
git remote add heroku https://git.heroku.com/$APP_NAME.git

# -----------------------------
# PUSH AUTOMÁTICO
# -----------------------------
echo "Subiendo código a Heroku..."
git add .
git commit -m "Deploy automático a Heroku" 2>/dev/null
git push heroku main -f

# -----------------------------
# MENSAJE FINAL
# -----------------------------
echo "================================"
echo "✅ Bot desplegado en Heroku con éxito."
echo "App: https://$APP_NAME.herokuapp.com"
echo "Recuerda revisar las Config Vars y ajustar según tu bot."
echo "================================="