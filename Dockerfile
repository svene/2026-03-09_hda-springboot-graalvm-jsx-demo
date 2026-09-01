# syntax=docker/dockerfile:1

##### Stage 1: Build the frontend bundle (esbuild -> ssr.js) #####
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
# Produces /app/target/classes/graaljs/ssr.js
RUN npm run build

##### Stage 2: Build the JAR with Maven #####
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies separately from source for faster rebuilds
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src

# Bring in the frontend bundle produced above.
# IMPORTANT: no "clean" here, or this file gets wiped before packaging.
COPY --from=frontend-build /app/target/classes/graaljs/ssr.js ./target/classes/graaljs/ssr.js

RUN mvn -B package -DskipTests

##### Stage 3: Runtime on GraalVM JDK (needed for GraalJS to JIT properly) #####
FROM ghcr.io/graalvm/jdk-community:21
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
