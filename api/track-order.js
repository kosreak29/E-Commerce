const admin = require('firebase-admin');

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

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ error: "Order ID jaruri hai." });
        }

        try {
            // Firebase me specific Order ID se document fetch karna
            const orderRef = db.collection('orders').doc(orderId);
            const doc = await orderRef.get();

            if (!doc.exists) {
                return res.status(404).json({ error: "Is ID se koi order nahi mila." });
            }

            // Document milne par uska data frontend ko bhejna
            res.status(200).json({ 
                success: true, 
                orderData: doc.data() 
            });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}