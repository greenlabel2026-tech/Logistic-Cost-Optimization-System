const API_URL = "api/shipments";
let selectedShipmentId = null;

function updateDashboard(shipments) {
  if (!Array.isArray(shipments)) {
    throw new Error("Invalid shipment data received from the server");
  }

  document.getElementById("totalShipments").textContent = shipments.length;
  document.getElementById("pendingShipments").textContent = shipments.filter(
    (shipment) => shipment.status === "Pending",
  ).length;
}

// Add a new shipment
document
  .getElementById("shipmentForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const shipment = {
      source: document.getElementById("source").value.trim(),
      destination: document.getElementById("destination").value.trim(),
      weight: Number(document.getElementById("weight").value),
      shipmentDate: document.getElementById("shipmentDate").value,
    };

    const message = document.getElementById("message");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipment),
      });

      if (!response.ok) {
        throw new Error("Unable to add shipment");
      }

      message.textContent = "Shipment added successfully!";
      message.style.color = "green";

      document.getElementById("shipmentForm").reset();

      await loadShipments();
    } catch (error) {
      message.textContent = error.message;
      message.style.color = "red";
    }
  });

// Load all shipments
async function loadShipments() {
  const table = document.getElementById("shipmentTable");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load shipments");
    }

    const shipments = await response.json();
    updateDashboard(shipments);

    table.innerHTML = "";

    if (shipments.length === 0) {
      table.innerHTML = "<tr><td colspan='7'>No shipments found</td></tr>";
      return;
    }

    shipments.forEach((shipment) => {
      const row = document.createElement("tr");

      const values = [
        shipment.shipmentId,
        shipment.source,
        shipment.destination,
        shipment.weight,
        shipment.shipmentDate,
        shipment.status,
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "";
        row.appendChild(cell);
      });

      // Action buttons
      const actionCell = document.createElement("td");

      // Optimize Route button
      const optimizeButton = document.createElement("button");

      optimizeButton.textContent = "Optimize Route";

      optimizeButton.addEventListener("click", function () {
        selectedShipmentId = shipment.shipmentId;
        optimizeRoute(shipment.shipmentId);
      });

      actionCell.appendChild(optimizeButton);

      // Delete button
      const deleteButton = document.createElement("button");

      deleteButton.textContent = "Delete";
      deleteButton.style.backgroundColor = "#dc3545";
      deleteButton.style.color = "white";
      deleteButton.style.border = "none";
      deleteButton.style.padding = "8px 12px";
      deleteButton.style.borderRadius = "6px";
      deleteButton.style.marginLeft = "8px";
      deleteButton.style.cursor = "pointer";

      deleteButton.addEventListener("click", function () {
        deleteShipment(shipment.shipmentId);
      });

      actionCell.appendChild(deleteButton);

      row.appendChild(actionCell);
      table.appendChild(row);
    });
  } catch (error) {
    table.innerHTML = "<tr><td colspan='7'>Error loading shipments</td></tr>";

    console.error(error);
  }
}

// Permanently delete a shipment
async function deleteShipment(shipmentId) {
  const confirmed = confirm(
    "Are you sure you want to permanently delete shipment #" + shipmentId + "?",
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      API_URL + "?shipmentId=" + encodeURIComponent(shipmentId),
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to delete shipment");
    }

    alert("Shipment deleted successfully!");

    if (selectedShipmentId === shipmentId) {
      selectedShipmentId = null;
    }

    // Refresh shipment table
    await loadShipments();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

// Optimize route
async function optimizeRoute(shipmentId) {
  const result = document.getElementById("optimizationResult");

  result.textContent = "Calculating route costs...";

  try {
    const response = await fetch(
      "api/optimize?shipmentId=" + encodeURIComponent(shipmentId),
    );

    if (!response.ok) {
      throw new Error("Route optimization failed");
    }

    const routes = await response.json();

    if (routes.length === 0) {
      result.textContent = "No matching routes found for this shipment.";
      return;
    }

    document.getElementById("totalCost").textContent =
      "₹" + Number(routes[0].totalCost).toFixed(2);
    result.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Available Routes";
    result.appendChild(heading);

    routes.forEach((route, index) => {
      const card = document.createElement("div");
      card.style.padding = "12px";
      card.style.margin = "10px 0";
      card.style.border = "1px solid #cbd5e1";
      card.style.borderRadius = "6px";

      const details = document.createElement("p");

      details.textContent =
        "Route " +
        route.routeId +
        " | " +
        route.source +
        " to " +
        route.destination +
        " | Distance: " +
        route.distance +
        " km" +
        " | Weight: " +
        route.weight +
        " kg" +
        " | Transport: " +
        route.transportMode +
        " | Estimated Cost: ₹" +
        Number(route.totalCost).toFixed(2);

      card.appendChild(details);

      if (index === 0) {
        const recommendation = document.createElement("strong");
        recommendation.textContent = "Recommended: Lowest estimated cost";
        recommendation.style.color = "green";

        card.appendChild(recommendation);
      }

      result.appendChild(card);
    });
  } catch (error) {
    result.textContent = error.message;
    console.error(error);
  }
}

// Load shipments when page opens
document.addEventListener("DOMContentLoaded", loadShipments);

document
  .getElementById("refreshShipments")
  .addEventListener("click", loadShipments);

document.getElementById("optimizeRoute").addEventListener("click", function () {
  if (selectedShipmentId === null) {
    document.getElementById("optimizationResult").textContent =
      "Select a shipment by clicking its Optimize Route button first.";
    return;
  }

  optimizeRoute(selectedShipmentId);
});

// Initialize Leaflet map
document.addEventListener("DOMContentLoaded", function () {
  const mapElement = document.getElementById("route-map");

  if (!mapElement) {
    return;
  }

  const map = L.map("route-map").setView([23.3441, 85.3096], 7);

  // Load OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Default marker for Ranchi
  L.marker([23.3441, 85.3096]).addTo(map).bindPopup("Ranchi").openPopup();
});
