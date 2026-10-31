
/* =========================================
   1. GET HTML ELEMENTS
   ========================================= */

const bookingLists = document.getElementById("booking-lists");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "All";


/* =========================================
   2. GET AND SAVE BOOKINGS
   ========================================= */

// Get all saved bookings
function getBookings() {
    return JSON.parse(localStorage.getItem("azoomBookings")) || [];
}


// Save updated bookings
function saveBookings(bookings) {
    localStorage.setItem("azoomBookings", JSON.stringify(bookings));
}


/* =========================================
   3. UPDATE A BOOKING
   ========================================= */

// Find a booking by ID and update its information
function updateBooking(bookingId, newStatus, isPaid) {
    const bookings = getBookings();

    for (let i = 0; i < bookings.length; i++) {
        if (bookings[i].id === bookingId) {
            bookings[i].status = newStatus;

            if (isPaid === true) {
                bookings[i].finalPaymentPaid = true;
                bookings[i].paymentRequested = false;
                bookings[i].carStatus = "Available";
            }

            break;
        }
    }

    saveBookings(bookings);
}


/* =========================================
   4. DISPLAY BOOKING CARDS
   ========================================= */

function displayBookings() {
    // Stop if this page does not contain the booking list
    if (bookingLists === null) {
        return;
    }

    const bookings = getBookings();

    bookingLists.innerHTML = "";

    let displayedCount = 0;

    for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];

        // Apply the selected status filter
        if (currentFilter !== "All" &&
            booking.status !== currentFilter) {
            continue;
        }

        displayedCount++;


        /* ----- Booking details ----- */

        const card = document.createElement("div");
        card.className = "booking-card";

        const details = document.createElement("div");
        details.className = "booking-details";

        const bookingId = document.createElement("p");
        bookingId.className = "booking-id";
        bookingId.textContent = "Booking ID: " + booking.id;

        const carName = document.createElement("h2");
        carName.textContent = booking.carName;

        const carType = document.createElement("p");
        carType.className = "booking-type";
        carType.textContent = booking.carType;


        /* ----- Collection and return information ----- */

        const info = document.createElement("div");
        info.className = "booking-info";


        // Collection date
        const collectionInfo = document.createElement("div");

        const collectionLabel = document.createElement("p");
        collectionLabel.textContent = "Collection Date";

        const collectionValue = document.createElement("strong");
        collectionValue.textContent = booking.collectionDate;

        collectionInfo.append(collectionLabel, collectionValue);


        // Return date
        const returnInfo = document.createElement("div");

        const returnLabel = document.createElement("p");
        returnLabel.textContent = "Return Date";

        const returnValue = document.createElement("strong");
        returnValue.textContent = booking.returnDate;

        returnInfo.append(returnLabel, returnValue);


        // Pick-up location
        const locationInfo = document.createElement("div");

        const locationLabel = document.createElement("p");
        locationLabel.textContent = "Pick-up Location";

        const locationValue = document.createElement("strong");
        locationValue.textContent = booking.pickupLocation;

        locationInfo.append(locationLabel, locationValue);


        info.append(
            collectionInfo,
            returnInfo,
            locationInfo
        );


        /* ----- Rental cost ----- */

        const cost = document.createElement("div");
        cost.className = "booking-cost";

        cost.textContent = "$" +
            Number(booking.totalCost).toFixed(2);

        const costNote = document.createElement("small");
        costNote.textContent = " estimated rental cost";

        cost.appendChild(costNote);


        details.append(
            bookingId,
            carName,
            carType,
            info,
            cost
        );


        /* ----- Status and action buttons ----- */

        const side = document.createElement("div");
        side.className = "booking-side";

        const status = document.createElement("span");
        status.className = "booking-status";
        status.textContent = booking.status;

        const actions = document.createElement("div");
        actions.className = "booking-actions";


        // View Details button
        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.className = "booking-btn";
        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", function() {
            alert(
                "Booking ID: " + booking.id +
                "\nVehicle: " + booking.carName +
                "\nStatus: " + booking.status +
                "\nCollection: " + booking.collectionDate +
                "\nReturn: " + booking.returnDate +
                "\nPick-up: " + booking.pickupLocation +
                "\nRental Cost: $" +
                Number(booking.totalCost).toFixed(2)
            );
        });

        actions.appendChild(detailsButton);


        /* =========================================
           5. BUTTONS FOR EACH BOOKING STATUS
           ========================================= */


        // RESERVED: Allow the customer to cancel
        if (booking.status === "Reserved" &&
            booking.collected !== true) {
            
            const cancelButton = document.createElement("button");

            cancelButton.type = "button";
            cancelButton.className = "booking-btn";
            cancelButton.textContent = "Cancel Booking";

            cancelButton.addEventListener("click", function() {
                const confirmed = confirm(
                    "Are you sure you want to cancel this booking?"
                );

                if (confirmed) {
                    const updatedBookings = getBookings();
                    const remainingBookings = [];

                    for (let j = 0; j < updatedBookings.length; j++) {
                        if (updatedBookings[j].id !== booking.id) {
                            remainingBookings.push(updatedBookings[j]);
                        }
                    }

                    saveBookings(remainingBookings);
                    displayBookings();
                }
            });

            actions.appendChild(cancelButton);
        }


        // ACTIVE: Show return instructions
        if (booking.status === "Active") {
            const returnButton = document.createElement("button");

            returnButton.type = "button";
            returnButton.className = "booking-btn primary";
            returnButton.textContent = "Return Information";

            returnButton.addEventListener("click", function() {
                alert(
                    "Please return your vehicle to the designated " +
                    "AZoom car park. An employee will inspect the car " +
                    "and prepare your final bill."
                );
            });

            actions.appendChild(returnButton);
        }


        // PENDING PAYMENT: Record payment
        if (booking.status === "Pending Payment" &&
            booking.paymentRequested === true) {
            const payButton = document.createElement("button");

            payButton.type = "button";
            payButton.className = "booking-btn primary";
            payButton.textContent = "Pay Now";

            payButton.addEventListener("click", function() {
                const amount = Number(
                    booking.finalCost ?? booking.totalCost
                ).toFixed(2);

                const confirmed = confirm(
                    "Confirm payment of $" + amount +
                    " for this booking?"
                );

                if (confirmed) {
                    updateBooking(booking.id, "Completed", true);

                    alert("Payment recorded successfully.");

                    displayBookings();
                }
            });

            actions.appendChild(payButton);
        }


        // COMPLETED: Show receipt and allow another booking
        if (booking.status === "Completed") {
            const receiptButton = document.createElement("button");

            receiptButton.type = "button";
            receiptButton.className = "booking-btn primary";
            receiptButton.textContent = "View Receipt";

            receiptButton.addEventListener("click", function() {
                alert(
                    "Payment Receipt" +
                    "\nBooking ID: " + booking.id +
                    "\nVehicle: " + booking.carName +
                    "\nAmount Paid: $" +
                    Number(
                        booking.finalCost ?? booking.totalCost
                    ).toFixed(2)
                );
            });

            actions.appendChild(receiptButton);


            // Book Again button
            const againButton = document.createElement("button");

            againButton.type = "button";
            againButton.className = "booking-btn";
            againButton.textContent = "Book Again";

            againButton.addEventListener("click", function() {
                window.location.href = "Cars.html";
            });

            actions.appendChild(againButton);
        }


        /* ----- Add the completed card to the page ----- */

        side.append(status, actions);

        card.append(details, side);

        bookingLists.appendChild(card);
    }


    /* =========================================
       6. SHOW A MESSAGE WHEN THERE ARE NO RESULTS
       ========================================= */

    if (displayedCount === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-bookings";

        const heading = document.createElement("h2");

        heading.textContent = bookings.length === 0
            ? "No bookings yet"
            : "No bookings found";

        const message = document.createElement("p");

        message.textContent = bookings.length === 0
            ? "Your reservations will appear here after you book a vehicle."
            : "There are no bookings with this status.";

        const link = document.createElement("a");

        link.href = "Cars.html";
        link.textContent = "Explore Our Fleet";

        empty.append(heading, message, link);

        bookingLists.appendChild(empty);
    }
}


/* =========================================
   7. FILTER BOOKINGS
   ========================================= */

function setupBookingFilters() {
    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            currentFilter = button.dataset.status;

            // Remove the active style from every filter button
            filterButtons.forEach(function(otherButton) {
                otherButton.classList.remove("active");
            });

            // Highlight the selected filter
            button.classList.add("active");

            // Display bookings matching the selected filter
            displayBookings();
        });
    });
}



/* =========================================
   8. PROTECT MY BOOKINGS
   ========================================= */

// Check whether a customer is logged in
function checkCustomerLogin() {
    const currentUser = JSON.parse(
        localStorage.getItem("azoomUser")
    );

    return currentUser !== null &&
           currentUser.role === "customer";
}


// Redirect if the user is not a logged-in customer
function protectBookingsPage() {
    if (!checkCustomerLogin()) {
        window.location.replace("Home.html");
    }
}


// Check immediately when Booking.html loads
if (!checkCustomerLogin()) {
    window.location.replace("Home.html");
} else {
    setupBookingFilters();
    displayBookings();
}


// Detect logout or account changes from another page or tab
window.addEventListener("storage", function(event) {
    if (event.key === "azoomUser") {
        protectBookingsPage();
    }
});


// Check again when returning to Booking.html
window.addEventListener("pageshow", function() {
    protectBookingsPage();
});
