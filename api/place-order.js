const admin = require('firebase-admin');
const twilio = require('twilio');

// Firebase Initialization
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}
const db = admin.firestore();

// Twilio Initialization
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { productId, customerPhone, productPrice } = req.body;
        const discount = 0.20; 
        const finalPrice = productPrice - (productPrice * discount);

        try {
            // 1. Firebase me Order Save karna
            const orderRef = await db.collection('orders').add({
                productId: productId,
                customerPhone: customerPhone,
                finalPrice: finalPrice,
                status: "Pending",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. WhatsApp Message Bhejna
            // Dhyan rakhein: Twilio me number ke aage 'whatsapp:' lagana zaroori hai
            const message = await twilioClient.messages.create({
                body: `Hello! Aapka order (ID: ${orderRef.id}) successfully place ho gaya hai. Final Amount: ₹${finalPrice}. Order pack hote hi hum aapko update karenge.`,
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, // Sandbox number
                to: `whatsapp:${customerPhone}` // Customer ka number (jaise +919876543210)
            });

            res.status(200).json({ 
                success: true, 
                orderId: orderRef.id,
                message: "Database updated & WhatsApp sent!" 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "System error: " + error.message });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}