# Undangan Amelia & Zeus

Situs statis untuk GitHub Pages. Foto dan musik berada di `assets/`.

Formulir RSVP dan ucapan bersama menggunakan Cloud Firestore. Ikuti [panduan Firebase](setup/FIRESTORE.md) untuk mengisi `firebase-config.js`, mengaktifkan Anonymous Authentication, dan menerbitkan Firestore Security Rules **sebelum** perubahan formulir ini dipublikasikan. Tanpa konfigurasi tersebut, tombol kirim dinonaktifkan agar tamu tidak mendapat konfirmasi penyimpanan yang keliru.

Ucapan terbaru tampil langsung di undangan. RSVP hanya dapat dilihat pemilik project di Firebase Console.
