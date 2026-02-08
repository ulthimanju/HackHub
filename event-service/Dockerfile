FROM maven:3.8.4-openjdk-17 AS build

# Install shared-kernel first
COPY shared-kernel /home/shared-kernel
RUN mvn -f /home/shared-kernel/pom.xml clean install -DskipTests

# Build event-service
COPY event-service/src /home/app/src
COPY event-service/pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app.jar"]
