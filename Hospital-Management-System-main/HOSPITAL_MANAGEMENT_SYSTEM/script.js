

(function () {

    //  STORAGE KEYS
    var APPT_KEY = "appointments";
    var CART_KEY = "pharmacy_cart";

    //  STORAGE FUNCTIONS 
    function loadAppointments() {
        var data = localStorage.getItem(APPT_KEY);
        if (data) return JSON.parse(data);
        return [];
    }

    function saveAppointments(list) {
        localStorage.setItem(APPT_KEY, JSON.stringify(list));
    }

    function loadCart() {
        var data = localStorage.getItem(CART_KEY);
        if (data) return JSON.parse(data);
        return [];
    }

    function saveCart(list) {
        localStorage.setItem(CART_KEY, JSON.stringify(list));
    }

    //  SIMPLE RANDOM ID 
    function makeId() {
        return "id" + Math.random();
    }

    // BOOKING FORM 
    function bookingSubmit(event) {
        event.preventDefault();

        var doctor = document.getElementById("doctor").value;
        var date = document.getElementById("date").value;
        var time = document.getElementById("time").value;
        var name = document.getElementById("patient-name").value;

        if (name.trim() === "") {
            alert("Please enter your name.");
            return;
        }
        if (!date || !time) {
            alert("Please choose date and time.");
            return;
        }

        var newAppt = {
            id: makeId(),
            doctor: doctor,
            date: date,
            time: time,
            patientName: name,
            paid: false
        };

        var list = loadAppointments();
        list.push(newAppt);
        saveAppointments(list);

        // redirect to payment
        window.location.href = "payment.html?id=" + encodeURIComponent(newAppt.id);
    }

    //  APPOINTMENT DASHBOARD 
    function showDashboard() {
        var area = document.getElementById("appointment-list");
        var reminder = document.getElementById("reminder-message");
        if (!area) return;

        var list = loadAppointments();
        area.innerHTML = "";

        if (list.length === 0) {
            area.innerHTML = "<p>No upcoming appointments.</p>";
            return;
        }

        var now = new Date();

        list.forEach(function (a, index) {
            var apptTime = new Date(a.date + "T" + a.time);
            var hoursLeft = (apptTime - now) / (1000 * 60 * 60);

            var paidText = "Unpaid";
            if (a.paid) paidText = "Paid";

            var payBtn = "";
            if (!a.paid) payBtn = "<button class='pay-btn' data-id='" + a.id + "'>Pay</button>";

            area.innerHTML +=
                "<li><b>" + a.patientName +
                "</b> – " + a.doctor +
                " – " + a.date + " at " + a.time +
                " (" + paidText + ")" +
                " <button class='cancel-btn' data-index='" + index + "'>Cancel</button> " +
                payBtn + "</li>";

            if (reminder && hoursLeft > 0 && hoursLeft <= 24) {
                reminder.innerHTML =
                    "<b>Reminder:</b> You have an appointment with " +
                    a.doctor + " on " + a.date + " at " + a.time +
                    "<br><b>Please arrive 15 mins early.</b>";
            }
        });

        // Cancel & Pay buttons
        area.addEventListener("click", function (e) {
            if (e.target.classList.contains("cancel-btn")) {
                var i = Number(e.target.getAttribute("data-index"));
                var list = loadAppointments();
                list.splice(i, 1);
                saveAppointments(list);
                showDashboard();
            }

            if (e.target.classList.contains("pay-btn")) {
                var id = e.target.getAttribute("data-id");
                window.location.href = "payment.html?id=" + encodeURIComponent(id);
            }
        });
    }

    // PAYMENT PAGE 
    function setupPaymentPage() {
        var summary = document.getElementById("payment-summary");
        var form = document.getElementById("payment-form");
        if (!summary || !form) return;

        var url = new URLSearchParams(window.location.search);
        var id = url.get("id");
        var type = url.get("type");
        if (!type) type = "appointment";

        if (type === "pharmacy") {
            var cart = loadCart();
            if (cart.length === 0) {
                summary.innerHTML = "Cart is empty.";
                form.style.display = "none";
                return;
            }
            var total = 0;
            cart.forEach(function (item) { total += item.price * item.qty; });
            summary.innerHTML = "Pharmacy total: ₹" + total.toFixed(2);
        } else {
            var list = loadAppointments();
            var appt = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) { appt = list[i]; break; }
            }

            if (!appt) {
                summary.innerHTML = "Appointment not found.";
                form.style.display = "none";
                return;
            }

            summary.innerHTML =
                "Pay for: <b>" + appt.patientName +
                "</b> – " + appt.doctor +
                " – " + appt.date + " at " + appt.time;
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            setTimeout(function () {
                if (type === "pharmacy") {
                    saveCart([]);
                    alert("Payment successful!");
                    window.location.href = "pharmacy.html";
                    return;
                }

                var list = loadAppointments();
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === id) {
                        list[i].paid = true;
                        break;
                    }
                }
                saveAppointments(list);

                alert("Payment successful!");
                window.location.href = "pd.html";
            }, 400);
        });
    }

// PHARMACY PAGE 
function setupPharmacy() {
    var productsArea = document.getElementById("pharmacy-products");
    var cartArea = document.getElementById("cart-items");
    var totalArea = document.getElementById("cart-total");
    var checkout = document.getElementById("checkout-btn");
    if (!productsArea) return;

    var products = [
        {id:"paracetamol",name:"Paracetamol 500mg",price:25},
        {id:"cough",name:"Cough Syrup",price:120},
        {id:"vitc",name:"Vitamin C Tablets",price:90},
        {id:"bandage",name:"Bandage Roll",price:45},
        {id:"ibuprofen",name:"Ibuprofen 400mg",price:35},
        {id:"amoxicillin",name:"Amoxicillin 500mg",price:150},
        {id:"omeprazole",name:"Omeprazole 20mg",price:80},
        {id:"metformin",name:"Metformin 500mg",price:60},
        {id:"aspirin",name:"Aspirin 75mg",price:30},
        {id:"vitd",name:"Vitamin D3 1000IU",price:120},
        {id:"multivitamin",name:"Multivitamin Tablets",price:200},
        {id:"calcium",name:"Calcium Carbonate",price:75},
        {id:"iron",name:"Iron Supplements",price:95},
        {id:"probiotics",name:"Probiotic Capsules",price:180},
        {id:"omega3",name:"Omega-3 Fish Oil",price:250},
        {id:"glucosamine",name:"Glucosamine 500mg",price:160},
        {id:"melatonin",name:"Melatonin 3mg",price:110},
        {id:"magnesium",name:"Magnesium Glycinate",price:140},
        {id:"zinc",name:"Zinc Supplements",price:85},
        {id:"bcomplex",name:"B-Complex Vitamins",price:170}
    ];

    function showProducts() {
        productsArea.innerHTML = "";
        products.forEach(function(p){
            var box = document.createElement("div");
            box.className = "product-box";
            box.style.cssText = `
                width:180px; padding:12px; margin:8px;
                border:1px solid #ddd; border-radius:10px;
                text-align:center; background:#f9f9f9;
                box-shadow:0 3px 8px rgba(0,0,0,0.1);
            `;
            box.innerHTML = `
                <h4 style="font-size:16px; margin-bottom:8px;">${p.name}</h4>
                <div style="font-weight:bold; margin-bottom:10px;">₹${p.price.toFixed(2)}</div>
                <button class="add" data-id="${p.id}" 
                    style="padding:6px 12px; background:#007bff; color:#fff; border:none; border-radius:6px; cursor:pointer;">
                    Add to Cart
                </button>
            `;
            productsArea.appendChild(box);
        });
    }

    function showCart() {
        var cart = loadCart();
        cartArea.innerHTML = "";
        var total = 0;
        cart.forEach(function(item,i){
            total += item.price*item.qty;
            var li = document.createElement("li");
            li.innerHTML = `
                ${item.name} x ${item.qty} – ₹${(item.price*item.qty).toFixed(2)}
                <button class="remove" data-i="${i}">Remove</button>
            `;
            cartArea.appendChild(li);
        });
        totalArea.textContent = total.toFixed(2);
    }

    productsArea.addEventListener("click", function(e){
        if (!e.target.classList.contains("add")) return;
        var id = e.target.getAttribute("data-id");
        var p = products.find(x=>x.id===id);
        if(!p) return;

        var cart = loadCart();
        var exists = cart.find(c=>c.id===id);
        if(exists) exists.qty+=1;
        else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
        saveCart(cart);
        showCart();
    });

    cartArea.addEventListener("click", function(e){
        if(!e.target.classList.contains("remove")) return;
        var i = Number(e.target.getAttribute("data-i"));
        var cart = loadCart();
        cart.splice(i,1);
        saveCart(cart);
        showCart();
    });

    checkout.addEventListener("click", function(){
        var cart = loadCart();
        if(cart.length===0) return alert("Cart is empty.");
        window.location.href = "payment.html?type=pharmacy";
    });

    showProducts();
    showCart();
}


    // PAGE INIT
    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("appointment-form");
        if (form) form.addEventListener("submit", bookingSubmit);

        if (document.getElementById("appointment-list")) showDashboard();
        setupPaymentPage();
        setupPharmacy();
    });

})();
