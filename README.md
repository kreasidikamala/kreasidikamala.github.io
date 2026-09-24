# Undangan Amelia & Zeus

Situs statis untuk GitHub Pages. Foto dan musik berada di `assets/`.

Formulir RSVP dan ucapan bersama menggunakan Cloud Firestore project `undangan-218fe`. Database **(default)** di Jakarta, Anonymous Authentication, dan Firestore Security Rules sudah aktif. Lihat [panduan Firebase](setup/FIRESTORE.md) untuk lokasi data, aturan akses, dan pemeriksaan formulir.

Ucapan terbaru tampil langsung di undangan. RSVP hanya dapat dilihat pemilik project di Firebase Console.

## Gunakan kembali untuk undangan lain

Folder [`starter/`](starter/README.md) berisi template mandiri dari situs ini. Ubah `starter/invitation.json` untuk nama, tanggal, cerita, foto, musik, warna, dan layout. Tiap undangan baru memakai `id` Firestore yang berbeda. Panduan di folder tersebut menjelaskan penyiapan Firebase dan GitHub Pages dari awal hingga terbit, tanpa mengubah undangan Amelia & Zeus.
