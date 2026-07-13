# Oqline AI — Versi Mandiri (Standalone)

Versi ini bisa dijalankan sendiri (di komputer, server, atau hosting) tanpa
tergantung pada Claude.ai. API key disimpan aman di server, tidak pernah
terlihat di browser/publik.

## Struktur folder

```
oqline-ai-server/
├── server.js          ← backend (perantara ke API OpenRouter)
├── package.json
├── .env.example        ← contoh konfigurasi, salin jadi ".env"
└── public/
    └── index.html       ← tampilan Oqline AI (frontend)
```

## Cara menjalankan (di komputer sendiri / VPS)

1. Pastikan **Node.js** versi 18 atau lebih baru sudah terinstall.
   Cek dengan: `node -v`

2. Masuk ke folder project:
   ```
   cd oqline-ai-server
   ```

3. Install dependency:
   ```
   npm install
   ```

4. Salin file `.env.example` menjadi `.env`:
   ```
   cp .env.example .env
   ```

5. Buka file `.env`, isi `OPENROUTER_API_KEY` dengan API key asli kamu.
   Ambil API key dari: https://openrouter.ai → menu "Keys"

6. Jalankan server:
   ```
   npm start
   ```

7. Buka browser ke: **http://localhost:3000**
   Oqline AI sudah bisa dipakai dan terhubung ke API sungguhan.

## Cara pasang di hosting/domain Oqline

Beberapa pilihan termudah untuk hosting backend Node.js:

- **Railway** (railway.app) — upload folder ini, set environment variable
  `OPENROUTER_API_KEY`, otomatis jalan dan dapat URL publik.
- **Render** (render.com) — sama, tinggal hubungkan repo GitHub.
- **VPS sendiri** (misal jika Oqline punya server) — jalankan dengan `pm2`
  agar tetap aktif:
  ```
  npm install -g pm2
  pm2 start server.js --name oqline-ai
  ```

Setelah online, domain seperti `chat.oqline.id` bisa diarahkan (lewat reverse
proxy Nginx atau pengaturan DNS provider hosting) ke aplikasi ini.

## Catatan keamanan

- **Jangan pernah** menaruh API key langsung di file HTML/JS yang bisa
  dilihat publik — itu sebabnya backend ini dibuat sebagai perantara.
- File `.env` jangan diunggah ke GitHub publik. Tambahkan `.env` ke
  `.gitignore` kalau project ini dimasukkan ke repository Git.
- Ada pembatasan dasar 20 permintaan / 5 menit per pengunjung di
  `server.js` untuk mencegah penyalahgunaan; bisa disesuaikan sesuai
  kebutuhan trafik nyata.
