# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

# Copy the parent pom and install it locally
COPY pom.xml .
RUN mvn install -N

# Build auth-service
COPY auth-service /home/app/auth-service
RUN mvn -f auth-service/pom.xml clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app.jar"]
