"use strict";
// ============================================================
// DADOS: golpes, classes, animais, quiz, raridades
// ============================================================

// ---------- golpes base ----------
const MV = {};
function mv(id, name, kind, p, desc) { MV[id] = Object.assign({ id, name, kind, desc: desc || "" }, p); }

// Aves
mv("peck", "Bicada", "slash", { R: 40, arc: 1.0, dmg: 9, cd: .45 }, "Bicadas rápidas à frente.");
mv("gust", "Rajada de Vento", "proj", { n: 1, spd: 300, pierce: 3, life: 1.1, size: 7, dmg: 8, cd: .9 }, "Rajada que atravessa inimigos.");
mv("dive", "Mergulho Aéreo", "dash", { dist: 150, dmg: 22, cd: 2.6 }, "Mergulha sobre o alvo causando dano.");
mv("feathers", "Chuva de Penas", "rain", { n: 3, r: 26, dmg: 10, cd: 1.8, range: 260 }, "Penas caem sobre inimigos próximos.");
mv("wingblast", "Bater de Asas", "nova", { R: 80, dmg: 9, cd: 2, knock: 7 }, "Empurra todos para longe.");
mv("talon", "Garra Rasante", "boom", { spd: 260, life: 1.2, dmg: 12, cd: 1.5, size: 8 }, "Garra que vai e volta.");
mv("screech", "Grito Agudo", "nova", { R: 95, dmg: 5, cd: 3.5, stun: .8 }, "Atordoa inimigos ao redor.");
mv("twister", "Redemoinho", "orbit", { n: 2, R: 56, dmg: 6, size: 8 }, "Penas giram ao seu redor.");
mv("razorwind", "Vento Cortante", "proj", { n: 3, spread: .35, spd: 320, pierce: 1, life: .9, size: 5, dmg: 6, cd: 1.1 }, "Leque de lâminas de vento.");
// Felinos
mv("scratch", "Arranhão", "slash", { R: 44, arc: 1.3, dmg: 11, cd: .5, knock: 3 }, "Arranha tudo à frente.");
mv("fatalbite", "Mordida Letal", "slash", { R: 32, arc: .8, dmg: 22, cd: 1.1 }, "Mordida curta e pesada.");
mv("pounce", "Salto Predador", "dash", { dist: 130, dmg: 20, cd: 2.4 }, "Salta sobre a presa.");
mv("roar", "Rugido", "nova", { R: 100, dmg: 8, cd: 4, stun: 1 }, "Paralisa inimigos de medo.");
mv("ambush", "Emboscada", "rain", { n: 2, r: 20, dmg: 18, cd: 1.5, range: 220 }, "Ataca de surpresa inimigos aleatórios.");
mv("shadowclaw", "Garras Sombrias", "proj", { n: 2, spread: .22, spd: 300, pierce: 2, life: .8, size: 6, dmg: 9, cd: 1.0 }, "Garras de sombra à distância.");
mv("frenzy", "Frenesi", "slash", { R: 36, arc: 2.6, dmg: 7, cd: .32 }, "Rajada de arranhões em volta.");
mv("clawstorm", "Tempestade de Garras", "orbit", { n: 3, R: 48, dmg: 7, size: 7 }, "Garras giram ao redor.");
// Canídeos
mv("bite", "Mordida", "slash", { R: 34, arc: 1.0, dmg: 14, cd: .7 }, "Mordida veloz.");
mv("howl", "Uivo", "nova", { R: 110, dmg: 7, cd: 3.5, slow: .5, knock: 3 }, "Desacelera os inimigos.");
mv("charge", "Investida", "dash", { dist: 160, dmg: 20, cd: 2.8 }, "Corre atropelando.");
mv("pack", "Matilha", "orbit", { n: 2, R: 60, dmg: 7, size: 9 }, "Espíritos da matilha o protegem.");
mv("sniff", "Faro Mortal", "proj", { n: 1, spd: 260, home: 1, pierce: 1, life: 1.6, size: 6, dmg: 11, cd: .9 }, "Projétil que persegue o alvo.");
mv("growl", "Rosnado", "nova", { R: 70, dmg: 10, cd: 2.2, knock: 6 }, "Onda de intimidação.");
mv("tear", "Rasgar", "slash", { R: 46, arc: 2.0, dmg: 12, cd: .65 }, "Garras em arco largo.");
mv("dig", "Cavar", "rain", { n: 3, r: 22, dmg: 11, cd: 1.8, range: 240 }, "Terra explode sob os inimigos.");
// Fazenda / rebanho
mv("kick", "Coice", "slash", { R: 38, arc: 1.0, dmg: 16, cd: .8, knock: 8 }, "Coice poderoso.");
mv("headbutt", "Cabeçada", "dash", { dist: 110, dmg: 24, cd: 2.4 }, "Cabeçada em investida.");
mv("gallop", "Galope", "dash", { dist: 200, dmg: 18, cd: 3.0 }, "Galope longo atropelando.");
mv("bellow", "Berro", "nova", { R: 90, dmg: 9, cd: 3, knock: 9 }, "Berro que empurra.");
mv("stomp", "Pisada", "nova", { R: 75, dmg: 14, cd: 2.4, knock: 10 }, "Pisada em área.");
mv("woolspin", "Giro de Lã", "orbit", { n: 3, R: 50, dmg: 6, size: 10 }, "Tufos giram ao redor.");
mv("mud", "Poça de Lama", "zone", { r: 50, dur: 4, dmg: 5, cd: 3.5, slow: .55 }, "Lama que retarda inimigos.");
mv("hornslam", "Chifrada", "slash", { R: 44, arc: 1.6, dmg: 18, cd: .85, knock: 6 }, "Chifrada em arco.");
// Cervídeos
mv("antlers", "Chifres", "slash", { R: 50, arc: 1.9, dmg: 15, cd: .8, knock: 5 }, "Varre com os chifres.");
mv("rush", "Investida Veloz", "dash", { dist: 150, dmg: 22, cd: 2.6 }, "Avança com força.");
mv("brama", "Brama", "nova", { R: 100, dmg: 8, cd: 3.6, stun: .9 }, "Grito que atordoa.");
mv("thrust", "Estocada", "proj", { n: 1, spd: 360, pierce: 4, life: .7, size: 6, dmg: 14, cd: 1.0 }, "Estocada que perfura.");
mv("antlerwheel", "Galhada Giratória", "orbit", { n: 3, R: 62, dmg: 8, size: 9 }, "Galhos giram ao redor.");
mv("hoofstorm", "Tempestade de Cascos", "rain", { n: 4, r: 24, dmg: 12, cd: 2.2, range: 230 }, "Cascos esmagam os inimigos.");
mv("bound", "Salto Veloz", "dash", { dist: 90, dmg: 12, cd: 1.4 }, "Pulo rápido.");
// Roedores / coelhos
mv("gnaw", "Roer", "slash", { R: 28, arc: 1.0, dmg: 8, cd: .35 }, "Mordiscos muito rápidos.");
mv("nutshot", "Tiro de Bolota", "proj", { n: 2, spread: .18, spd: 300, pierce: 1, life: .9, size: 5, dmg: 6, cd: .8 }, "Arremessa bolotas.");
mv("burrow", "Toca Explosiva", "rain", { n: 2, r: 20, dmg: 13, cd: 1.6, range: 200 }, "Emerge debaixo dos inimigos.");
mv("tailwhip", "Rabada", "nova", { R: 55, dmg: 7, cd: 1.6, knock: 6 }, "Rabada em volta.");
mv("hoard", "Estoque de Comida", "heal", { amt: 8, cd: 6 }, "Come para recuperar vida.");
mv("hide", "Esconder-se", "shield", { dur: 1.2, cd: 7 }, "Fica invulnerável por instantes.");
mv("seedburst", "Rajada de Sementes", "proj", { n: 5, spread: 1.0, spd: 280, pierce: 1, life: .6, size: 4, dmg: 4, cd: 1.3 }, "Leque de sementes.");
mv("carrot", "Cenoura Arremessada", "proj", { n: 1, spd: 320, pierce: 2, life: 1.0, size: 6, dmg: 9, cd: .7 }, "Arremessa cenouras.");
mv("hop", "Pulo", "dash", { dist: 80, dmg: 10, cd: 1.4 }, "Pulo curto com dano.");
mv("thump", "Batida de Pata", "nova", { R: 70, dmg: 6, cd: 2.4, stun: .6, knock: 4 }, "Bate a pata e atordoa.");
mv("dodge", "Esquiva", "shield", { dur: .9, cd: 5 }, "Desvia de tudo por instantes.");
mv("clover", "Trevo da Sorte", "heal", { amt: 10, cd: 7 }, "Recupera vida.");
// Anfíbios
mv("tongue", "Língua Elástica", "proj", { n: 1, spd: 420, pierce: 3, life: .32, size: 5, dmg: 12, cd: .8 }, "Língua longa que atravessa.");
mv("leap", "Salto Anfíbio", "dash", { dist: 110, dmg: 16, cd: 2 }, "Salta sobre inimigos.");
mv("croak", "Coaxar", "nova", { R: 90, dmg: 5, cd: 3, slow: .55 }, "Retarda os inimigos.");
mv("toxic", "Gosma Venenosa", "zone", { r: 45, dur: 4, dmg: 6, cd: 3.2, dot: 1 }, "Poça tóxica no chão.");
mv("bubbles", "Bolhas", "orbit", { n: 3, R: 46, dmg: 5, size: 8 }, "Bolhas giram ao redor.");
mv("venomspit", "Cuspe Venenoso", "proj", { n: 1, spd: 280, pierce: 1, life: 1, size: 6, dmg: 7, cd: .9, dot: 3 }, "Veneno que queima com o tempo.");
mv("acidrain", "Chuva Ácida", "rain", { n: 3, r: 28, dmg: 8, cd: 2, range: 230, dot: 3 }, "Gotas ácidas corroem.");
// Crustáceo
mv("pinch", "Pinça", "slash", { R: 40, arc: 1.5, dmg: 15, cd: .7 }, "Pinça forte à frente.");
mv("shell", "Casco", "shield", { dur: 1.3, cd: 7 }, "Recolhe-se no casco.");
mv("sandtrap", "Areia Movediça", "zone", { r: 55, dur: 4, dmg: 3, cd: 3.5, slow: .5 }, "Área que prende inimigos.");
mv("sidedash", "Corrida Lateral", "dash", { dist: 120, dmg: 14, cd: 1.8 }, "Corre de lado.");
mv("clawsnap", "Estalo de Pinça", "nova", { R: 62, dmg: 12, cd: 1.9, knock: 5 }, "Estalo em área.");
mv("tide", "Maré", "rain", { n: 3, r: 30, dmg: 10, cd: 2, range: 220 }, "Ondas caem em inimigos.");
// Ursinos
mv("swipe", "Patada", "slash", { R: 52, arc: 1.7, dmg: 20, cd: .9, knock: 6 }, "Patada devastadora.");
mv("hug", "Abraço de Urso", "nova", { R: 62, dmg: 15, cd: 2.2, stun: .7 }, "Esmaga quem está perto.");
mv("bearroar", "Rugido Ursino", "nova", { R: 110, dmg: 8, cd: 4, stun: 1.1 }, "Rugido que paralisa.");
mv("salmon", "Chuva de Peixes", "rain", { n: 3, r: 28, dmg: 16, cd: 2.2, range: 240 }, "Peixes voam sobre os inimigos.");
mv("slam", "Pisão", "nova", { R: 85, dmg: 18, cd: 2.8, knock: 12 }, "Pisão que arremessa.");
mv("honey", "Mel", "heal", { amt: 14, cd: 6 }, "Mel recupera vida.");
mv("hibernate", "Hibernar", "shield", { dur: 1.6, cd: 8 }, "Fica invulnerável.");
mv("maul", "Dilacerar", "slash", { R: 46, arc: 2.4, dmg: 12, cd: .5 }, "Golpes em sequência.");
// Mustelídeo / javali
mv("slide", "Deslize", "dash", { dist: 140, dmg: 16, cd: 2 }, "Desliza atropelando.");
mv("stonetoss", "Pedrada", "proj", { n: 1, spd: 320, pierce: 2, life: .9, size: 6, dmg: 10, cd: .7 }, "Arremessa pedras.");
mv("splash", "Respingo", "nova", { R: 70, dmg: 9, cd: 1.9, knock: 6 }, "Onda d'água em área.");
mv("rivercurrent", "Correnteza", "zone", { r: 50, dur: 4, dmg: 4, cd: 3.2, slow: .5 }, "Correnteza retarda inimigos.");
mv("shellwhirl", "Giro de Conchas", "orbit", { n: 3, R: 48, dmg: 6, size: 8 }, "Conchas giram ao redor.");
mv("tusk", "Presas", "slash", { R: 34, arc: 1.2, dmg: 17, cd: .7, knock: 6 }, "Golpe de presas.");

// ---------- classes ----------
const CLASS = {
  bird:      { name: "Ave",        pool: ["peck", "gust", "dive", "feathers", "wingblast", "talon", "screech", "twister", "razorwind"] },
  waterfowl: { name: "Ave aquática", pool: ["peck", "wingblast", "splash", "gust", "dive", "bubbles", "feathers", "screech", "talon"] },
  poultry:   { name: "Ave de terreiro", pool: ["peck", "kick", "wingblast", "gust", "screech", "feathers", "twister", "dive"] },
  herd:      { name: "Rebanho",    pool: ["kick", "headbutt", "gallop", "bellow", "stomp", "woolspin", "mud", "hornslam"] },
  swine:     { name: "Suíno",      pool: ["tusk", "headbutt", "stomp", "mud", "bellow", "dig", "gallop"] },
  cervid:    { name: "Cervídeo",   pool: ["antlers", "rush", "brama", "thrust", "antlerwheel", "hoofstorm", "bound"] },
  feline:    { name: "Felino",     pool: ["scratch", "fatalbite", "pounce", "roar", "ambush", "shadowclaw", "frenzy", "clawstorm"] },
  canine:    { name: "Canídeo",    pool: ["bite", "howl", "charge", "pack", "sniff", "growl", "tear", "dig"] },
  ursine:    { name: "Ursino",     pool: ["swipe", "hug", "bearroar", "salmon", "slam", "honey", "hibernate", "maul"] },
  rodent:    { name: "Roedor",     pool: ["gnaw", "nutshot", "burrow", "tailwhip", "hoard", "hide", "seedburst"] },
  lago:      { name: "Lagomorfo",  pool: ["carrot", "hop", "thump", "kick", "burrow", "dodge", "clover", "tailwhip"] },
  amph:      { name: "Anfíbio",    pool: ["tongue", "leap", "croak", "toxic", "bubbles", "venomspit", "acidrain"] },
  crab:      { name: "Crustáceo",  pool: ["pinch", "bubbles", "shell", "sandtrap", "sidedash", "clawsnap", "tide"] },
  mustelid:  { name: "Mustelídeo", pool: ["slide", "stonetoss", "splash", "rivercurrent", "shellwhirl", "bite", "gnaw"] },
};

// ---------- raridades ----------
const TIERS = [
  { id: 0, name: "Comum",     color: "#9fb1c9", refund: 1 },
  { id: 1, name: "Incomum",   color: "#5fe08a", refund: 2 },
  { id: 2, name: "Raro",      color: "#4fb4ff", refund: 4 },
  { id: 3, name: "Épico",     color: "#c47bff", refund: 8 },
  { id: 4, name: "Exótico",   color: "#ffcb3d", refund: 0 }, // duplicata exótica devolve 1 ticket dourado
];
// Taxas (%): ticket comum e ticket dourado
const RATES = {
  free: [52, 30, 13, 4.6, 0.4],   // exóticos: 0,4% com ticket do jogo (raro)
  gold: [0, 0, 25, 40, 35],
};
const GOLD_PITY = 10; // a cada 10 giros dourados, 1 exótico garantido

// ---------- animais ----------
// traits: [Agilidade, Força, Astúcia, Sociabilidade, Coragem, Calma]
// sigs: [nome, golpe base, ajustes]  -> golpes próprios da espécie
const SPECIES = [];
function sp(id, name, spr, cls, tier, hp, spd, size, traits, sigs, starter) {
  SPECIES.push({ id, name, spr, cls, tier, hp, spd, size, traits, sigs: sigs || [], starter: !!starter });
}
// --- iniciais (fracos) ---
sp("coelho_branco", "Coelho Branco", "a24", "lago", 0, 70, 165, 34, [3, 0, 2, 1, 0, 3], [["Pulo Lunar", "hop", { dist: 120, dmg: 14 }], ["Orelha Alerta", "thump", { R: 85, stun: .9 }]], true);
sp("coelho_pardo", "Coelho Pardo", "a25", "lago", 0, 75, 160, 34, [3, 1, 1, 2, 1, 2], [["Cenoura Dourada", "carrot", { dmg: 12, pierce: 3 }], ["Toca Secreta", "burrow", { n: 3 }]], true);
sp("esquilo", "Esquilo Ruivo", "a26", "rodent", 0, 70, 160, 36, [2, 0, 3, 0, 1, 1], [["Chuva de Nozes", "nutshot", { n: 3, dmg: 7 }], ["Cauda Felpuda", "tailwhip", { R: 65, knock: 9 }]], true);
sp("tamia", "Tâmia Listrada", "a27", "rodent", 0, 72, 158, 32, [2, 0, 2, 2, 1, 1], [["Bochechas Cheias", "seedburst", { n: 7, dmg: 5 }], ["Corrida Listrada", "bound", { dist: 100, dmg: 14 }]], true);
sp("marmota", "Marmota", "a28", "rodent", 0, 95, 130, 38, [0, 2, 1, 1, 1, 3], [["Assobio de Alerta", "screech", { R: 90, stun: 1 }], ["Toca Profunda", "hide", { dur: 1.6 }]], true);
sp("sapo_verde", "Sapo Verde", "a33", "amph", 0, 85, 140, 36, [2, 1, 2, 1, 1, 2], [["Língua Ágil", "tongue", { dmg: 14, life: .4 }], ["Pulo Pantanoso", "leap", { dist: 130 }]], true);
sp("sapo_amarelo", "Sapo Dourado", "a34", "amph", 0, 80, 140, 36, [1, 0, 2, 1, 1, 3], [["Veneno Dourado", "venomspit", { dot: 5, dmg: 9 }], ["Poça Dourada", "toxic", { r: 55 }]], true);
sp("galinha_creme", "Galinha Caipira", "a36", "poultry", 0, 90, 140, 38, [1, 1, 1, 3, 1, 2], [["Ovo Explosivo", "carrot", { name: "Ovo Explosivo", dmg: 12, size: 7 }], ["Cacarejo Geral", "bellow", { R: 100, stun: .7 }]], true);
sp("pombo", "Pombo", "a41", "bird", 0, 72, 165, 34, [2, 0, 1, 3, 1, 1], [["Bando Urbano", "twister", { n: 3 }], ["Bomba de Pena", "feathers", { n: 4, dmg: 9 }]], true);
sp("caranguejo", "Caranguejo", "a35", "crab", 0, 105, 125, 36, [1, 2, 0, 1, 2, 1], [["Pinça Dupla", "pinch", { dmg: 20, R: 46 }], ["Escudo de Areia", "shell", { dur: 1.6 }]], true);
sp("azulao", "Azulão", "a39", "bird", 0, 68, 170, 34, [3, 0, 1, 2, 0, 1], [["Canto Cristalino", "screech", { R: 100, dmg: 7 }], ["Rasante Azul", "dive", { dist: 170 }]], true);
sp("pato_branco", "Pato Branco", "a37", "waterfowl", 0, 92, 140, 38, [1, 1, 0, 2, 1, 3], [["Quack Atordoante", "screech", { R: 90, stun: 1 }], ["Mergulho no Lago", "splash", { R: 85, dmg: 12 }]], true);
sp("galinha", "Galinha Ruiva", "a00", "poultry", 0, 88, 140, 38, [1, 1, 1, 2, 2, 1], [["Bicada Furiosa", "peck", { cd: .3, dmg: 10 }], ["Ninho Protegido", "hide", { dur: 1.4 }]], true);
// --- comuns / incomuns ---
sp("ganso", "Ganso", "a02", "waterfowl", 0, 110, 140, 44, [1, 2, 1, 1, 3, 0], [["Bicada de Ganso", "peck", { dmg: 14, R: 46 }], ["Grasnado Furioso", "bellow", { R: 100, knock: 12 }]]);
sp("pato_mallard", "Pato Selvagem", "a38", "waterfowl", 0, 95, 150, 38, [2, 1, 1, 2, 1, 2], [["Revoada", "razorwind", { n: 4 }], ["Mergulho Selvagem", "dive", { dmg: 26 }]]);
sp("pato_marrom", "Pata Marrom", "a40", "waterfowl", 0, 95, 148, 38, [1, 1, 1, 3, 0, 3], [["Filhotes Protegidos", "twister", { n: 3, dmg: 7 }], ["Poça do Lago", "rivercurrent", {}]]);
sp("porco", "Porco", "a04", "swine", 0, 125, 120, 42, [0, 2, 0, 1, 1, 3], [["Chafurdar", "mud", { r: 65, slow: .65 }], ["Trufa Explosiva", "dig", { n: 4, dmg: 13 }]]);
sp("ovelha", "Ovelha", "a05", "herd", 0, 115, 125, 42, [0, 1, 0, 3, 0, 3], [["Tosquia Giratória", "woolspin", { n: 4, dmg: 7 }], ["Bê Aterrorizante", "bellow", { stun: .8 }]]);
sp("cabra", "Cabra", "a06", "herd", 0, 110, 150, 42, [2, 2, 1, 1, 3, 0], [["Escalada Selvagem", "bound", { dist: 130, dmg: 18 }], ["Cabeçada de Pedra", "headbutt", { dmg: 28 }]]);
sp("galo", "Galo", "a01", "poultry", 1, 105, 150, 44, [2, 2, 1, 1, 3, 0], [["Canto do Galo", "roar", { R: 115, stun: 1.2 }], ["Esporão", "kick", { dmg: 22, R: 42 }]]);
sp("pato_cabecaverde", "Pato Real", "a03", "waterfowl", 1, 105, 150, 40, [2, 1, 2, 2, 2, 1], [["Voo Real", "gust", { n: 2, spread: .3 }], ["Pouso de Emergência", "wingblast", { R: 95 }]]);
sp("vaca", "Vaca", "a07", "herd", 1, 160, 110, 52, [0, 3, 0, 2, 1, 3], [["Mugido Retumbante", "bellow", { R: 115, knock: 12, dmg: 12 }], ["Chifrada Leiteira", "hornslam", { dmg: 22 }]]);
sp("burro", "Burro", "a09", "herd", 1, 135, 130, 50, [0, 2, 1, 1, 2, 2], [["Zurro Estrondoso", "bellow", { stun: .9 }], ["Coice Duplo", "kick", { dmg: 20, arc: 1.6 }]]);
sp("mula", "Mula", "a10", "herd", 1, 140, 130, 50, [1, 3, 0, 0, 2, 2], [["Coice de Mula", "kick", { dmg: 26, knock: 12 }], ["Teimosia", "hibernate", { dur: 1.4, cd: 7 }]]);
sp("gato_cinza", "Gato Cinzento", "a11", "feline", 1, 100, 160, 38, [3, 1, 3, 0, 1, 1], [["Garra Silenciosa", "scratch", { dmg: 14 }], ["Sete Vidas", "hide", { dur: 1.4 }]]);
sp("gato_laranja", "Gato Laranja", "a12", "feline", 1, 105, 158, 38, [2, 1, 2, 1, 2, 2], [["Soneca Perigosa", "hide", { dur: 1.5 }], ["Arranhão Dourado", "scratch", { dmg: 14, arc: 1.7 }]]);
sp("gato_branco", "Gato Branco", "a13", "feline", 1, 95, 165, 38, [3, 0, 3, 1, 0, 2], [["Neve Felina", "shadowclaw", { n: 3, spread: .3 }], ["Salto de Algodão", "pounce", { dist: 150 }]]);
sp("cao_dourado", "Cão Dourado", "a14", "canine", 1, 130, 145, 42, [2, 2, 0, 3, 2, 1], [["Bola Arremessada", "stonetoss", { name: "Bola Arremessada", dmg: 12 }], ["Lealdade", "pack", { n: 3 }]]);
sp("cao_malhado", "Cão Malhado", "a15", "canine", 1, 125, 150, 42, [3, 1, 1, 3, 1, 1], [["Pega-Pega", "charge", { dist: 190 }], ["Latido Agudo", "growl", { R: 90, stun: .6 }]]);
sp("rottweiler", "Rottweiler", "a16", "canine", 1, 150, 140, 44, [1, 3, 0, 1, 3, 0], [["Mordida de Ferro", "bite", { dmg: 22 }], ["Guarda Feroz", "growl", { R: 90, dmg: 14 }]]);
sp("lontra", "Lontra", "a29", "mustelid", 1, 100, 160, 38, [3, 1, 2, 2, 1, 2], [["Deslize Aquático", "slide", { dist: 170 }], ["Quebra-Concha", "stonetoss", { dmg: 14, pierce: 3 }]]);
sp("corvo", "Corvo", "a30", "bird", 1, 88, 170, 38, [2, 0, 3, 1, 1, 1], [["Olhar Sombrio", "screech", { stun: 1.1 }], ["Penas Negras", "razorwind", { n: 4, dmg: 7 }]]);
sp("gaivota", "Gaivota", "a42", "waterfowl", 1, 95, 175, 38, [3, 0, 2, 2, 1, 1], [["Roubo em Voo", "talon", { dmg: 15 }], ["Maré Alta", "tide", { n: 3, dmg: 11 }]]);
sp("cervo", "Cervo", "a22", "cervid", 1, 125, 160, 50, [3, 1, 1, 1, 1, 3], [["Salto da Floresta", "bound", { dist: 130 }], ["Galhada Real", "antlers", { dmg: 19 }]]);
// --- raros ---
sp("cavalo", "Cavalo", "a08", "herd", 2, 160, 175, 56, [3, 2, 0, 2, 2, 1], [["Galope Selvagem", "gallop", { dist: 240, dmg: 26 }], ["Relincho", "roar", { R: 105, stun: 1 }]]);
sp("raposa", "Raposa Vermelha", "a17", "canine", 2, 115, 175, 40, [3, 1, 3, 0, 1, 1], [["Cauda de Fogo", "tailwhip", { R: 75, dmg: 12 }], ["Truque da Raposa", "ambush", { n: 3, dmg: 20 }]]);
sp("javali", "Javali", "a21", "swine", 2, 170, 140, 50, [1, 3, 0, 0, 3, 0], [["Presas Afiadas", "tusk", { dmg: 24 }], ["Estouro da Manada", "gallop", { dist: 180, dmg: 28 }]]);
sp("falcao", "Falcão", "a31", "bird", 2, 105, 195, 42, [3, 1, 3, 0, 2, 0], [["Mergulho de Falcão", "dive", { dist: 240, dmg: 32 }], ["Visão Aguçada", "razorwind", { n: 5, spread: .5 }]]);
sp("coruja", "Coruja", "a43", "bird", 2, 100, 160, 42, [1, 1, 3, 0, 1, 3], [["Voo Silencioso", "dive", { dmg: 26 }], ["Piado Hipnótico", "screech", { R: 120, stun: 1.4 }]]);
// --- épicos ---
sp("lobo", "Lobo Cinzento", "a18", "canine", 3, 170, 175, 48, [3, 2, 2, 3, 2, 0], [["Uivo da Alcateia", "howl", { R: 135, slow: .65, dmg: 12 }], ["Caçada Noturna", "charge", { dist: 230, dmg: 30 }]]);
sp("alce", "Alce", "a23", "cervid", 3, 210, 150, 62, [1, 3, 0, 1, 3, 1], [["Chifres Colossais", "antlers", { R: 64, dmg: 24 }], ["Pisotear", "stomp", { R: 95, dmg: 20 }]]);
sp("urso_pardo", "Urso Pardo", "a19", "ursine", 3, 240, 140, 62, [0, 3, 1, 0, 3, 2], [["Patada do Pardo", "swipe", { dmg: 26 }], ["Pesca de Salmão", "salmon", { n: 4, dmg: 18 }]]);
sp("urso_polar", "Urso Polar", "a20", "ursine", 3, 250, 135, 64, [0, 3, 1, 0, 3, 3], [["Sopro Ártico", "howl", { R: 125, slow: .75, dmg: 12 }], ["Fúria do Gelo", "slam", { R: 100, dmg: 22 }]]);
sp("aguia", "Águia", "a32", "bird", 3, 150, 200, 54, [3, 2, 3, 0, 3, 1], [["Olhar da Águia", "thrust", { name: "Olhar da Águia", pierce: 6, dmg: 20 }], ["Garras de Águia", "dive", { dist: 250, dmg: 36 }]]);
// --- exóticos (ticket dourado) ---
sp("tigre", "Tigre", "x_tiger", "feline", 4, 220, 185, 62, [3, 3, 2, 0, 3, 0], [["Salto do Tigre", "pounce", { dist: 200, dmg: 34 }], ["Listras Mortais", "frenzy", { R: 50, dmg: 11 }]]);
sp("leao", "Leão", "x_lion", "feline", 4, 250, 165, 66, [1, 3, 1, 3, 3, 1], [["Rugido do Rei", "roar", { R: 140, stun: 1.6, dmg: 14 }], ["Juba Flamejante", "clawstorm", { n: 4, dmg: 10 }]]);
sp("onca", "Onça-pintada", "x_jaguar", "feline", 4, 210, 190, 60, [3, 3, 3, 0, 2, 0], [["Mordida de Onça", "fatalbite", { dmg: 38, R: 38 }], ["Manchas Sombrias", "shadowclaw", { n: 4, spread: .3, dmg: 12 }]]);
sp("pantera", "Pantera-negra", "x_panther", "feline", 4, 190, 205, 58, [3, 2, 3, 0, 2, 2], [["Sombra Noturna", "ambush", { n: 4, dmg: 24 }], ["Bote Silencioso", "pounce", { dist: 230, dmg: 30, cd: 1.8 }]]);
sp("leopardo_neves", "Leopardo-das-neves", "x_snow", "feline", 4, 195, 195, 58, [3, 2, 3, 0, 1, 3], [["Tempestade de Neve", "howl", { R: 130, slow: .7, dmg: 12 }], ["Garra de Gelo", "scratch", { dmg: 20, arc: 1.8 }]]);

// ---------- monta os 7+ golpes de cada animal ----------
for (const s of SPECIES) {
  const sigIds = [];
  s.sigs.forEach((sg, i) => {
    const [name, base, over] = sg;
    const id = "sp_" + s.id + "_" + i;
    const b = MV[base];
    MV[id] = Object.assign({}, b, over, { id, name: (over && over.name) || name, desc: "Golpe único: variação de " + b.name + "." , sig: true });
    sigIds.push(id);
  });
  const pool = CLASS[s.cls].pool.filter((m) => !sigIds.some((i) => MV[i].name === MV[m].name));
  s.moves = [...sigIds, ...pool].slice(0, 8);
  if (s.moves.length < 7) throw new Error("poucos golpes: " + s.id);
  // golpe inicial: o primeiro "de ataque" (não heal/shield)
  const first = s.moves.findIndex((m) => !["heal", "shield"].includes(MV[m].kind));
  if (first > 0) s.moves.unshift(s.moves.splice(first, 1)[0]);
}
const SPBY = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

// ---------- quiz ----------
const TRAITS = ["Agilidade", "Força", "Astúcia", "Sociabilidade", "Coragem", "Calma"];
const QUIZ = [
  { q: "Um barulho estranho vem da mata à noite. O que você faz?", a: [
    ["Saio correndo na hora", [3, 0, 0, 0, 0, 0]], ["Fico imóvel, só observando", [0, 0, 3, 0, 0, 1]],
    ["Vou investigar de frente", [0, 1, 0, 0, 3, 0]], ["Chamo meus amigos antes", [0, 0, 0, 3, 0, 1]]] },
  { q: "Qual é o seu lugar ideal para descansar?", a: [
    ["Uma toca escondida e quentinha", [0, 0, 2, 0, 0, 3]], ["No meio do campo aberto", [2, 0, 0, 0, 2, 0]],
    ["Perto da galera, em grupo", [0, 0, 0, 3, 0, 1]], ["Num ponto alto, vigiando tudo", [0, 1, 2, 0, 2, 0]]] },
  { q: "Alguém mais forte bloqueia o seu caminho. E agora?", a: [
    ["Desvio rápido e sigo em frente", [3, 0, 1, 0, 0, 0]], ["Encaro e não saio do lugar", [0, 2, 0, 0, 3, 0]],
    ["Dou um jeito esperto de passar", [0, 0, 3, 0, 0, 1]], ["Espero com paciência", [0, 0, 0, 1, 0, 3]]] },
  { q: "Qual é a sua maior qualidade?", a: [
    ["Velocidade", [3, 0, 0, 0, 1, 0]], ["Força bruta", [0, 3, 0, 0, 1, 0]],
    ["Esperteza", [0, 0, 3, 0, 0, 1]], ["Lealdade ao grupo", [0, 0, 0, 3, 0, 1]]] },
  { q: "Como você gosta de se alimentar?", a: [
    ["Petiscando o dia inteiro", [1, 0, 1, 0, 0, 2]], ["Um grande banquete de uma vez", [0, 3, 0, 0, 1, 0]],
    ["Caçando de surpresa", [0, 0, 2, 0, 2, 0]], ["Dividindo com todo mundo", [0, 0, 0, 3, 0, 1]]] },
  { q: "Qual é o ritmo ideal do seu dia?", a: [
    ["Correndo de um lado para o outro", [3, 0, 0, 1, 0, 0]], ["Tranquilo, sem pressa", [0, 0, 0, 1, 0, 3]],
    ["Planejando cada passo", [0, 0, 3, 0, 0, 1]], ["Em busca de aventura", [1, 1, 0, 0, 3, 0]]] },
];
