const admin = require('firebase-admin');

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
        // Security Check: Vercel env variable se password match karein
        const providedPassword = req.headers['admin-password'];
        if (providedPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Unauthorized! Galat Password." });
        }

        try {
            // Firebase se sabhi orders fetch karein (Latest pehle)
            const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            res.status(200).json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}