import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// 1. Fungsi Tampilkan Daftar History di Sidebar
function loadChatHistory() {
    const user = auth.currentUser;
    const q = query(collection(db, "users", user.uid, "chats"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        const sidebarList = document.getElementById('history-list');
        sidebarList.innerHTML = ""; // Reset list
        
        snapshot.forEach((doc) => {
            const chat = doc.data();
            const item = document.createElement('div');
            item.className = "p-2 hover:bg-[#2f2f2f] rounded-lg cursor-pointer truncate text-sm";
            item.innerText = chat.title || "Chat Tanpa Judul";
            item.onclick = () => openChat(doc.id); // Klik buat buka chat lama
            sidebarList.appendChild(item);
        });
    });
}

// 2. Fungsi Buka Chat Lama
async function openChat(chatId) {
    currentChatId = chatId;
    // Ambil semua pesan dari sub-collection 'messages' dan tampilkan ke layar
}
