
package com.logistics.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final String URL =
        "jdbc:mysql://localhost:3306/logistic_db";

    private static final String USER =
        System.getenv("DB_USER");

    private static final String PASSWORD =
        System.getenv("DB_PASSWORD");

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection connection = DriverManager.getConnection(
                URL, USER, PASSWORD
            );

            System.out.println("Database connected successfully!");
            return connection;
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver is not available.", e);
        }
    }
}
