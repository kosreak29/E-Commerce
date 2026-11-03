document.getElementById('buyBtn').addEventListener('click', async () => {
    const phoneInput = document.getElementById('phoneInput').value;
    const statusBox = document.getElementById('statusMessage');
    const buyBtn = document.getElementById('buyBtn');

    if (!phoneInput) {
        alert("Please enter your WhatsApp number");
        return;
    }

    // UI Loading state
    buyBtn.disabled = true;
    buyBtn.innerText = "Processing...";
    statusBox.style.display = "block";
    statusBox.innerText = "Connecting to secure server...";
    statusBox.style.background = "#fff3cd";
    statusBox.style.color = "#856404";

    const orderData = {
        productId: "SONY-WH1000",
        customerPhone: phoneInput,
        productPrice: 2500
    };

    try {
        const response = await fetch('/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (response.ok) {
            statusBox.innerText = "✅ Order Placed! Check WhatsApp for Order ID.";
            statusBox.style.background = "#d4edda";
            statusBox.style.color = "#155724";
            buyBtn.innerText = "Order Successful";
        } else {
            statusBox.innerText = "❌ Error: " + result.error;
            statusBox.style.background = "#f8d7da";
            statusBox.style.color = "#721c24";
            buyBtn.disabled = false;
            buyBtn.innerText = "Try Again";
        }
    } catch (error) {
        statusBox.innerText = "❌ Network Error. Is Vercel backend running?";
        statusBox.style.background = "#f8d7da";
        statusBox.style.color = "#721c24";
        buyBtn.disabled = false;
        buyBtn.innerText = "Place Order Securely";
    }
});