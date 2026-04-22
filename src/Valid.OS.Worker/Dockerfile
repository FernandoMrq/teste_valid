# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Directory.Build.props ./
COPY src/ src/
# Restore só o projeto publicado: a .sln referencia tests/ que não entram na imagem.
RUN dotnet restore src/Valid.OS.Worker/Valid.OS.Worker.csproj
RUN dotnet publish src/Valid.OS.Worker/Valid.OS.Worker.csproj -c Release -o /app/publish /p:UseAppHost=false

# Infrastructure referencia Microsoft.AspNetCore.App; runtime base não basta.
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Valid.OS.Worker.dll"]
