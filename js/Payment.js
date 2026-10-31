/* =========================================
   0. PROTECT PAYMENT PAGE
   ========================================= */

function checkCustomerLogin() {
    const currentUser = JSON.parse(
        localStorage.getItem("azoomUser")
    );

    return currentUser !== null &&
           currentUser.role === "customer";
}

// Redirect if the user is not a logged-in customer
if (!checkCustomerLogin()) {
    window.location.replace("index.html");
}

// Check again when returning to the payment page
window.addEventListener("pageshow", function () {
    if (!checkCustomerLogin()) {
        window.location.replace("index.html");
    }
});

// Check for logout from another tab
window.addEventListener("storage", function (event) {
    if (event.key === "azoomUser") {
        if (!checkCustomerLogin()) {
            window.location.replace("index.html");
        }
    }
});
/* =========================================
   1. DISPLAY SELECTED CAR
   ========================================= */

const selectedCar = JSON.parse(
    sessionStorage.getItem("selectedCar")
);

const carName = document.getElementById("car-name");
const carType = document.getElementById("car-type");
const carPrice = document.getElementById("car-price");

if (selectedCar !== null) {
    carName.textContent = selectedCar.name;
    carType.textContent = selectedCar.type;
    carPrice.textContent =
        "$" + Number(selectedCar.price).toFixed(2) + " / day";
} else {
    carName.textContent = "No vehicle selected";
    carType.textContent = "Please return to Our Fleet and select a car.";
    carPrice.textContent = "$0.00 / day";
}


/* =========================================
   2. GET FORM ELEMENTS
   ========================================= */

const collectionDate = document.getElementById("collection-date");
const returnDate = document.getElementById("return-date");
const rentalDuration = document.getElementById("rental-duration");
const totalPrice = document.getElementById("total-price");

const paymentForm = document.getElementById("payment-form");
const payButton = paymentForm.querySelector(".pay-btn");

const cardNameInput = document.getElementById("card-name");
const cardNumberInput = document.getElementById("card-number");
const expiryInput = document.getElementById("expiry");
const cvvInput = document.getElementById("cvv");


/* =========================================
   3. SET MINIMUM ALLOWED DATES
   ========================================= */

// Get today's date in YYYY-MM-DD format
const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayString = year + "-" + month + "-" + day;

// Prevent selecting a past collection date
collectionDate.min = todayString;

// Prevent selecting a past return date
returnDate.min = todayString;


/* =========================================
   4. CALCULATE RENTAL COST
   ========================================= */

function calculateRentalCost() {

    // Check whether a car has been selected
    if (selectedCar === null) {
        rentalDuration.textContent = "Please select a car first";
        totalPrice.textContent = "$0.00";
        return;
    }

    // Check whether both dates have been selected
    if (collectionDate.value === "" || returnDate.value === "") {
        rentalDuration.textContent = "Please select your dates";
        totalPrice.textContent = "$0.00";
        return;
    }

    // Check whether the return date is valid
    if (returnDate.value <= collectionDate.value) {
        rentalDuration.textContent =
            "Return date must be after collection date";

        totalPrice.textContent = "$0.00";
        return;
    }

    // Convert dates into Date objects
    const startDate = new Date(collectionDate.value + "T00:00:00");
    const endDate = new Date(returnDate.value + "T00:00:00");

    // Calculate the number of rental days
    const difference = endDate - startDate;
    const days = difference / (1000 * 60 * 60 * 24);

    // Calculate the rental cost
    const pricePerDay = Number(selectedCar.price);
    const cost = days * pricePerDay;

    // Display the results
    rentalDuration.textContent =
        days + (days === 1 ? " day" : " days");

    totalPrice.textContent = "$" + cost.toFixed(2);
}


/* =========================================
   5. HANDLE DATE CHANGES
   ========================================= */

collectionDate.addEventListener("change", function () {

    // Return date cannot be earlier than collection date
    returnDate.min = collectionDate.value || todayString;

    // Clear the return date if it is invalid
    if (returnDate.value && returnDate.value <= collectionDate.value) {
        returnDate.value = "";
    }

    calculateRentalCost();
    checkPaymentForm();
});

returnDate.addEventListener("change", function () {
    calculateRentalCost();
    checkPaymentForm();
});


/* =========================================
   6. CARD NUMBER VALIDATION
   ========================================= */

const cardNumberError = document.getElementById("card-number-error");

cardNumberInput.addEventListener("input", function () {

    // Check whether letters or other characters were entered
    const hasInvalidCharacters = /[^0-9]/.test(cardNumberInput.value);

    // Remove letters and other non-digit characters
    let cardNumber = cardNumberInput.value.replace(/\D/g, "");

    // Limit the input to 19 digits
    cardNumber = cardNumber.substring(0, 19);   

    cardNumberInput.value = cardNumber;

    // Display error for invalid characters
    if (hasInvalidCharacters) {
        cardNumberError.textContent =
            "Invalid characters. Numbers only.";

        cardNumberInput.classList.add("input-invalid");
    }

    // Check the number of digits
    else if (cardNumber.length < 12 || cardNumber.length > 19) {
        cardNumberError.textContent =
            "Card number must contain 12–19 digits.";

        cardNumberInput.classList.add("input-invalid");
    }

    // Clear error when valid
    else {
        cardNumberError.textContent = "";
        cardNumberInput.classList.remove("input-invalid");
    }

    checkPaymentForm();
});


/* =========================================
   7. EXPIRY DATE VALIDATION
   ========================================= */

const expiryError = document.getElementById("expiry-error");

expiryInput.addEventListener("input", function () {

    // Keep digits only
    let expiry = expiryInput.value.replace(/\D/g, "");

    // Allow a maximum of 4 digits
    expiry = expiry.substring(0, 4);

    // Insert / after the month
    if (expiry.length > 2) {
        expiry = expiry.substring(0, 2) + "/" + expiry.substring(2);
    }

    expiryInput.value = expiry;

    validateExpiryDate();
    checkPaymentForm();
});

function validateExpiryDate() {

    const expiry = expiryInput.value;

    // Check whether the date follows MM/YY
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        expiryError.textContent =
            "Invalid date. Please use MM/YY.";

        expiryInput.classList.add("input-invalid");
        return false;
    }

    // Separate month and year
    const parts = expiry.split("/");

    const expiryMonth = Number(parts[0]);
    const expiryYear = 2000 + Number(parts[1]);

    // Check whether the month is between 01 and 12
    if (expiryMonth < 1 || expiryMonth > 12) {
        expiryError.textContent =
            "Invalid month. Please enter a month from 01 to 12.";

        expiryInput.classList.add("input-invalid");
        return false;
    }

    // Get current month and year
    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Check whether the card has expired
    if (
        expiryYear < currentYear ||
        (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
        expiryError.textContent =
            "This card has expired.";

        expiryInput.classList.add("input-invalid");
        return false;
    }

    // Clear error when valid
    expiryError.textContent = "";
    expiryInput.classList.remove("input-invalid");

    return true;
}


/* =========================================
   8. CVV: DIGITS ONLY
   ========================================= */

cvvInput.addEventListener("input", function () {

    // Remove anything that is not a digit
    cvvInput.value = cvvInput.value.replace(/\D/g, "");

    checkPaymentForm();
});


/* =========================================
   9. VALIDATE PAYMENT FORM
   ========================================= */

function checkPaymentForm() {

    // Check the rental dates
    const validDates =
        collectionDate.value !== "" &&
        returnDate.value !== "" &&
        returnDate.value > collectionDate.value;

    // Check that a pickup location has been selected
    const pickupLocation = document.querySelector(
        'input[name="pickup-location"]:checked'
    );

    const validPickup = pickupLocation !== null;

    // Check the cardholder's name
    const validName = cardNameInput.value.trim() !== "";

    // Card number must contain 12–19 digits
    const validCardNumber = /^\d{12,19}$/.test(
        cardNumberInput.value
    );

    // Check MM/YY format and valid month
    const expiry = expiryInput.value;
    const validExpiryFormat = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);

    // Check that the card has not expired
    let validExpiryDate = false;

    if (validExpiryFormat) {
        const parts = expiry.split("/");
        const expiryMonth = Number(parts[0]);
        const expiryYear = 2000 + Number(parts[1]);

        const expiryEndYear = expiryYear;
        const expiryEndMonth = expiryMonth;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        validExpiryDate =
            expiryEndYear > currentYear ||
            (expiryEndYear === currentYear &&
             expiryEndMonth >= currentMonth);
    }

    // Check that the CVV is not empty
    const validCVV = cvvInput.value.trim() !== "";

    // Enable the button only when all fields are valid
    payButton.disabled = !(
        selectedCar !== null &&
        validDates &&
        validPickup &&
        validName &&
        validCardNumber &&
        validExpiryDate &&
        validCVV
    );
}


/* =========================================
   10. RECHECK WHEN OTHER FIELDS CHANGE
   ========================================= */

// Recheck when the name or pickup location changes
paymentForm.addEventListener("input", checkPaymentForm);
paymentForm.addEventListener("change", checkPaymentForm);


/* =========================================
   11. INITIALISE THE PAGE
   ========================================= */

calculateRentalCost();
checkPaymentForm();


/* =========================================
   12. SAVE BOOKING AND REDIRECT
   ========================================= */

paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Make sure the form is valid
    if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
    }

    // Make sure a car has been selected
    if (selectedCar === null) {
        alert("Please select a car from Our Fleet first.");
        window.location.href = "Cars.html";
        return;
    }

    // Get the selected pickup location
    const pickupLocation = document.querySelector(
        'input[name="pickup-location"]:checked'
    );

    if (pickupLocation === null) {
        alert("Please select a pickup location.");
        return;
    }

    // Get the rental dates
    const collection = collectionDate.value;
    const returning = returnDate.value;

    if (returning <= collection) {
        alert("Return date must be after collection date.");
        return;
    }

    // Calculate the rental duration and cost
    const startDate = new Date(collection + "T00:00:00");
    const endDate = new Date(returning + "T00:00:00");

    const rentalDays =
        (endDate - startDate) / (1000 * 60 * 60 * 24);

    const totalCost = rentalDays * Number(selectedCar.price);

    // Get existing bookings
    const bookings =
        JSON.parse(localStorage.getItem("azoomBookings")) || [];

    // Create the new booking
    const newBooking = {
        id: "AZ-" + Date.now(),
        carName: selectedCar.name,
        carType: selectedCar.type,
        pricePerDay: Number(selectedCar.price),
        collectionDate: collection,
        returnDate: returning,
        pickupLocation: pickupLocation.value,
        rentalDays: rentalDays,
        totalCost: totalCost,
        finalCost: totalCost,
        status: "Reserved",
        paid: true
    };

    // Save the booking
    bookings.push(newBooking);

    localStorage.setItem(
        "azoomBookings",
        JSON.stringify(bookings)
    );

    // Go to My Bookings
    window.location.href = "Booking.html";
});
