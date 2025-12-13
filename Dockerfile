# ===================================
# Stage 1: Build React Frontend
# ===================================
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy package files
COPY ClientApp/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY ClientApp/ ./

# Build frontend (Vite)
RUN npm run build

# ===================================
# Stage 2: Build .NET Backend
# ===================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["TuCita.csproj", "./"]
RUN dotnet restore "TuCita.csproj"

# Copy everything else
COPY . .

# Build backend
RUN dotnet build "TuCita.csproj" -c Release -o /app/build

# ===================================
# Stage 3: Publish .NET App
# ===================================
FROM backend-build AS publish
WORKDIR /src

# Copy built frontend into publish location
COPY --from=frontend-build /app/dist ./ClientApp/dist

# Publish the application
RUN dotnet publish "TuCita.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ===================================
# Stage 4: Final Runtime Image
# ===================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Heroku uses dynamic PORT environment variable
EXPOSE 8080

# Environment variables
ENV ASPNETCORE_ENVIRONMENT=Production

# Heroku will set PORT environment variable
# Program.cs already handles this with: builder.WebHost.UseUrls($"http://0.0.0.0:${port}");

# Entry point
ENTRYPOINT ["dotnet", "TuCita.dll"]
