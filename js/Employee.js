/* =========================================
   1. GET HTML ELEMENTS
   ========================================= */

const bookingTable = document.getElementById("employee-booking-list");
const logoutButton = document.getElementById("employee-logout");
const employeeMessage = document.getElementById("employee-message");

const totalBookings = document.getElementById("reserved-count");
const inUseCount = document.getElementById("in-use-count");
const returnedCount = document.getElementById("returned-count");
const inspectionCount = document.getElementById("inspection-count");

// Booking filter elements
const statCards = document.querySelectorAll(".stat-card");
const bookingFilterButtons = document.querySelectorAll(".booking-filter-btn");
const currentFilterLabel = document.getElementById("current-filter-label");

// Default filter
let currentFilter = "In Progress";


/* =========================================
   2. CHECK EMPLOYEE LOGIN
   ========================================= */

function getCurrentEmployee() {

    const currentUser = JSON.parse(
        localStorage.getItem("azoomUser") || "null"
    );

    return currentUser !== null &&
           currentUser.role === "employee";
}


function protectEmployeePage() {

    if (!getCurrentEmployee()) {
        window.location.replace("index.html");
        return false;
    }

    return true;
}


/* =========================================
   3. HANDLE EMPLOYEE LOGOUT
   ========================================= */

if (logoutButton !== null) {

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("azoomUser");

        window.location.replace("index.html");
    });
}


/* =========================================
   4. GET AND SAVE BOOKINGS
   ========================================= */

// Get all customer bookings
function getEmployeeBookings() {

    return JSON.parse(
        localStorage.getItem("azoomBookings") || "[]"
    );
}


// Save all customer bookings
function saveEmployeeBookings(bookings) {

    localStorage.setItem(
        "azoomBookings",
        JSON.stringify(bookings)
    );
}


/* =========================================
   5. DATE AND COST CALCULATIONS
   ========================================= */

// Get today's date in YYYY-MM-DD format
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// Calculate rental days
function calculateRentalDays(collectionDate, actualReturnDate) {

    const collection = new Date(collectionDate + "T00:00:00");
    const returning = new Date(actualReturnDate + "T00:00:00");

    const difference = returning - collection;

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    // Minimum rental charge is one day
    return Math.max(1, days);
}


// Calculate actual rental cost and final cost
function calculateFinalCost(booking) {

    const dailyRate = Number(booking.pricePerDay);

    const rentalDays = calculateRentalDays(
        booking.collectionDate,
        booking.actualReturnDate
    );

    const damageCharges = Number(booking.damageCharges) || 0;

    const rentalCost = rentalDays * dailyRate;

    booking.actualRentalDays = rentalDays;
    booking.actualRentalCost = rentalCost;

    booking.finalCost = rentalCost + damageCharges;
}


/* =========================================
   6. UPDATE BOOKING AND VEHICLE STATUS
   ========================================= */

function updateBookingStatus(booking) {

    // Customer has completed the final payment
    if (booking.finalPaymentPaid === true) {

        booking.status = "Completed";
        booking.carStatus = "Available";
    }

    // Employee has requested payment
    else if (booking.paymentRequested === true) {

        booking.status = "Pending Payment";
        booking.carStatus = "Pending Payment";
    }

    // Employee has completed inspection
    else if (booking.inspected === true) {

        booking.status = "Pending Payment";
        booking.carStatus = "Pending Payment";
    }

    // Vehicle has been returned
    else if (booking.returned === true) {

        booking.status = "Pending Inspection";
        booking.carStatus = "Pending Inspection";
    }

    // Vehicle has been collected
    else if (booking.collected === true) {

        booking.status = "In Use";
        booking.carStatus = "In Use";
    }

    // Booking has not been collected
    else {

        booking.status = "Reserved";
        booking.carStatus = "Reserved";
    }
}


/* =========================================
   7. HANDLE BOOKING FILTERS
   ========================================= */

// Update the selected filter and display matching bookings
function setBookingFilter(filter) {

    currentFilter = filter;

    // Update dashboard card highlights
    statCards.forEach(function (card) {

        card.classList.toggle(
            "active",
            card.dataset.filter === filter
        );
    });

    // Update additional filter button highlights
    bookingFilterButtons.forEach(function (button) {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    // Update the filter description
    if (currentFilterLabel !== null) {

        if (filter === "All") {

            currentFilterLabel.textContent = "Showing: All Bookings";

        } else if (filter === "Completed") {

            currentFilterLabel.textContent = "Showing: Completed Bookings";

        } else if (filter === "In Progress") {

            currentFilterLabel.textContent = "Showing: In Progress Bookings";

        } else {

            currentFilterLabel.textContent =
                "Showing: " + filter + " Bookings";
        }
    }

    displayEmployeeBookings();
}


// Dashboard card clicks
statCards.forEach(function (card) {

    card.addEventListener("click", function () {

        setBookingFilter(card.dataset.filter);
    });
});


// All Bookings, In Progress and Completed button clicks
bookingFilterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        setBookingFilter(button.dataset.filter);
    });
});


/* =========================================
   8. DISPLAY CUSTOMER BOOKINGS
   ========================================= */

function displayEmployeeBookings() {

    if (bookingTable === null) {
        return;
    }

    const bookings = getEmployeeBookings();

    bookingTable.innerHTML = "";

    let reservedCount = 0;
    let carsInUse = 0;
    let pendingInspection = 0;
    let pendingPayment = 0;


    // Create a table row for each booking
    for (let i = 0; i < bookings.length; i++) {

        const booking = bookings[i];


        /* ----- Set Default Fields ----- */

        if (booking.collected !== true) {
            booking.collected = false;
        }

        if (booking.returned !== true) {
            booking.returned = false;
        }

        if (booking.inspected !== true) {
            booking.inspected = false;
        }

        if (typeof booking.inspectionRemarks !== "string") {
            booking.inspectionRemarks = "";
        }

        if (booking.damageCharges === undefined) {
            booking.damageCharges = 0;
        }

        if (booking.paymentRequested !== true) {
            booking.paymentRequested = false;
        }

        // Separate final payment from original reservation payment
        if (booking.finalPaymentPaid !== true) {
            booking.finalPaymentPaid = false;
        }

        if (booking.actualReturnDate === undefined) {
            booking.actualReturnDate = "";
        }


        // Update booking status
        updateBookingStatus(booking);


        /* ----- Dashboard Statistics ----- */

        if (booking.finalPaymentPaid !== true) {

            if (booking.collected !== true) {

                reservedCount++;

            } else if (booking.returned !== true) {

                carsInUse++;

            } else if (booking.inspected !== true) {

                pendingInspection++;

            } else {

                pendingPayment++;
            }
        }


        /* ----- Apply Booking Filter ----- */

        let showBooking = false;

        if (currentFilter === "All") {

            showBooking = true;

        } else if (currentFilter === "Completed") {

            showBooking = booking.status === "Completed";

        } else if (currentFilter === "In Progress") {

            // In Progress includes everything except Completed
            showBooking = booking.status !== "Completed";

        } else {

            showBooking = booking.status === currentFilter;
        }


        // Skip bookings that do not match the selected filter
        if (!showBooking) {
            continue;
        }


        /* ----- Create Table Row ----- */

        const row = document.createElement("tr");


        /* ----- 1. Booking ID ----- */

        const bookingCell = document.createElement("td");

        bookingCell.textContent = booking.id || "N/A";

        row.appendChild(bookingCell);


        /* ----- 2. Vehicle ----- */

        const carCell = document.createElement("td");

        carCell.textContent =
            booking.carType || booking.carName || "Unknown car";

        row.appendChild(carCell);


        /* ----- 3. Collection Date ----- */

        const collectionCell = document.createElement("td");

        collectionCell.textContent =
            booking.collectionDate || "N/A";

        row.appendChild(collectionCell);


        /* ----- 4. Collected Checkbox ----- */

        const collectedCell = document.createElement("td");
        const collectedCheckbox = document.createElement("input");

        collectedCheckbox.type = "checkbox";
        collectedCheckbox.checked = booking.collected === true;

        collectedCheckbox.disabled =
            booking.returned === true ||
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;

        collectedCheckbox.setAttribute(
            "aria-label",
            "Mark vehicle as collected"
        );

        collectedCell.appendChild(collectedCheckbox);
        row.appendChild(collectedCell);


        /* ----- 5. Estimated Return Date ----- */

        const estimatedReturnCell = document.createElement("td");

        estimatedReturnCell.textContent =
            booking.returnDate || "N/A";

        row.appendChild(estimatedReturnCell);


        /* ----- 6. Actual Return Date ----- */

        const actualReturnCell = document.createElement("td");
        const actualReturnInput = document.createElement("input");

        actualReturnInput.type = "date";

        actualReturnInput.value = booking.actualReturnDate || "";

        actualReturnInput.max = getTodayDate();

        actualReturnInput.min = booking.collectionDate || "";

        actualReturnInput.disabled =
            booking.returned !== true;

        actualReturnInput.setAttribute(
            "aria-label",
            "Actual return date"
        );

        actualReturnCell.appendChild(actualReturnInput);
        row.appendChild(actualReturnCell);


        /* ----- 7. Returned Checkbox ----- */

        const returnedCell = document.createElement("td");
        const returnedCheckbox = document.createElement("input");

        returnedCheckbox.type = "checkbox";
        returnedCheckbox.checked = booking.returned === true;

        returnedCheckbox.disabled =
            booking.collected !== true ||
            booking.returned === true ||
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;

        returnedCheckbox.setAttribute(
            "aria-label",
            "Mark vehicle as returned"
        );

        returnedCell.appendChild(returnedCheckbox);
        row.appendChild(returnedCell);


        /* ----- 8. Inspection Remarks ----- */

        const remarksCell = document.createElement("td");
        const remarksInput = document.createElement("input");

        remarksInput.type = "text";
        remarksInput.placeholder = "NIL if no damage";
        remarksInput.value = booking.inspectionRemarks;

        remarksInput.disabled =
            booking.returned !== true ||
            booking.inspected === true ||
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;

        remarksInput.setAttribute(
            "aria-label",
            "Inspection remarks"
        );

        remarksCell.appendChild(remarksInput);
        row.appendChild(remarksCell);


        /* ----- 9. Damage Charges ----- */

        const chargesCell = document.createElement("td");
        const chargesInput = document.createElement("input");

        chargesInput.type = "text";
        chargesInput.inputMode = "decimal";
        chargesInput.placeholder = "0.00";

        chargesInput.value = Number(
            booking.damageCharges
        ).toFixed(2);

        chargesInput.disabled =
            booking.returned !== true ||
            booking.inspected === true ||
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;

        chargesInput.setAttribute(
            "aria-label",
            "Damage charges"
        );

        chargesCell.appendChild(chargesInput);
        row.appendChild(chargesCell);


        // Automatically fill today's date when Returned is checked
        // This listener is placed after all related inputs are created.
        returnedCheckbox.addEventListener("change", function () {

            if (returnedCheckbox.checked) {

                if (actualReturnInput.value === "") {
                    actualReturnInput.value = getTodayDate();
                }

                actualReturnInput.disabled = false;

                remarksInput.disabled = false;
                chargesInput.disabled = false;

            } else {

                actualReturnInput.value = "";
                actualReturnInput.disabled = true;

                remarksInput.disabled = true;
                chargesInput.disabled = true;
            }

            updateInspectedCheckbox();
        });


        /* ----- 10. Inspected Checkbox ----- */

        const inspectedCell = document.createElement("td");
        const inspectedCheckbox = document.createElement("input");

        inspectedCheckbox.type = "checkbox";
        inspectedCheckbox.checked = booking.inspected === true;

        inspectedCell.appendChild(inspectedCheckbox);
        row.appendChild(inspectedCell);


        // Enable or disable Inspected based on current inputs
        function updateInspectedCheckbox() {

            inspectedCheckbox.disabled =
                returnedCheckbox.checked !== true ||
                remarksInput.value.trim() === "" ||
                booking.inspected === true ||
                booking.paymentRequested === true ||
                booking.finalPaymentPaid === true;
        }

        updateInspectedCheckbox();

        remarksInput.addEventListener("input", function () {

            updateInspectedCheckbox();
        });


        inspectedCheckbox.setAttribute(
            "aria-label",
            "Mark inspection as completed"
        );


        /* ----- Validate Damage Charges While Typing ----- */

        chargesInput.addEventListener("input", function () {

            let value = chargesInput.value;

            // Remove characters other than digits and decimal points
            value = value.replace(/[^0-9.]/g, "");

            // Keep only the first decimal point
            const decimalPosition = value.indexOf(".");

            if (decimalPosition !== -1) {

                value =
                    value.substring(0, decimalPosition + 1) +
                    value.substring(decimalPosition + 1).replace(/\./g, "");

                const parts = value.split(".");

                // Allow up to two decimal places
                if (parts[1] !== undefined) {

                    parts[1] = parts[1].substring(0, 2);

                    value = parts[0] + "." + parts[1];
                }
            }

            chargesInput.value = value;
        });


        // Format valid amounts to two decimal places
        chargesInput.addEventListener("blur", function () {

            const value = chargesInput.value.trim();

            if (value === "") {

                chargesInput.value = "0.00";
                return;
            }

            if (/^\d+(\.\d{1,2})?$/.test(value)) {

                chargesInput.value = Number(value).toFixed(2);
            }
        });


        /* ----- 11. Vehicle Status ----- */

        const statusCell = document.createElement("td");

        statusCell.textContent = booking.carStatus;

        row.appendChild(statusCell);


        /* ----- 12. Save and Request Payment ----- */

        const actionsCell = document.createElement("td");


        // Save button
        const saveButton = document.createElement("button");

        saveButton.type = "button";
        saveButton.className = "save-btn";
        saveButton.textContent = "Save";


        // Request Payment button
        const requestPaymentButton = document.createElement("button");

        requestPaymentButton.type = "button";
        requestPaymentButton.className = "request-payment-btn";

        requestPaymentButton.textContent =
            booking.paymentRequested === true
                ? "Payment Requested"
                : "Request Payment";


        saveButton.disabled =
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;

        requestPaymentButton.disabled =
            booking.inspected !== true ||
            booking.paymentRequested === true ||
            booking.finalPaymentPaid === true;


        /* =========================================
           9. VALIDATE INSPECTION AND RETURN DETAILS
           ========================================= */

        function validateReturnAndInspection() {

            if (
                returnedCheckbox.checked &&
                !collectedCheckbox.checked
            ) {

                alert("Please mark the vehicle as collected first.");
                return false;
            }

            if (returnedCheckbox.checked) {

                const actualDate = actualReturnInput.value;
                const collectionDate = booking.collectionDate;

                if (actualDate === "") {

                    alert("Please enter the actual return date.");
                    return false;
                }

                if (actualDate < collectionDate) {

                    alert("The return date cannot be earlier than the collection date.");
                    return false;
                }

                if (actualDate > getTodayDate()) {

                    alert("The return date cannot be later than today.");
                    return false;
                }
            }

            if (
                inspectedCheckbox.checked &&
                !returnedCheckbox.checked
            ) {

                alert("Please mark the vehicle as returned first.");
                return false;
            }

            if (
                inspectedCheckbox.checked &&
                remarksInput.value.trim() === ""
            ) {

                alert("Please enter inspection remarks before completing the inspection.");
                return false;
            }

            return true;
        }


        /* =========================================
           10. VALIDATE DAMAGE CHARGES
           ========================================= */

        function validateDamageCharges() {

            const chargesText = chargesInput.value.trim();

            // Only allow valid amounts with up to two decimal places
            if (!/^\d+(\.\d{1,2})?$/.test(chargesText)) {

                alert("Please enter valid damage charges, such as 0.00 or 25.50.");
                return false;
            }

            const damageCharges = Number(chargesText);

            if (!Number.isFinite(damageCharges) || damageCharges < 0) {

                alert("Damage charges must be $0 or more.");
                return false;
            }

            // NIL means no damage, so charges must be zero
            if (
                remarksInput.value.trim().toUpperCase() === "NIL" &&
                damageCharges !== 0
            ) {

                alert("If inspection remarks are NIL, damage charges must be $0.00.");
                return false;
            }

            return true;
        }


        /* =========================================
           11. SAVE BUTTON FUNCTION
           ========================================= */

        saveButton.addEventListener("click", function () {

            const latestBookings = getEmployeeBookings();

            // Find the correct booking using its ID
            let currentBooking = null;

            for (let j = 0; j < latestBookings.length; j++) {

                if (latestBookings[j].id === booking.id) {

                    currentBooking = latestBookings[j];
                    break;
                }
            }

            if (currentBooking === null) {

                alert("Booking could not be found.");
                return;
            }

            if (
                currentBooking.paymentRequested === true ||
                currentBooking.finalPaymentPaid === true
            ) {

                alert("This booking has already been locked.");
                displayEmployeeBookings();
                return;
            }

            if (!validateReturnAndInspection()) {
                return;
            }

            if (
                returnedCheckbox.checked &&
                !validateDamageCharges()
            ) {
                return;
            }

            // Save collection and return information
            currentBooking.collected = collectedCheckbox.checked;
            currentBooking.returned = returnedCheckbox.checked;

            if (currentBooking.returned === true) {

                currentBooking.actualReturnDate =
                    actualReturnInput.value;

                currentBooking.inspectionRemarks =
                    remarksInput.value.trim();

                currentBooking.damageCharges =
                    Number(chargesInput.value);

                currentBooking.inspected =
                    inspectedCheckbox.checked;

                calculateFinalCost(currentBooking);
            }

            updateBookingStatus(currentBooking);

            // Save updated bookings to localStorage
            saveEmployeeBookings(latestBookings);

            if (employeeMessage !== null) {

                employeeMessage.textContent =
                    "Booking " + (currentBooking.id || "") +
                    " updated successfully.";
            }

            displayEmployeeBookings();
        });


        /* =========================================
           12. REQUEST PAYMENT FUNCTION
           ========================================= */

        requestPaymentButton.addEventListener("click", function () {

            const latestBookings = getEmployeeBookings();

            // Find the correct booking using its ID
            let currentBooking = null;

            for (let j = 0; j < latestBookings.length; j++) {

                if (latestBookings[j].id === booking.id) {

                    currentBooking = latestBookings[j];
                    break;
                }
            }

            if (currentBooking === null) {

                alert("Booking could not be found.");
                return;
            }

            if (
                currentBooking.paymentRequested === true ||
                currentBooking.finalPaymentPaid === true
            ) {
                return;
            }

            // Inspection must already be saved
            if (currentBooking.inspected !== true) {

                alert("Please save the completed inspection first.");
                return;
            }

            if (
                returnedCheckbox.checked !== true ||
                remarksInput.value.trim() === ""
            ) {

                alert("Please check the return date and inspection remarks.");
                return;
            }

            if (!validateReturnAndInspection()) {
                return;
            }

            if (!validateDamageCharges()) {
                return;
            }

            // Save the latest information
            currentBooking.actualReturnDate =
                actualReturnInput.value;

            currentBooking.inspectionRemarks =
                remarksInput.value.trim();

            currentBooking.damageCharges =
                Number(chargesInput.value);

            currentBooking.inspected = true;

            // Calculate actual rental cost and final payment
            calculateFinalCost(currentBooking);

            // Send payment request
            currentBooking.paymentRequested = true;

            updateBookingStatus(currentBooking);

            saveEmployeeBookings(latestBookings);

            if (employeeMessage !== null) {

                employeeMessage.textContent =
                    "Payment requested for booking " +
                    (currentBooking.id || "") +
                    ". This booking is now locked.";
            }

            displayEmployeeBookings();
        });


        // Add both buttons to the Actions column
        actionsCell.appendChild(saveButton);
        actionsCell.appendChild(document.createElement("br"));
        actionsCell.appendChild(requestPaymentButton);

        row.appendChild(actionsCell);


        /* ----- Add Row to Table ----- */

        bookingTable.appendChild(row);
    }


    /* =========================================
       13. HANDLE EMPTY BOOKING LIST
       ========================================= */

    let displayedBookings = 0;

    for (let i = 0; i < bookings.length; i++) {

        if (
            currentFilter === "All" ||
            (currentFilter === "Completed" &&
            bookings[i].status === "Completed") ||
            (currentFilter === "In Progress" &&
            bookings[i].status !== "Completed") ||
            bookings[i].status === currentFilter
        ) {

            displayedBookings++;
        }
    }

    if (displayedBookings === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 12;

        if (currentFilter === "All") {

            cell.textContent = "No customer bookings found.";

        } else if (currentFilter === "In Progress") {

            cell.textContent = "No in-progress bookings found.";

        } else {

            cell.textContent =
                "No " + currentFilter + " bookings found.";
        }

        row.appendChild(cell);
        bookingTable.appendChild(row);
    }


    /* =========================================
       14. UPDATE DASHBOARD STATISTICS
       ========================================= */

    if (totalBookings !== null) {
        totalBookings.textContent = reservedCount;
    }

    if (inUseCount !== null) {
        inUseCount.textContent = carsInUse;
    }

    if (returnedCount !== null) {
        returnedCount.textContent = pendingInspection;
    }

    if (inspectionCount !== null) {
        inspectionCount.textContent = pendingPayment;
    }

    // Save default fields and updated statuses
    saveEmployeeBookings(bookings);
}


/* =========================================
   15. INITIALISE EMPLOYEE DASHBOARD
   ========================================= */

if (bookingTable !== null && protectEmployeePage()) {

    // Automatically select In Progress when the page loads
    setBookingFilter(currentFilter);
}


/* =========================================
   16. HANDLE CHANGES FROM OTHER TABS
   ========================================= */

window.addEventListener("storage", function (event) {

    if (event.key === "azoomBookings") {

        if (protectEmployeePage()) {
            displayEmployeeBookings();
        }
    }

    if (event.key === "azoomUser") {
        protectEmployeePage();
    }
});


// Check login again when returning to this page
window.addEventListener("pageshow", function () {

    if (bookingTable !== null && protectEmployeePage()) {
        displayEmployeeBookings();
    }
});
