#!/data/data/com.termux/files/usr/bin/bash
# Código desarrollado por @gata_dios 

BOT_DIR="black-clover-MD"
BOT_REPO="https://github.com/thecarlos19/$BOT_DIR"
DB_FILE="database.json"

GREEN='\033[32m'
BOLD='\033[1m'
RESET='\033[0m'

if [[ $(basename "$PWD") == "$BOT_DIR" ]]; then
    if [ -e "$DB_FILE" ]; then 
        echo -e "${BOLD}${GREEN}Moviendo \"$DB_FILE\" a \"$HOME\" y clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
        mv "$DB_FILE" "$HOME/"
        cd "$HOME" || exit
        rm -rf "$BOT_DIR"
        git clone "$BOT_REPO"
        cd "$BOT_DIR" || exit
        yarn --ignore-scripts || npm install
        if [ -e "$HOME/$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Rescatando archivo \"$DB_FILE\" y moviendo a \"$BOT_DIR\".${RESET}"
            mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
        fi
        echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        npm start
    else
        echo -e "${BOLD}${GREEN}\"$DB_FILE\" no existe en \"$BOT_DIR\", iniciando el bot...${RESET}"
        npm start
    fi

else
    echo -e "${BOLD}${GREEN}Ubicación actual: \"$PWD\"${RESET}"
    cd "$HOME" || exit

    if [ -d "$BOT_DIR" ]; then
        cd "$BOT_DIR" || exit
        if [ -e "$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Moviendo \"$DB_FILE\" a \"$HOME\" y actualizando repositorio...${RESET}"
            mv "$DB_FILE" "$HOME/"
            cd "$HOME" || exit
            rm -rf "$BOT_DIR"
            git clone "$BOT_REPO"
            cd "$BOT_DIR" || exit
            yarn --ignore-scripts || npm install
            if [ -e "$HOME/$DB_FILE" ]; then
                echo -e "${BOLD}${GREEN}Rescatando archivo \"$DB_FILE\" y moviendo a \"$BOT_DIR\".${RESET}"
                mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
            fi
        else
            echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        fi
    else
        echo -e "${BOLD}${GREEN}\"$BOT_DIR\" no existe, clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
        git clone "$BOT_REPO"
        cd "$BOT_DIR" || exit
        yarn --ignore-scripts || npm install
        if [ -e "$HOME/$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Rescatando archivo \"$DB_FILE\" y moviendo a \"$BOT_DIR\".${RESET}"
            mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
        fi
    fi

    echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
    npm start
fi