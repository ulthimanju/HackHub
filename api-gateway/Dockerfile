# syntax=docker/dockerfile:1
# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn install -N && mvn -f api-gateway/pom.xml dependency:resolve -q

COPY api-gateway/src api-gateway/src
RUN --mount=type=cache,target=/root/.m2 mvn -f api-gateway/pom.xml package -DskipTests

# Package stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /home/app/api-gateway/target/*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java","-jar","/app.jar"]
