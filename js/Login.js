
/* =========================================
   1. GET HTML ELEMENTS
   ========================================= */

const loginButtonText = document.getElementById("login-btn-text");
const loginButton = document.querySelector(".login-btn");

const loginModal = document.getElementById("login-modal");
const closeButton = document.getElementById("close-login");

const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");

const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");


/* =========================================
   2. GET AND CHECK LOGIN INFORMATION
   ========================================= */

// Get the currently logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("azoomUser"));
}


// Check whether the current user is a customer
function isCustomerLoggedIn() {
    const currentUser = getCurrentUser();

    return currentUser !== null &&
           currentUser.role === "customer";
}


// Check whether the current user is an employee
function isEmployeeLoggedIn() {
    const currentUser = getCurrentUser();

    return currentUser !== null &&
           currentUser.role === "employee";
}



/* =========================================
   3. UPDATE LOGIN BUTTON AND NAVIGATION
   ========================================= */

function updateLoginButton() {
    const currentUser = getCurrentUser();
    const profileImage = document.querySelector(".login-btn .profile");

    // Update the Login / Logout button
    if (loginButtonText !== null) {
        if (currentUser !== null) {
            loginButtonText.textContent = "Logout";

            if (profileImage !== null) {
                profileImage.style.display = "none";
            }
        } else {
            loginButtonText.textContent = "Login / Signup";

            if (profileImage !== null) {
                profileImage.style.display = "inline";
            }
        }
    }

    // Update the bookings navigation based on user role
    const bookingsLink = document.getElementById("bookings-link");

    if (bookingsLink !== null) {
        if (currentUser !== null &&
            currentUser.role.toLowerCase() === "employee") {

            bookingsLink.textContent = "Customer Bookings";
            bookingsLink.href = "Employee.html";

        } else {
            bookingsLink.textContent = "My Bookings";
            bookingsLink.href = "Booking.html";
        }
    }
}

// Update the button and navigation when the page loads
updateLoginButton();


/* =========================================
   3A. HANDLE LOGIN BUTTON CLICK
   ========================================= */

if (loginButton !== null) {
    loginButton.addEventListener("click", function (event) {
        event.preventDefault();

        const currentUser = getCurrentUser();

        if (currentUser !== null) {
            // User is logged in: log out
            localStorage.removeItem("azoomUser");

            updateLoginButton();

            // Return to the home page
            window.location.href = "Home.html";

        } else {
            // User is not logged in: open the login popup
            openLoginPopup();
        }
    });
}


/* =========================================
   4. OPEN AND CLOSE THE LOGIN POPUP
   ========================================= */

// Open the popup and show the Login section
function openLoginPopup() {
    if (loginModal === null) {
        alert("Please log in using the Login / Signup button on Home or Our Fleet.");
        return;
    }

    loginModal.style.display = "flex";

    if (loginSection !== null) {
        loginSection.style.display = "block";
    }

    if (signupSection !== null) {
        signupSection.style.display = "none";
    }
}


// Close the popup
function closeLoginPopup() {
    if (loginModal !== null) {
        loginModal.style.display = "none";
    }
}


// Close when the X button is clicked
if (closeButton !== null) {
    closeButton.addEventListener("click", closeLoginPopup);
}


// Close when clicking outside the popup
if (loginModal !== null) {
    loginModal.addEventListener("click", function(event) {
        if (event.target === loginModal) {
            closeLoginPopup();
        }
    });
}


/* =========================================
   5. SWITCH BETWEEN LOGIN AND SIGNUP
   ========================================= */

// Switch to Sign Up
if (showSignup !== null) {
    showSignup.addEventListener("click", function(event) {
        event.preventDefault();

        if (loginSection !== null) {
            loginSection.style.display = "none";
        }

        if (signupSection !== null) {
            signupSection.style.display = "block";
        }
    });
}


// Switch back to Login
if (showLogin !== null) {
    showLogin.addEventListener("click", function(event) {
        event.preventDefault();

        if (signupSection !== null) {
            signupSection.style.display = "none";
        }

        if (loginSection !== null) {
            loginSection.style.display = "block";
        }
    });
}


/* =========================================
   6. SIGN UP
   ========================================= */

if (signupForm !== null) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const signupRole = document.getElementById("signup-role");

        if (signupRole === null) {
            alert("Unable to determine the account role.");
            return;
        }

        const role = signupRole.value;

        // Get existing accounts
        const accounts = JSON.parse(
            localStorage.getItem("azoomAccounts")
        ) || [];


        // Check whether the email is already registered
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].email.toLowerCase() === email.toLowerCase()) {
                alert("This email is already registered.");
                return;
            }
        }


        // Save the new account
        accounts.push({
            name: name,
            email: email,
            password: password,
            role: role
        });

        localStorage.setItem("azoomAccounts", JSON.stringify(accounts));

        alert("Account created! You can now log in.");


        // Return to the Login section
        if (signupSection !== null) {
            signupSection.style.display = "none";
        }

        if (loginSection !== null) {
            loginSection.style.display = "block";
        }

        document.getElementById("login-email").value = email;
    });
}


/* =========================================
   7. LOG IN
   ========================================= */

if (loginForm !== null) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        // Get registered accounts
        const accounts = JSON.parse(
            localStorage.getItem("azoomAccounts")
        ) || [];

        let foundAccount = null;


        // Find an account with matching email and password
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].email.toLowerCase() === email.toLowerCase() &&
                accounts[i].password === password) {

                foundAccount = accounts[i];
                break;
            }
        }


        // If no matching account was found
        if (foundAccount === null) {
            alert("Incorrect email or password, or account not registered.");
            return;
        }


        // Save the logged-in user's information
        localStorage.setItem("azoomUser", JSON.stringify({
            name: foundAccount.name,
            email: foundAccount.email,
            role: foundAccount.role
        }));

        updateLoginButton();

        closeLoginPopup();

        alert("Login successful!");
        
        // Redirect employees only
        if (String(foundAccount.role).toLowerCase() === "employee") {
            window.location.href = "Employee.html";
        }

    });
}


/* =========================================
   8. LOGIN / LOGOUT BUTTON
   ========================================= */

if (loginButton !== null) {
    loginButton.addEventListener("click", function(event) {
        event.preventDefault();

        const currentUser = getCurrentUser();

        if (currentUser !== null) {
            // Log out the current user
            localStorage.removeItem("azoomUser");
            updateLoginButton();

            alert("You have logged out successfully.");

           // Immediately leave protected pages after logout
            const currentPage = window.location.pathname.toLowerCase();
            if (
                currentPage.endsWith("booking.html") ||
                currentPage.endsWith("payment.html")
            ) {
                window.location.replace("Home.html");
            }
        } else {
            openLoginPopup();
        }
    });
}


/* =========================================
   9. RENT NOW BUTTONS
   ========================================= */

const rentButtons = document.querySelectorAll(".rent-btn");

rentButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
        event.preventDefault();

        const currentUser = getCurrentUser();


        // Require the user to log in first
        if (currentUser === null) {
            openLoginPopup();
            return;
        }


        // Only customers can rent cars
        if (currentUser.role !== "customer") {
            alert("Only customers can rent cars.");
            return;
        }


        // Find the car card belonging to this button
        const carCard = button.closest(".car-card");

        if (carCard === null) {
            alert("Unable to find the selected car.");
            return;
        }


        // Get the selected car's information
        const carName = carCard.dataset.name;
        const carType = carCard.dataset.type;
        const carPrice = carCard.dataset.price;


        // Save the selected car for the payment page
        sessionStorage.setItem("selectedCar", JSON.stringify({
            name: carName,
            type: carType,
            price: carPrice
        }));


        // Go to the payment page
        window.location.href = "payment.html";
    });
});


/* =========================================
   10. PROTECT BOOKINGS NAVIGATION
   ========================================= */

const bookingsLink = document.getElementById("bookings-link");

if (bookingsLink !== null) {
    bookingsLink.addEventListener("click", function(event) {
        const currentUser = getCurrentUser();

        // Allow employees to access their dashboard
        if (currentUser !== null &&
            currentUser.role.toLowerCase() === "employee") {
            return;
        }

        // Customers must be logged in to view My Bookings
        if (!isCustomerLoggedIn()) {
            event.preventDefault();

            alert("Please log in as a customer to view your bookings.");
            window.location.href = "Home.html";
        }
    });
}


/* =========================================
   11. PROTECT THE PAYMENT PAGE
   ========================================= */

if (window.location.pathname.toLowerCase().endsWith("/payment.html") ||
    window.location.pathname.toLowerCase().endsWith("payment.html")) {

    if (!isCustomerLoggedIn()) {
        alert("Please log in as a customer to access the payment page.");
        window.location.href = "Cars.html";
    }
}
