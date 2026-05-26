import React from "react";

export interface Brand {
  slug: string;
  name: string;
  category: "swiss" | "fashion" | "jewelry";
  history: string;
  logoText: string;
  logoSubtext?: string;
  hasCustomLogo?: boolean;
}

export const BRANDS: Brand[] = [
  // MARCAS SUIZAS
  {
    slug: "longines",
    name: "Longines",
    category: "swiss",
    history: "Fundada en 1832 en Saint-Imier, Suiza, Longines es una de las marcas de relojería más antiguas y respetadas del mundo. Reconocida por el logotipo de su reloj de arena alado, la marca combina elegancia clásica, tradición inigualable y precisión técnica en cada una de sus creaciones artísticas.",
    logoText: "LONGINES",
    logoSubtext: "ELEGANCE IS AN ATTITUDE"
  },
  {
    slug: "norqain",
    name: "Norqain",
    category: "swiss",
    history: "Norqain es una marca suiza de relojes totalmente independiente y de propiedad familiar, con sede en Nidau, en el corazón de la relojería suiza. Sus relojes mecánicos están diseñados para exploradores y deportistas que viven la vida bajo su propio lema: 'my life, my way'.",
    logoText: "NORQAIN",
    logoSubtext: "SWISS MADE WATCHES"
  },
  {
    slug: "oris",
    name: "Oris",
    category: "swiss",
    history: "Fundada en Hölstein, Suiza, en 1904, Oris destaca por producir exclusivamente relojes mecánicos. Con su característico rotor rojo, símbolo de la alta mecánica suiza, la marca es célebre por su compromiso con la sostenibilidad marina y terrestre y sus colecciones de aviación, buceo y cultura.",
    logoText: "ORIS",
    logoSubtext: "HÖLSTEIN 1904"
  },
  {
    slug: "edox",
    name: "Edox",
    category: "swiss",
    history: "Desde 1884, Edox ha diseñado relojes de alta gama impulsados por la pasión y la excelencia técnica suiza. Conocido por sus innovaciones en resistencia al agua de alta profundidad, es uno de los nombres más respetados en la relojería deportiva internacional.",
    logoText: "EDOX",
    logoSubtext: "SWISS WATCHES"
  },
  {
    slug: "rado",
    name: "Rado",
    category: "swiss",
    history: "Fundada en 1917 en Lengnau, Suiza, Rado es conocida mundialmente como el 'Maestro de los Materiales' por su revolucionario uso de cerámica de alta tecnología, materiales ultraligeros y diamantes de alta resistencia. Diseños vanguardistas de belleza perdurable.",
    logoText: "RADO",
    logoSubtext: "SWITZERLAND"
  },
  {
    slug: "tissot",
    name: "Tissot",
    category: "swiss",
    history: "Desde su fundación en 1853 en Le Locle, Suiza, Tissot ha revolucionado la industria relojera con su espíritu innovador y su lema 'Innovators by Tradition'. Es cronometrador oficial de importantes campeonatos mundiales y ofrece piezas de alta precisión y calidad suiza.",
    logoText: "TISSOT",
    logoSubtext: "SWISS WATCHES SINCE 1853"
  },
  {
    slug: "mido",
    name: "Mido",
    category: "swiss",
    history: "Fundada en 1918 por Georges Schaeren, Mido tiene su sede en Le Locle, Suiza. Inspirada en la arquitectura atemporal, la marca combina estética clásica con excelencia técnica, ofreciendo movimientos automáticos excepcionales de gran precisión y fiabilidad.",
    logoText: "MIDO",
    logoSubtext: "SWISS WATCHES SINCE 1918"
  },
  {
    slug: "hamilton",
    name: "Hamilton",
    category: "swiss",
    history: "Establecida en 1892 en Lancaster, Pensilvania, y ahora con sede en Biel, Suiza, Hamilton fusiona el audaz espíritu americano con la incomparable precisión de la tecnología suiza. Célebre por sus apariciones en el cine de Hollywood y su fuerte herencia en la aviación militar.",
    logoText: "HAMILTON",
    logoSubtext: "AMERICAN SPIRIT · SWISS PRECISION"
  },
  {
    slug: "raymond-weil",
    name: "Raymond Weil",
    category: "swiss",
    history: "Fundada en Ginebra en 1976, Raymond Weil es una de las últimas marcas independientes de relojería suiza familiar. Sus piezas se caracterizan por una elegancia intemporal muy influenciada por la música clásica y la ópera de alta gama.",
    logoText: "RAYMOND WEIL",
    logoSubtext: "GENEVE"
  },
  {
    slug: "victorinox",
    name: "Victorinox",
    category: "swiss",
    history: "Fundada en 1884, la marca de la icónica navaja suiza representa calidad, funcionalidad e innovación. Su división de relojería, nacida en Delémont, Suiza, diseña relojes extremadamente robustos que superan las pruebas de resistencia más exigentes del planeta.",
    logoText: "VICTORINOX",
    logoSubtext: "SWISS ARMY"
  },
  {
    slug: "certina",
    name: "Certina",
    category: "swiss",
    history: "Desde su origen en 1888, Certina se distingue por su inigualable robustez. Su célebre sistema Double Security (DS), introducido en 1959, ha convertido a la marca suiza en un sinónimo internacional de resistencia, precisión cronométrica y espíritu deportivo.",
    logoText: "CERTINA",
    logoSubtext: "SWISS WATCHES SINCE 1888"
  },

  // MARCAS FASHION
  {
    slug: "fossil",
    name: "Fossil",
    category: "fashion",
    history: "Nacida en Texas en 1984, Fossil redefinió la relojería de moda al combinar la nostalgia vintage del diseño clásico americano con un estilo moderno, joven y accesible. Una de las marcas de moda más queridas globalmente por su creatividad y autenticidad.",
    logoText: "FOSSIL",
    logoSubtext: "EST. 1984"
  },
  {
    slug: "michael-kors",
    name: "Michael Kors",
    category: "fashion",
    history: "La icónica marca americana del renombrado diseñador Michael Kors representa el lujo moderno y el glamour chic de la moda global. Sus relojes son codiciados accesorios de moda, caracterizados por acabados dorados deslumbrantes y cristales sofisticados.",
    logoText: "MICHAEL KORS",
    logoSubtext: "NEW YORK"
  },
  {
    slug: "emporio-armani",
    name: "Emporio Armani",
    category: "fashion",
    history: "Línea de moda vanguardista del legendario diseñador Giorgio Armani. Sus relojes personifican la elegancia y el minimalismo italiano de alta costura, combinando un diseño formal de exquisito gusto con la energía urbana contemporánea.",
    logoText: "EMPORIO ARMANI",
    logoSubtext: "MILANO"
  },
  {
    slug: "tommy-hilfiger",
    name: "Tommy Hilfiger",
    category: "fashion",
    history: "Fundada en 1985, Tommy Hilfiger plasma el clásico estilo 'all-American cool' con un toque deportivo y náutico. Sus relojes destacan por combinar de manera perfecta los colores azul, blanco y rojo en diseños casuales de gran versatilidad.",
    logoText: "TOMMY HILFIGER",
    logoSubtext: "EST. 1985"
  },

  // JOYERÍA
  {
    slug: "rubi-atelier",
    name: "Rubí Atelier",
    category: "jewelry",
    history: "Nuestra marca exclusiva de joyería fina de autor. En Rubí Atelier, cada pieza es diseñada a mano y fabricada con oro de 18 quilates, platino y diamantes seleccionados bajo los más estrictos estándares éticos y de pureza mundiales, celebrando el amor eterno.",
    logoText: "RUBÍ ATELIER",
    logoSubtext: "ALTA JOYERÍA"
  },
  {
    slug: "rubi-collection",
    name: "Rubí Collection",
    category: "jewelry",
    history: "Una colección exclusiva que celebra la belleza y sofisticación de la vida cotidiana. Diseños modernos y sutiles en metales preciosos y piedras semipreciosas, pensados para expresar tu elegancia personal y brillar con luz propia en cada ocasión.",
    logoText: "RUBÍ COLLECTION",
    logoSubtext: "DISEÑO CONTEMPORÁNEO"
  }
];
