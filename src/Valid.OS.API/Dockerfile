# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Directory.Build.props ./
COPY src/ src/
# Restore só o projeto publicado: a .sln referencia tests/ que não entram na imagem.
RUN dotnet restore src/Valid.OS.API/Valid.OS.API.csproj
RUN dotnet publish src/Valid.OS.API/Valid.OS.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Valid.OS.API.dll"]
