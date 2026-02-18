# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

# Copy the parent pom and install it locally
COPY pom.xml .
RUN mvn install -N

# Build event-service
COPY event-service /home/app/event-service
RUN mvn -f event-service/pom.xml clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/event-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app.jar"]
