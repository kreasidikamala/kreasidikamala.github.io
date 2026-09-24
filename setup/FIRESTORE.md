# Menghubungkan RSVP dan ucapan ke Cloud Firestore

Undangan ini memakai GitHub Pages untuk tampilan dan Cloud Firestore untuk data bersama. Ucapan terbaru tampil langsung kepada semua pengunjung. RSVP disimpan untuk penyelenggara dan tidak dapat dibaca melalui aplikasi publik.

## 1. Siapkan Firebase

1. Buka Firebase Console dan pilih project Anda. Pastikan **Cloud Firestore** sudah dibuat, memakai database **(default)**.
2. Di **Authentication → Sign-in method**, aktifkan **Anonymous**. Tamu tidak perlu memasukkan email atau membuat akun sendiri; situs membuat identitas anonim secara otomatis.
3. Konfigurasi Web app project `undangan-218fe` sudah ada di `firebase-config.js`. Nilai konfigurasi Web app boleh ada di berkas publik. Jangan masukkan private key, service-account JSON, atau credential admin ke repository.

## 2. Pasang Firestore Security Rules

Di Firebase Console, buka **Firestore Database → Rules**. Jika Firestore Anda sudah dipakai untuk aplikasi lain, **jangan mengganti seluruh rules**. Tambahkan dua blok `match /invitations/amelia-zeus/...` dari `setup/firestore.rules.example` ke dalam blok `match /databases/{database}/documents` yang sudah ada. Jika database ini baru dan belum mempunyai aturan lain, Anda dapat memakai seluruh contoh. Klik **Publish**.

Aturan tersebut mengizinkan tamu membaca 30 ucapan terbaru dan menambah ucapan, tetapi tidak mengizinkan mereka mengubah atau menghapus ucapan. RSVP hanya dapat dibuat atau diperbarui oleh identitas anonim tamu yang sama; pembacaan RSVP dari browser ditolak. Pemilik project tetap dapat melihat data melalui Firebase Console.

## 3. Uji sebelum menerbitkan

1. Buka undangan di dua browser atau perangkat. Kirim ucapan dari satu perangkat; daftar ucapan di perangkat lain akan berubah otomatis.
2. Kirim RSVP, lalu buka **Firestore Database → Data → invitations → amelia-zeus → rsvps** di Firebase Console. Ubah RSVP dari browser yang sama dan pastikan dokumennya diperbarui.
3. Coba buka undangan saat koneksi diputus: tombol kirim akan menampilkan kegagalan, sehingga pengunjung tidak mendapat konfirmasi palsu.

Dokumen ucapan berada di subkoleksi `invitations/amelia-zeus/wishes`. Halaman menampilkan 30 terbaru; data yang lebih lama tetap ada di Firestore. RSVP atau ucapan lama yang sebelumnya hanya tersimpan di `localStorage` tidak otomatis berpindah ke Firestore.

**Sebelum menerbitkan:** aktifkan Anonymous Authentication dan terbitkan aturan Firestore. Firebase App Check dapat ditambahkan untuk mengurangi penyalahgunaan formulir publik; aturan anonim saja tidak mencegah spam sepenuhnya.
