# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Directory.Build.props valid-ordem-servico.sln ./
COPY src/ src/
RUN dotnet restore valid-ordem-servico.sln
RUN dotnet publish src/Valid.OS.Worker/Valid.OS.Worker.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:8.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Valid.OS.Worker.dll"]
