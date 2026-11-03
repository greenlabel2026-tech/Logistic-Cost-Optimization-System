package com.logistics.servlet;

import com.google.gson.Gson;
import com.logistics.model.Shipment;
import com.logistics.util.DBConnection;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/shipments")
public class ShipmentServlet extends HttpServlet {

    private Gson gson = new Gson();

    // Get all shipments
    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        List<Shipment> shipments = new ArrayList<>();

        String sql = "SELECT * FROM shipments";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {

                Shipment shipment = new Shipment();

                shipment.setShipmentId(rs.getInt("shipment_id"));
                shipment.setSource(rs.getString("source"));
                shipment.setDestination(rs.getString("destination"));
                shipment.setWeight(rs.getDouble("weight"));
                shipment.setShipmentDate(rs.getDate("shipment_date"));
                shipment.setStatus(rs.getString("status"));

                shipments.add(shipment);
            }

            PrintWriter out = response.getWriter();
            out.print(gson.toJson(shipments));
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    // Add a new shipment
    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
                          throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {

            com.google.gson.JsonObject json =
                gson.fromJson(request.getReader(),
                              com.google.gson.JsonObject.class);

            Shipment shipment = new Shipment();

            shipment.setSource(json.get("source").getAsString());
            shipment.setDestination(json.get("destination").getAsString());
            shipment.setWeight(json.get("weight").getAsDouble());

            shipment.setShipmentDate(
                Date.valueOf(json.get("shipmentDate").getAsString())
            );

            String sql = "INSERT INTO shipments " +
                    "(source, destination, weight, shipment_date, status) " +
                    "VALUES (?, ?, ?, ?, ?)";

            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setString(1, shipment.getSource());
                ps.setString(2, shipment.getDestination());
                ps.setDouble(3, shipment.getWeight());
                ps.setDate(4, shipment.getShipmentDate());
                ps.setString(5, "Pending");

                ps.executeUpdate();
            }

            response.setStatus(HttpServletResponse.SC_CREATED);

            PrintWriter out = response.getWriter();
            out.print("{\"message\":\"Shipment added successfully\"}");
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    // Permanently delete a shipment
    @Override
    protected void doDelete(HttpServletRequest request,
                            HttpServletResponse response)
                            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String shipmentId = request.getParameter("shipmentId");

        if (shipmentId == null || shipmentId.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print(
                "{\"message\":\"Shipment ID is required\"}"
            );
            return;
        }

        try {
            int id = Integer.parseInt(shipmentId);

            if (id <= 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().print(
                    "{\"message\":\"Invalid shipment ID\"}"
                );
                return;
            }

            String sql = "DELETE FROM shipments WHERE shipment_id = ?";

            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setInt(1, id);

                int rowsDeleted = ps.executeUpdate();

                if (rowsDeleted > 0) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().print(
                        "{\"message\":\"Shipment deleted successfully\"}"
                    );
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().print(
                        "{\"message\":\"Shipment not found\"}"
                    );
                }
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print(
                "{\"message\":\"Invalid shipment ID\"}"
            );

        } catch (Exception e) {
            response.setStatus(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );
            response.getWriter().print(
                "{\"message\":\"Unable to delete shipment. It may have related records.\"}"
            );
            e.printStackTrace();
        }
    }
}