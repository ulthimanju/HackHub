# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY event-service/pom.xml event-service/pom.xml
RUN mvn install -N && mvn -f event-service/pom.xml dependency:resolve -q

COPY event-service/src event-service/src
RUN mvn -f event-service/pom.xml package -DskipTests

# Package stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /home/app/event-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app.jar"]
