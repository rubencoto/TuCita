#!/bin/bash

# ==================================================
# TuCita - Scripts de Utilidad (Linux/Mac)
# ==================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}TuCita - Docker Helper Script${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

show_menu() {
    echo -e "${YELLOW}Selecciona una opción:${NC}"
    echo -e "${NC}1. Construir imágenes Docker${NC}"
    echo -e "${NC}2. Iniciar aplicación (Producción)${NC}"
    echo -e "${NC}3. Iniciar aplicación (Desarrollo)${NC}"
    echo -e "${NC}4. Detener aplicación${NC}"
    echo -e "${NC}5. Ver logs${NC}"
    echo -e "${NC}6. Ver estado de contenedores${NC}"
    echo -e "${NC}7. Aplicar migraciones${NC}"
    echo -e "${NC}8. Hacer backup de la BD${NC}"
    echo -e "${RED}9. Limpiar todo (¡CUIDADO!)${NC}"
    echo -e "${NC}0. Salir${NC}"
    echo ""
}

build_images() {
    echo -e "${GREEN}Construyendo imágenes Docker...${NC}"
    docker-compose build
}

start_production() {
    echo -e "${GREEN}Iniciando aplicación en modo producción...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}? Aplicación iniciada${NC}"
    echo -e "${CYAN}  - Web: http://localhost:5000${NC}"
    echo -e "${CYAN}  - SQL: localhost:1433${NC}"
}

start_development() {
    echo -e "${GREEN}Iniciando aplicación en modo desarrollo...${NC}"
    docker-compose -f docker-compose.dev.yml up
}

stop_application() {
    echo -e "${YELLOW}Deteniendo aplicación...${NC}"
    docker-compose down
    echo -e "${GREEN}? Aplicación detenida${NC}"
}

show_logs() {
    echo -e "${GREEN}Mostrando logs (Ctrl+C para salir)...${NC}"
    docker-compose logs -f
}

show_status() {
    echo -e "${GREEN}Estado de contenedores:${NC}"
    docker-compose ps
}

apply_migrations() {
    echo -e "${GREEN}Aplicando migraciones de Entity Framework...${NC}"
    
    # Verificar si el contenedor está corriendo
    if docker ps | grep -q "tucita-app"; then
        echo -e "${CYAN}Ejecutando migraciones en el contenedor...${NC}"
        docker-compose exec tucita-app dotnet ef database update
    else
        echo -e "${CYAN}El contenedor no está corriendo. Aplicando migraciones localmente...${NC}"
        cd TuCita
        dotnet ef database update
        cd ..
    fi
}

backup_database() {
    echo -e "${GREEN}Creando backup de la base de datos...${NC}"
    
    # Crear directorio de backups si no existe
    mkdir -p ./backups
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backupName="TuCitaDb_${timestamp}.bak"
    
    echo -e "${CYAN}Generando backup: $backupName${NC}"
    
    docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "TuCita@2025!Secure" \
        -Q "BACKUP DATABASE TuCitaDb TO DISK = '/var/opt/mssql/backup/$backupName'"
    
    echo -e "${CYAN}Copiando backup al host...${NC}"
    docker cp "tucita-sqlserver:/var/opt/mssql/backup/$backupName" "./backups/$backupName"
    
    echo -e "${GREEN}? Backup completado: ./backups/$backupName${NC}"
}

clean_all() {
    echo -e "${RED}¡ADVERTENCIA! Esto eliminará TODOS los contenedores y volúmenes.${NC}"
    read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirmation
    
    if [ "$confirmation" == "SI" ]; then
        echo -e "${YELLOW}Eliminando contenedores y volúmenes...${NC}"
        docker-compose down -v
        echo -e "${GREEN}? Limpieza completada${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

# Loop principal
while true; do
    show_menu
    read -p "Opción: " choice
    echo ""
    
    case $choice in
        1) build_images ;;
        2) start_production ;;
        3) start_development ;;
        4) stop_application ;;
        5) show_logs ;;
        6) show_status ;;
        7) apply_migrations ;;
        8) backup_database ;;
        9) clean_all ;;
        0) 
            echo -e "${CYAN}¡Hasta luego!${NC}"
            exit 0
            ;;
        *) echo -e "${RED}Opción inválida${NC}" ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
