# ============================================================================
# VOLTIX: Urban EV Charging Network Management System
# Backend Dockerfile (Spring Boot 3.3.4 + Eclipse Temurin JDK 21)
# ============================================================================

# Multi-stage Build Stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable fat JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Production Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add unprivileged system user for container security
RUN addgroup -S voltix && adduser -S voltix -G voltix
USER voltix:voltix

# Copy compiled JAR from builder stage
COPY --from=builder --chown=voltix:voltix /app/target/voltix-backend-*.jar app.jar

# Configuration Environment Defaults
ENV SERVER_PORT=8080 \
    DB_HOST=localhost \
    DB_PORT=3306 \
    DB_NAME=voltix_db \
    DB_USERNAME=root \
    DB_PASSWORD=rootpassword \
    JWT_SECRET=VoltixEVChargingNetworkSuperSecretKeyWithSufficientLengthForHMACSHA256SecurityStandard2026 \
    JWT_EXPIRATION_MS=86400000 \
    CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=40s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
