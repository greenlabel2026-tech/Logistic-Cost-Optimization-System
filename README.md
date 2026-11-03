# Logistic Cost Optimization System

This project is a Java Servlet web application packaged as a WAR file. It
requires Java, Maven, MySQL, and Apache Tomcat 9.

## Requirements

- JDK 8 or later
- Maven 3.8+
- MySQL Server
- Apache Tomcat 11

## Configure MySQL

Run the database script from the project directory:

```powershell
mysql -u root -p < database\logistic.sql
```

The application connects to `localhost:3306/logistic_db` and reads the
credentials from `DB_USER` and `DB_PASSWORD`.

Route estimates include distance, driver charges, other charges, and an
additional ₹2 per kilogram based on the shipment weight. Optimization lists
all configured routes for the selected shipment. Add more routes to the
`routes` and `transportation_cost` tables to make them available.

```powershell
$env:DB_USER = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

## Build and run

From the project directory:

```powershell
mvn clean package
Copy-Item target\LogisticCostOptimization.war "C:\path\to\tomcat\webapps\"
& "C:\path\to\tomcat\bin\startup.bat"
```

Open the application at:

```text
http://localhost:8080/LogisticCostOptimization/
```

Keep the `DB_USER` and `DB_PASSWORD` environment variables set in the
Windows account or process that starts Tomcat. If Tomcat is installed as a
Windows service, configure those variables in the service environment instead
of only setting them in a PowerShell window.

## Existing WAR

If `target\LogisticCostOptimization.war` is already present, it can be copied
directly to Tomcat 11's `webapps` folder. Rebuild it with Maven after changing
source files.

For the Tomcat installation in this environment:

```powershell
Copy-Item target\LogisticCostOptimization.war `
  "C:\Users\pchp8\Downloads\apache-tomcat-11.0.27\apache-tomcat-11.0.27\webapps\"
& "C:\Users\pchp8\Downloads\apache-tomcat-11.0.27\apache-tomcat-11.0.27\bin\startup.bat"
```