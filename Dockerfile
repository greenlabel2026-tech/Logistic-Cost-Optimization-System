FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM tomcat:11.0-jdk17-temurin

RUN rm -rf webapps/*
COPY --from=build /app/target/LogisticCostOptimization.war webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]
