export const categories = [
  {
    id: 1,
    name: 'Tarih',
    icon: '📚',
    color: '#FF6B6B',
    description: 'Dünya tarihi ve medeniyetler'
  },
  {
    id: 2,
    name: 'Coğrafya',
    icon: '🌍',
    color: '#4ECDC4',
    description: 'Dünya coğrafyası ve doğal olaylar'
  },
  {
    id: 3,
    name: 'Biyoloji',
    icon: '🧬',
    color: '#45B7D1',
    description: 'Canlılar dünyası ve yaşam bilimleri'
  },
  {
    id: 4,
    name: 'Kimya',
    icon: '⚗️',
    color: '#9F7AEA',
    description: 'Madde ve elementler'
  },
  {
    id: 5,
    name: 'Matematik',
    icon: '📐',
    color: '#38B2AC',
    description: 'Sayılar ve geometri'
  },
  {
    id: 6,
    name: 'Edebiyat',
    icon: '📖',
    color: '#ED8936',
    description: 'Şiir, roman ve edebiyat'
  },
  {
    id: 7,
    name: 'Müzik',
    icon: '🎵',
    color: '#805AD5',
    description: 'Müzik tarihi ve teorisi'
  }
];

export const quizQuestions = {
  1: [ // Tarih
    {
      id: 1,
      question: "İstanbul'un fethi hangi yıl gerçekleşmiştir?",
      options: ["1453", "1454", "1452", "1455"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 2,
      question: "Fransız İhtilali hangi yıl başladı?",
      options: ["1789", "1799", "1776", "1815"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 3,
      question: "Osmanlı İmparatorluğu'nun kurucusu kimdir?",
      options: ["Fatih Sultan Mehmet", "Yavuz Sultan Selim", "Osman Gazi", "Kanuni Sultan Süleyman"],
      correctAnswer: 2,
      timeLimit: 15
    },
    {
      id: 4,
      question: "I. Dünya Savaşı hangi yıllarda sürdü?",
      options: ["1914-1918", "1939-1945", "1870-1871", "1812-1815"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 5,
      question: "Atatürk'ün doğum yılı hangisidir?",
      options: ["1881", "1880", "1882", "1879"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 6,
      question: "Roma İmparatorluğu MS kaç yılında ikiye ayrıldı?",
      options: ["395", "476", "410", "455"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 7,
      question: "II. Dünya Savaşı hangi yılda başladı?",
      options: ["1939", "1941", "1945", "1938"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 8,
      question: "Türk Kurtuluş Savaşı hangi yıl başladı?",
      options: ["1919", "1920", "1921", "1922"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 9,
      question: "Moğollar'ın Bağdat'ı işgal ettiği yıl hangisidir?",
      options: ["1258", "1260", "1243", "1299"],
      correctAnswer: 0,
      timeLimit: 15
    },
    {
      id: 10,
      question: "Endülüs Emevi Devleti hangi yıl yıkıldı?",
      options: ["1492", "1453", "1517", "1299"],
      correctAnswer: 0,
      timeLimit: 15
    }
  ],
  2: [ // Coğrafya
    {
      id: 1,
      question: "Dünyanın en büyük kıtası hangisidir?",
      options: ["Asya", "Afrika", "Kuzey Amerika", "Avrupa"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 2,
      question: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "Ankara", "İzmir", "Antalya"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 3,
      question: "En uzun nehir hangisidir?",
      options: ["Amazon", "Nil", "Mississippi", "Yangtze"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Dünyanın en yüksek dağı hangisidir?",
      options: ["K2", "Everest", "Kangchenjunga", "Lhotse"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Hangi kıta Güney Kutbu'nu içerir?",
      options: ["Asya", "Avustralya", "Antarktika", "Afrika"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Türkiye'nin en büyük gölü hangisidir?",
      options: ["Van Gölü", "Tuz Gölü", "Beyşehir Gölü", "Eğirdir Gölü"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Ekvator hangi iki yarım küreyi ayırır?",
      options: ["Doğu-Batı", "Kuzey-Güney", "Doğu-Batı", "Kuzey-Güney"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 8,
      question: "Türkiye'de bulunan yedi coğrafi bölge sayısı kaçtır?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 9,
      question: "Dünyanın en derin gölü hangisidir?",
      options: ["Baykal Gölü", "Tanganyika Gölü", "Hazar Denizi", "Superior Gölü"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Türkiye'nin en uzun nehri hangisidir?",
      options: ["Kızılırmak", "Fırat", "Dicle", "Sakarya"],
      correctAnswer: 1,
      timeLimit: 12
    }
  ],
  3: [ // Biyoloji
    {
      id: 1,
      question: "DNA'nın temel yapı birimleri nelerdir?",
      options: ["Amino asitler", "Nükleotidler", "Yağ asitleri", "Karbonhidratlar"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 2,
      question: "Fotosentez işlemi nerede gerçekleşir?",
      options: ["Mitokondri", "Kloroplast", "Ribozom", "Çekirdek"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 3,
      question: "İnsan vücudunda en büyük organ hangisidir?",
      options: ["Kalp", "Beyin", "Karaciğer", "Deri"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Kan gruplarını belirleyen sistem hangisidir?",
      options: ["RH sistemi", "ABO sistemi", "MNS sistemi", "Kell sistemi"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Bitkilerde su ve mineral taşınmasından sorumlu yapı hangisidir?",
      options: ["Ksilem", "Floem", "Kambiyum", "Epidermis"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Sinir sisteminin temel birimi nedir?",
      options: ["Sinaps", "Nöron", "Akson", "Dendrit"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Hücre bölünmesi türlerinden hangisi üreme ile ilgilidir?",
      options: ["Mitoz", "Mayoz", "Amitoz", "Endositoz"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 8,
      question: "Enzimler hangi tür biyomoleküldür?",
      options: ["Karbonhidrat", "Yağ", "Protein", "Nükleik asit"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 9,
      question: "İnsan gözünün renkli kısmı hangisidir?",
      options: ["Kornea", "İris", "Pupil", "Retina"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Kanın pıhtılaşmasından sorumlu hücreler hangileridir?",
      options: ["Eritrositler", "Lökositler", "Trombositler", "Plazma"],
      correctAnswer: 2,
      timeLimit: 12
    }
  ],
  4: [ // Kimya
    {
      id: 1,
      question: "Periyodik tabloda kaç element vardır?",
      options: ["118", "120", "116", "122"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 2,
      question: "Hangi elementin sembolü 'O' dur?",
      options: ["Altın", "Gümüş", "Oksijen", "Hidrojen"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 3,
      question: "Asit-baz reaksiyonlarında oluşan tuz nedir?",
      options: ["Asit + Baz = Tuz + Su", "Asit + Asit = Tuz + Gaz", "Baz + Baz = Tuz + Su", "Asit + Su = Tuz + Oksijen"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Molekül formülü H2O olan bileşik hangisidir?",
      options: ["Hidrojen peroksit", "Su", "Amonyak", "Metan"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Nötr bir çözeltinin pH değeri kaçtır?",
      options: ["7", "0", "14", "1"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Kovalent bağ nedir?",
      options: ["Elektron paylaşımı", "Elektron transferi", "İyonik bağ", "Metalik bağ"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Hangi elementin atom numarası 1'dir?",
      options: ["Helyum", "Hidrojen", "Lityum", "Bor"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 8,
      question: "Kimyasal reaksiyonlarda kütlenin korunumu kanunu kimi tarafından ortaya atılmıştır?",
      options: ["Newton", "Einstein", "Lavoisier", "Dalton"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 9,
      question: "Karbon atomunun değerliği kaçtır?",
      options: ["2", "4", "6", "8"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Hangi gaz renksiz, kokusuz ve zehirlidir?",
      options: ["Oksijen", "Azot", "Karbondioksit", "Karbonmonoksit"],
      correctAnswer: 3,
      timeLimit: 12
    }
  ],
  5: [ // Matematik
    {
      id: 1,
      question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
      options: ["180", "360", "90", "270"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 2,
      question: "2 üzeri 8'in değeri kaçtır?",
      options: ["16", "64", "128", "256"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 3,
      question: "Bir dairenin çevresi nasıl hesaplanır?",
      options: ["πr", "2πr", "πr²", "2πr²"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Hangi sayı asal sayıdır?",
      options: ["9", "15", "23", "25"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Bir dikdörtgenin alanı nasıl hesaplanır?",
      options: ["Uzunluk + Genişlik", "Uzunluk × Genişlik", "2 × (Uzunluk + Genişlik)", "Uzunluk² + Genişlik²"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Fibonacci dizisinin ilk 5 terimi hangisidir?",
      options: ["1, 1, 2, 3, 5", "1, 2, 3, 4, 5", "0, 1, 1, 2, 3", "1, 3, 5, 7, 9"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Hangi geometrik şeklin tüm kenarları eşittir?",
      options: ["Dikdörtgen", "Kare", "Paralelkenar", "Eşkenar üçgen"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 8,
      question: "10 faktöriyel (10!) kaçtır?",
      options: ["3628800", "362880", "36288", "3628"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 9,
      question: "İki sayının çarpımına ne denir?",
      options: ["Toplam", "Fark", "Bölüm", "Çarpım"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Bir sayının karekökü kaçtır?",
      options: ["Sayı × Sayı", "Sayı ÷ 2", "Sayı²", "√Sayı"],
      correctAnswer: 3,
      timeLimit: 12
    }
  ],
  6: [ // Edebiyat
    {
      id: 1,
      question: "Türk edebiyatının ilk romanı hangisidir?",
      options: ["Araba Sevdası", "İntibah", "Cezmi", "Sergüzeşt"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 2,
      question: "Divan edebiyatının en ünlü şairi kimdir?",
      options: ["Fuzuli", "Baki", "Nedim", "Şeyh Galip"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 3,
      question: "Halk edebiyatında en yaygın nazım şekli hangisidir?",
      options: ["Koşma", "Semai", "Varsağı", "Mani"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Türk edebiyatının milli destanı hangisidir?",
      options: ["Dede Korkut", "Manas", "Kutadgu Bilig", "Divanü Lügati't-Türk"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Roman türünün en önemli özelliği nedir?",
      options: ["Kısa olması", "Manzum olması", "Nesir olması", "Şiir olması"],
      correctAnswer: 2,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Türkçe'de ilk gramer kitabı kim tarafından yazılmıştır?",
      options: ["Kaşgarlı Mahmud", "Yunus Emre", "Hacı Bektaş Veli", "Ahmet Yesevi"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Edebiyat türlerinden hangisi gerçek hayattan esinlenir?",
      options: ["Roman", "Masal", "Fabl", "Efsane"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 8,
      question: "Türk edebiyatının ilk kadın romancısı kimdir?",
      options: ["Fatma Aliye", "Halide Edip", "Suat Derviş", "Adalet Ağaoğlu"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 9,
      question: "Şiirde uyak ne demektir?",
      options: ["Kelimelerin anlamı", "Kelimelerin ses benzerliği", "Şiirin konusu", "Şiirin ölçüsü"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Halk edebiyatında aşk temasını işleyen şiirlere ne denir?",
      options: ["Koçaklama", "Ağıt", "Güzelleme", "Taşlama"],
      correctAnswer: 2,
      timeLimit: 12
    }
  ],
  7: [ // Müzik
    {
      id: 1,
      question: "Türk müziğinde makam sistemi hangi kültürden etkilenmiştir?",
      options: ["Arap", "Fars", "Hint", "Çin"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 2,
      question: "Batı müziğinde nota sistemini kim geliştirmiştir?",
      options: ["Bach", "Mozart", "Beethoven", "Guido d'Arezzo"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 3,
      question: "Türk halk müziğinde en çok kullanılan çalgı hangisidir?",
      options: ["Bağlama", "Keman", "Kanun", "Ud"],
      correctAnswer: 0,
      timeLimit: 12
    },
    {
      id: 4,
      question: "Klasik Türk müziğinde usul kaç vuruşa bölünür?",
      options: ["4", "8", "16", "Değişken"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 5,
      question: "Dünyanın en ünlü opera bestecisi kimdir?",
      options: ["Mozart", "Verdi", "Puccini", "Wagner"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 6,
      question: "Türk müziğinde 'fasıl' ne demektir?",
      options: ["Tek şarkı", "Şarkı topluluğu", "Müzik aleti", "Ritim"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 7,
      question: "Piyano kaç oktavdan oluşur?",
      options: ["5", "7", "8", "9"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 8,
      question: "Türk sanat müziğinde en ünlü bestekar kimdir?",
      options: ["Hacı Arif Bey", "Hacı Faik Bey", "Santuri Ethem Efendi", "Tanburi Cemil Bey"],
      correctAnswer: 3,
      timeLimit: 12
    },
    {
      id: 9,
      question: "Müzikte tempo neyi ifade eder?",
      options: ["Ses yüksekliği", "Hız", "Ritim", "Melodi"],
      correctAnswer: 1,
      timeLimit: 12
    },
    {
      id: 10,
      question: "Türk halk müziğinde 'bozlak' hangi bölgenin ezgisidir?",
      options: ["Ege", "Karadeniz", "İç Anadolu", "Doğu Anadolu"],
      correctAnswer: 2,
      timeLimit: 12
    }
  ]
};
