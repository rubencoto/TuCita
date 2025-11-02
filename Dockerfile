# ==================================================
# Multi-stage Dockerfile para TuCita
# Backend .NET 8 + Frontend React (Vite)
# ==================================================

# ===== STAGE 1: Build Frontend (React + Vite) =====
FROM node:20-alpine AS frontend-build
WORKDIR /src/ClientApp

# Copiar package.json y package-lock.json (si existe)
COPY TuCita/ClientApp/package*.json ./

# Instalar dependencias de Node
RUN npm install

# Copiar todo el código del frontend
COPY TuCita/ClientApp/ ./

# Construir la aplicación React con Vite
RUN npm run build

# ===== STAGE 2: Build Backend (.NET 8) =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["TuCita.Shared/TuCita.Shared.csproj", "TuCita.Shared/"]
COPY ["TuCita/TuCita.csproj", "TuCita/"]
RUN dotnet restore "TuCita/TuCita.csproj"

# Copiar todo el código fuente
COPY TuCita.Shared/ TuCita.Shared/
COPY TuCita/ TuCita/

# Copiar los archivos build del frontend al proyecto backend
COPY --from=frontend-build /src/ClientApp/dist /src/TuCita/ClientApp/dist

# Publicar la aplicación .NET
WORKDIR /src/TuCita
RUN dotnet publish "TuCita.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ===== STAGE 3: Runtime (Solo lo necesario) =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Crear un usuario no-root para mayor seguridad
RUN addgroup --system --gid 1000 tucita && \
    adduser --system --uid 1000 --ingroup tucita --shell /bin/sh tucita

# Copiar los archivos publicados desde la etapa de build
COPY --from=backend-build /app/publish .

# Cambiar permisos
RUN chown -R tucita:tucita /app

# Cambiar a usuario no-root
USER tucita

# Exponer puertos
EXPOSE 8080
EXPOSE 8081

# Variables de entorno por defecto
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Punto de entrada
ENTRYPOINT ["dotnet", "TuCita.dll"]
