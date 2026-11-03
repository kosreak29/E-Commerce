const admin = require('firebase-admin');
const twilio = require('twilio');

// 1. Firebase Initialization
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

// 2. Twilio Initialization
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Security check
        const providedPassword = req.headers['admin-password'];
        if (providedPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized!" });
        }

        const { orderId, newStatus } = req.body;

        try {
            // Step 3: Firebase se Order details nikalna (Customer number ke liye)
            const orderRef = db.collection('orders').doc(orderId);
            const orderDoc = await orderRef.get();

            if (!orderDoc.exists) {
                return res.status(404).json({ error: "Order database me nahi mila." });
            }

            const customerPhone = orderDoc.data().customerPhone;

            // Step 4: Firebase me naya status update karna
            await orderRef.update({ status: newStatus });

            // Step 5: Agar status 'Shipped' hai, toh Twilio se message bhejna
            if (newStatus === "Shipped" && customerPhone) {
                await twilioClient.messages.create({
                    body: `📦 Good News! Aapka order (ID: ${orderId}) dispatch/shipped ho gaya hai. Aap website par jakar ise track kar sakte hain.`,
                    from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                    to: `whatsapp:${customerPhone}`
                });
            }

            res.status(200).json({ success: true, message: "Status updated & WhatsApp message sent!" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "System Error: " + error.message });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}