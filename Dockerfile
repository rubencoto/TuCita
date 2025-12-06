# Stage 1: Build Node.js frontend
FROM node:20-alpine AS node-build
WORKDIR /app/ClientApp

# Copiar archivos de package.json
COPY TuCita/ClientApp/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente del frontend
COPY TuCita/ClientApp/ ./

# Build del frontend con Vite
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /app

# Copiar archivo de proyecto y restaurar dependencias
COPY TuCita/*.csproj ./TuCita/
RUN dotnet restore TuCita/TuCita.csproj

# Copiar el resto del código
COPY TuCita/ ./TuCita/

# Copiar el build del frontend desde el stage anterior
COPY --from=node-build /app/ClientApp/dist ./TuCita/ClientApp/dist

# Publicar la aplicación
WORKDIR /app/TuCita
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Instalar dependencias necesarias para producción
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos publicados
COPY --from=dotnet-build /app/publish .

# Exponer puerto dinámico de Heroku
EXPOSE $PORT

# Variable de entorno para ASP.NET Core
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Comando para ejecutar la aplicación
ENTRYPOINT ["dotnet", "TuCita.dll"]
