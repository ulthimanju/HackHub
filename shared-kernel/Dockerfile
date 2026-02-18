# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app
COPY pom.xml .
RUN mvn install -N
COPY shared-kernel/src /home/app/shared-kernel/src
COPY shared-kernel/pom.xml /home/app/shared-kernel/pom.xml
RUN mvn -f shared-kernel/pom.xml clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/shared-kernel/target/*-exec.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app.jar"]
