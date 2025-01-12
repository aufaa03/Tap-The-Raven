//mengatur canvas dan konteksnya
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;  //mengatur tinggi canvas sesuai tinggi layar
canvas.width = window.innerWidth;  //mengatur lebar canvas sesuai lebar layar
// canvas.style.cursor = "url('../img/cursor.png') auto, default";

//mengatur Collison canvas dan konteksnya
const collisonCanvas = document.getElementById("collisonCanvas");
const collisonCtx = collisonCanvas.getContext("2d");
collisonCanvas.height = window.innerHeight; //mengatur tinggi canvas sesuai lebar layar
collisonCanvas.width = window.innerWidth;  //mengatur lebar canvas sesuai lebar layar

let timeToNextRaven = 0; //waktu untuk menampilkan gagak berikutnya
let ravenInterval = 700;  //menentukan durasi antar gagak berikutnya,semakin besar value semakin lambat
let lastTime = 0; //waktu terakhir animasi
let score = 0; //SKor permainan
ctx.font = "30px Impact"; //ukuran font untuk fillText()
let GameOver = false; //Status apakkah permainan selesai

let gagak = []; //array untuk menyimpan gagak
//class untuk mendeklarasikan object gagak
class Gagak {
    constructor() {
        this.spriteWidth = 271; //ukuran lebar gagak perframe
        this.spriteHeight = 194; //ukuran tinggi gagak perframe
        this.sizeModif = Math.random() * 0.6 + 0.4; //mengatur ukuran gagak secara acak
        this.width = this.spriteWidth * this.sizeModif; //mengatur lebar gagak berdasarkan ukuran modifikasi
        this.height = this.spriteHeight * this.sizeModif; //mengatur tinggi gagak berdasarkan ukuran modifikasi
        this.x = canvas.width; //mengatur posisi awal gagak di awal permainan berada dikanan
        this.y = Math.random() * (canvas.height - this.height); //posisi kemunculan gagak secara acak secara vetikal(atas,bawah)
        this.directionX = Math.random() * 5 + 3; //mengatur kecepatan horizontal(kanan,kiri) gagak secara acak
        this.directionY = Math.random() * 5 - 2.5; //mengatur kecepatan vertikal(atas,bawah) gagak secara acak
        this.markedForDelete = false; //penanda untuk  menghapus gagak
        this.image = new Image(); //memuat gambar gagak
        this.image.src = "img/raven.png";
        this.frame = 0; //frame awal untuk animasi gagak
        this.maxFrame = 4; //frame maksimal/total frame untuk animasi gagak
        this.timeSinceFlap = 0;  // Waktu sejak frame terakhir berubah
        this.flapInterval = Math.random() * 50 + 50; //mengatur interval antar frame berubah
        this.randomColors = [
            //warna acak untuk mendeteksi tabrakan
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
        ];
        this.color =
            "rgb(" +
            this.randomColors[0] +
            "," +
            this.randomColors[1] +
            "," +
            this.randomColors[2] +
            ")";
        this.hasTrail = Math.random() > 0.5; // Penanda apakah gagak meninggalkan jejak partikel
    }
    //fungsi untuk memperbarui posisi dan logika gagak
    update(deltaTime) {
        //jika gagak keluar batas atas atau bawah
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1; //ubah arah gagak(pantulkan kedalam area)
        }
        this.x -= this.directionX; //menggerakan gagak dari kkanan kekiri
        this.y += this.directionY; // menggerakan posisi kemunculan gagak secara vertikal(atas,bawah)
        //jika gagak keluar batas kiri area canvas
        if (this.x < 0 - this.width) {
            this.markedForDelete = true; //tandai gagak yang keluar batas untuk dihapus
        }
        this.timeSinceFlap += deltaTime; //menghitung waktu sejak frame terakhir berubah
        //
        if (this.timeSinceFlap > this.flapInterval) {
            //looping untuk animasi
            //jika frame melebihi maxFrame maka nilai frame akan direset/dimulai ulang
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                // Menambahkan partikel jika gagak meninggalkan jejak
                for (let i = 0; i < 5; i++) {
                    particle.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        if (this.x < 0 - this.width) {
            GameOver = true; //jika gagak keluar batas kiri maka game selesai
        }
    }
    //fungsi untuk menggambar gagak dicanvas
    draw() {
        collisonCtx.fillStyle = this.color;  // Menggambar warna untuk deteksi tabrakan
        collisonCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.image,
            this.frame * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}
let ledakan = []; //array untuk menyimpan ledakan
// Kelas untuk objek ledakan (efek visual ketika gagak dihancurkan)
class Ledakan {
    constructor(x, y, size) {
        this.image = new Image(); //memuat gambar ledakan
        this.image.src = "img/boom.png";
        this.spriteWidth = 200; //ukuran lebar sprite ledakan per frame
        this.spriteHeight = 179; //ukuran tinggi sprite ledakan per frame
        this.size = size; //ukuran ledakan (disesuaikan dengan ukuran gagak)
        this.x = x; //posisi horizontal (KIRI,KANAN) ledakan (disesuaikan dengan posisi gagak)
        this.y = y;  //posisi vertikal (ATAS,BAWAH) ledakan (disesuaikan dengan posisi gagak)
        this.frame = 0; //frame awal untuk ledakan
        this.audio = new Audio(); //memuat suara ledakan
        this.audio.src = "sound/boom.wav";
        this.timeSinceLastFrame = 0; //menghitung waktu sejak frame terakhir ledakan
        this.frameInterval = 200;  //interval waktu antar frame ledakan
        this.markedForDelete = false; //penanda untuk menghapus animasi ledakan setelah animasi selesai
    }
    // fungsi untuk mengupdate posisi dan frame ledakan
    update(deltaTime) {
        if (this.frame === 0) {
            this.audio.play(); // mainkan suara ledakan jika frame === 0 atau frame pertama
        }
        this.timeSinceLastFrame += deltaTime;  //menghitung waktu sejak frame terakhir ledakan
        if (this.timeSinceLastFrame > this.frameInterval) { //Mengecek apakah waktu yang berlalu (this.timeSinceLastFrame) sudah lebih besar dari durasi frame (this.frameInterval).
            this.frame++; //Jika kondisi terpenuhi, artinya sudah waktunya untuk mengganti frame animasi.
            if (this.frame > 5) { // jika frame sudah mencapai 5 berarti animasi ledakan sudah selesai
                this.markedForDelete = true; // maka tandai untuk dihapus
            }
        }
    }
    draw() {
        ctx.drawImage(
            this.image,
            this.frame * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.size,
            this.size
        );
    }
}
let particle = [];
// Kelas untuk objek partikel (jejak visual gagak)
class Particle {
    constructor(x, y, size, color) {
        this.size = size; //ukuran partikel (disesuaikan dengan ukuran gagak)
        this.x = x + this.size / 2 + Math.random() * 40 - 25;  // Posisi horizontal acak 
        this.y = y + this.size / 3 + Math.random() * 40 - 25;  // Posisi vertikal acak
        this.radius = (Math.random() * this.size) / 10; //ukuran radius partikel acak Jika this.size (ukuran gagak) besar, maka partikel yang dihasilkan juga akan cenderung lebih besar.
        this.Maxradius = Math.random() * 20 + 35; //ukuran radius maksimal,menentukan ukuran maksimum partikel sebelum partikel dihapus dari permainan.
        this.markedForDelete = false; //penanda untuk menghapus partikel setelah animasi selesaix   
        this.speedX = Math.random() * 1 + 0.5; //kecepatan horizontal acak
        this.color = color; //warna partikel (disesuaikan dengan warna gagak)
    }
    // Fungsi untuk memperbarui posisi dan ukuran partikel  
    update() {
        this.x += this.speedX; // Gerakan horizontal
        this.radius += 0.3;  // Perubahan ukuran partikel
        if (this.radius > this.Maxradius - 5) this.markedForDelete = true; // Jika ukuran partikel sudah mencapai ukuran maksimal, maka partikel akan ditandai untuk dhapus
    }
    //
    draw() {
        ctx.save(); // Simpan konteks canvas
        ctx.globalAlpha = 1 - this.radius / this.Maxradius; //Ketika partikel kecil (radius mendekati 0), transparansi akan mendekati 1 (tidak transparan).
        // -Ketika partikel mendekati ukuran maksimum (this.Maxradius), transparansi akan mendekati 0 (hampir hilang).
        // -Ini menciptakan efek visual di mana partikel "menghilang" secara bertahap saat membesar.
        ctx.beginPath(); // Mulai menggambar lingkaran
        ctx.fillStyle = this.color;  // Warna partikel
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);  // Gambar lingkaran
        ctx.fill(); // Isi lingkaran dengan warna
        ctx.restore(); // Kembalikan konteks canvas ke kondisi awal
    }
}
// Fungsi untuk menampilkan skor pemain di layar
function drawScore() {
    ctx.font = "30px Impact"; // Atur font skor
    ctx.fillStyle = "black"; // Warna teks bayangan
    ctx.fillText("Score : " + score, 52, 72); // Tampilkan skor dengan bayangan hitam
    ctx.fillStyle = "white"; // Warna teks utama
    ctx.fillText("Score : " + score, 55, 75); // Tampilkan skor dengan warna putih
}
// Fungsi untuk menampilkan teks game over di layar
function drawGameOver() {
    ctx.font = "34px Impact"; // Atur font teks
    ctx.textAlign = "center"; // Atur teks di tengah
    ctx.fillStyle = "black"; // Warna teks bayangan
    ctx.fillText( "Game Over , Score Kamu : " + score, canvas.width / 2 + 3, canvas.height / 2
    ); // Tampilkan teks game over
    ctx.fillStyle = "white"; // Warna teks utama
    ctx.fillText( "Game Over , Score Kamu : " + score, canvas.width / 2 + 5, canvas.height / 2 + 5
    ); // Tampilkan skor akhir
    ctx.fillStyle = "black"; // Warna teks bayangan 
    ctx.fillText( "Klik untuk Mulai Ulang", canvas.width / 2 + 3, canvas.height / 2 + 80
    ); // Instruksi untuk mulai ulang
    ctx.fillStyle = "white"; // Warna teks utama
    ctx.fillText( "Klik untuk Mulai Ulang", canvas.width / 2 + 5, canvas.height / 2 + 83
    ); // Instruksi untuk mulai ulang
}

// Fungsi untuk menampilkan catatan pada layar
function note() {
    ctx.fillStyle = "black"; // Warna teks bayangan
    ctx.fillText("Note : Jangan Biarkan Gagak Nakal itu Lolos!!", 50, 655); // Teks bayangan
    ctx.fillStyle = "white"; // Warna teks utama
    ctx.fillText("Note : Jangan Biarkan Gagak Nakal itu Lolos!!", 50, 650); // Teks utama
}

// Event listener untuk mendeteksi klik pemain
window.addEventListener("click", function (e) {
    const detectPixelColor = collisonCtx.getImageData(e.x, e.y, 1, 1); // Ambil warna piksel di posisi klik
    // console.log(detectPixelColor);
    const pc = detectPixelColor.data; // Ambil data warna piksel (RGBA)
    gagak.forEach((object) => {
        if (
            object.randomColors[0] === pc[0] &&
            object.randomColors[1] === pc[1] &&
            object.randomColors[2] === pc[2]
        )      // Jika warna pixel sesuai dengan gagak 
        {
            //deteksi hapus
            object.markedForDelete = true; // Tandai gagak untuk dihapus
            score++; // Tambahkan skor
            ledakan.push(new Ledakan(object.x, object.y, object.width)); // Buat ledakan di posisi gagak
            console.log(ledakan);
        }
        if (GameOver) {
            location.reload(); // Reload halaman jika game over
        }
    });
});

//fungsi utama animasi
function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas utama
    collisonCtx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas deteksi/tabrakan
    let deltaTime = timestamp - lastTime; // Hitung perbedaan waktu antara frame sekarang dan frame sebelumnya
    lastTime = timestamp; //perbarui waktu terakhir
    timeToNextRaven += deltaTime; // Tambahkan waktu untuk gagak berikutnya
    if (timeToNextRaven > ravenInterval) {
        gagak.push(new Gagak()); // Tambahkan gagak baru jika waktunya telah tiba
        timeToNextRaven = 0; // Reset waktu untuk gagak berikutnya
        gagak.sort(function (a, b) {
            return a.width - b.width; // Urutkan gagak berdasarkan ukuran , besar akan dideklarasikan terakhir
        });
    }
    drawScore(); // Tampilkan skor
    note(); // Tampilkan notifikasi
    [...particle, ...gagak, ...ledakan].forEach((object) => object.update(deltaTime)); // Update semua objek
    [...particle, ...gagak, ...ledakan].forEach((object) => object.draw()); // Gambar semua objek
    gagak = gagak.filter((object) => !object.markedForDelete);  // Hapus gagak yang telah ditandai untuk dihapus
    ledakan = ledakan.filter((object) => !object.markedForDelete); // Hapus ledakan yang telah ditandai untuk dihapus
    particle = particle.filter((object) => !object.markedForDelete); // Hapus partikel yang telah ditandai untuk dihapus
    if (!GameOver) requestAnimationFrame(animate); // Lanjutkan animasi jika game belum selesai
    else drawGameOver(); // Tampilkan game over jika game telah selesai
}
//menjalankan fungsi utama animasi
animate(0);
