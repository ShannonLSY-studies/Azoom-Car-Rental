
// Get the filter controls
const searchInput = document.getElementById("car-search");
const brandSelect = document.getElementById("car-brand");
const typeSelect = document.getElementById("car-type");
const priceSlider = document.getElementById("max-price");
const priceValue = document.getElementById("price-value");

// Get all car cards
const carCards = document.querySelectorAll(".car-card");

// Filter the cars
function filterCars() {

    // Get the customer's selected values
    const searchText = searchInput.value.toLowerCase();
    const selectedBrand = brandSelect.value;
    const selectedType = typeSelect.value;    
    const maxPrice = Number(priceSlider.value);

    // Check every car card
    carCards.forEach(function(car) {

        const carName = car.dataset.name.toLowerCase();
        const carBrand = car.dataset.brand;
        const carType = car.dataset.type;
        const carPrice = Number(car.dataset.price);

        const matchesSearch =
            carName.includes(searchText) ||
            carBrand.toLowerCase().includes(searchText);

        const matchesBrand =
            selectedBrand === "All" || carBrand === selectedBrand;

        const matchesType =
            selectedType === "All" || carType === selectedType;

        const matchesPrice = carPrice <= maxPrice;

        // Show the car only if all filters match
        if (matchesSearch && matchesBrand && matchesType && matchesPrice) {
            car.style.display = "flex";
        } else {
            car.style.display = "none";
        }
    });
}

// Update the price label and filter the cars
priceSlider.addEventListener("input", function() {
    priceValue.textContent = priceSlider.value;
    filterCars();
});

// Filter when the customer types or changes the car type
searchInput.addEventListener("input", filterCars);
brandSelect.addEventListener("change", filterCars);
typeSelect.addEventListener("change", filterCars);
