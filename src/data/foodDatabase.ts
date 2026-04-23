import { SearchFood } from '../types';

export interface FoodDBItem {
  id: string;
  name: string;
  nameAlt?: string;
  category: string;
  portion: { label: string; grams: number };
  per100g: { kcal: number; p: number; c: number; f: number };
}

export const FOOD_DB: FoodDBItem[] = [
  // ── TAHILLAR & EKMEK ──────────────────────────────────────────────────────
  { id: 'g1',  name: 'Makarna',              nameAlt: 'Pasta',             category: 'Tahıl',       portion: { label: '1 tabak pişmiş (200 g)', grams: 200 }, per100g: { kcal: 158, p: 5.8,  c: 30.9, f: 0.9  } },
  { id: 'g2',  name: 'Pirinç pilavı',        nameAlt: 'Rice',              category: 'Tahıl',       portion: { label: '1 porsiyon pişmiş (200 g)', grams: 200 }, per100g: { kcal: 130, p: 2.7,  c: 27.9, f: 0.3  } },
  { id: 'g3',  name: 'Bulgur pilavı',        nameAlt: 'Bulgur',            category: 'Tahıl',       portion: { label: '1 porsiyon pişmiş (200 g)', grams: 200 }, per100g: { kcal: 83,  p: 3.1,  c: 18.6, f: 0.2  } },
  { id: 'g4',  name: 'Yulaf ezmesi',         nameAlt: 'Oatmeal',           category: 'Tahıl',       portion: { label: '1 kase pişmiş (250 g)', grams: 250 }, per100g: { kcal: 71,  p: 2.5,  c: 12.0, f: 1.5  } },
  { id: 'g5',  name: 'Beyaz ekmek',          nameAlt: 'White bread',       category: 'Ekmek',       portion: { label: '1 dilim (30 g)', grams: 30  }, per100g: { kcal: 265, p: 9.0,  c: 49.0, f: 3.2  } },
  { id: 'g6',  name: 'Tam buğday ekmeği',    nameAlt: 'Whole wheat bread', category: 'Ekmek',       portion: { label: '1 dilim (30 g)', grams: 30  }, per100g: { kcal: 247, p: 10.7, c: 41.0, f: 3.3  } },
  { id: 'g7',  name: 'Simit',                                              category: 'Ekmek',       portion: { label: '1 adet (120 g)', grams: 120 }, per100g: { kcal: 252, p: 8.6,  c: 50.0, f: 2.2  } },
  { id: 'g8',  name: 'Pide (sade)',                                        category: 'Ekmek',       portion: { label: '1 küçük pide (150 g)', grams: 150 }, per100g: { kcal: 255, p: 8.5,  c: 45.0, f: 4.5  } },
  { id: 'g9',  name: 'Bazlama',                                            category: 'Ekmek',       portion: { label: '1 adet (60 g)', grams: 60  }, per100g: { kcal: 250, p: 8.0,  c: 47.0, f: 2.5  } },
  { id: 'g10', name: 'Yufka',                                              category: 'Ekmek',       portion: { label: '1 yaprak (40 g)', grams: 40  }, per100g: { kcal: 350, p: 9.5,  c: 72.0, f: 2.8  } },
  { id: 'g11', name: 'Kuskus',               nameAlt: 'Couscous',          category: 'Tahıl',       portion: { label: '1 porsiyon pişmiş (180 g)', grams: 180 }, per100g: { kcal: 112, p: 3.8,  c: 23.0, f: 0.2  } },
  { id: 'g12', name: 'Tam buğday unu',       nameAlt: 'Whole wheat flour', category: 'Tahıl',       portion: { label: '2 yemek kaşığı (30 g)', grams: 30  }, per100g: { kcal: 340, p: 13.7, c: 72.0, f: 1.9  } },

  // ── ET & KÜMES HAYVANLARI ─────────────────────────────────────────────────
  { id: 'm1',  name: 'Tavuk göğsü (ızgara)', nameAlt: 'Chicken breast',    category: 'Et & Tavuk',  portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 165, p: 31.0, c: 0,    f: 3.6  } },
  { id: 'm2',  name: 'Tavuk but (pişmiş)',   nameAlt: 'Chicken thigh',     category: 'Et & Tavuk',  portion: { label: '1 adet (120 g)', grams: 120 }, per100g: { kcal: 239, p: 22.0, c: 0,    f: 16.0 } },
  { id: 'm3',  name: 'Dana kıyma (yağsız)', nameAlt: 'Lean beef mince',   category: 'Et & Tavuk',  portion: { label: '100 g', grams: 100 }, per100g: { kcal: 218, p: 26.0, c: 0,    f: 12.0 } },
  { id: 'm4',  name: 'Dana biftek (ızgara)', nameAlt: 'Beef steak',        category: 'Et & Tavuk',  portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 271, p: 26.0, c: 0,    f: 18.0 } },
  { id: 'm5',  name: 'Kuzu pirzola',         nameAlt: 'Lamb chop',         category: 'Et & Tavuk',  portion: { label: '2 adet (100 g)', grams: 100 }, per100g: { kcal: 294, p: 25.0, c: 0,    f: 21.0 } },
  { id: 'm6',  name: 'Köfte (ızgara)',                                     category: 'Et & Tavuk',  portion: { label: '2 adet köfte (100 g)', grams: 100 }, per100g: { kcal: 240, p: 21.5, c: 5.0,  f: 15.0 } },
  { id: 'm7',  name: 'Sucuk',                                              category: 'Et & Tavuk',  portion: { label: '3-4 dilim (30 g)', grams: 30  }, per100g: { kcal: 450, p: 20.0, c: 3.0,  f: 40.0 } },
  { id: 'm8',  name: 'Hindi göğsü',          nameAlt: 'Turkey breast',     category: 'Et & Tavuk',  portion: { label: '100 g', grams: 100 }, per100g: { kcal: 157, p: 29.9, c: 0,    f: 3.6  } },
  { id: 'm9',  name: 'Tavuk şiş',                                          category: 'Et & Tavuk',  portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 167, p: 25.0, c: 1.5,  f: 6.0  } },
  { id: 'm10', name: 'Döner (tavuk)',                                       category: 'Et & Tavuk',  portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 175, p: 22.0, c: 3.0,  f: 8.5  } },
  { id: 'm11', name: 'Döner (et)',                                          category: 'Et & Tavuk',  portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 220, p: 19.0, c: 3.0,  f: 14.0 } },
  { id: 'm12', name: 'Pastırma',                                           category: 'Et & Tavuk',  portion: { label: '2-3 dilim (30 g)', grams: 30  }, per100g: { kcal: 210, p: 32.0, c: 0,    f: 9.0  } },

  // ── BALIK & DENİZ ÜRÜNLERİ ───────────────────────────────────────────────
  { id: 'f1',  name: 'Somon (ızgara)',            nameAlt: 'Salmon',        category: 'Balık',       portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 208, p: 20.0, c: 0,    f: 13.0 } },
  { id: 'f2',  name: 'Ton balığı (suda, konserve)', nameAlt: 'Canned tuna', category: 'Balık',       portion: { label: '1 kutu (85 g)', grams: 85  }, per100g: { kcal: 116, p: 26.0, c: 0,    f: 0.7  } },
  { id: 'f3',  name: 'Levrek (ızgara)',           nameAlt: 'Sea bass',      category: 'Balık',       portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 124, p: 24.0, c: 0,    f: 2.8  } },
  { id: 'f4',  name: 'Çipura (ızgara)',           nameAlt: 'Sea bream',     category: 'Balık',       portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 128, p: 25.0, c: 0,    f: 2.9  } },
  { id: 'f5',  name: 'Hamsi (tava)',                                        category: 'Balık',       portion: { label: '100 g', grams: 100 }, per100g: { kcal: 131, p: 20.3, c: 0,    f: 5.8  } },
  { id: 'f6',  name: 'Karides (pişmiş)',          nameAlt: 'Shrimp',        category: 'Balık',       portion: { label: '100 g', grams: 100 }, per100g: { kcal: 99,  p: 21.0, c: 0,    f: 1.1  } },
  { id: 'f7',  name: 'Midye (buğulama)',          nameAlt: 'Mussels',       category: 'Balık',       portion: { label: '100 g', grams: 100 }, per100g: { kcal: 86,  p: 12.0, c: 3.7,  f: 2.2  } },
  { id: 'f8',  name: 'Palamut (ızgara)',                                    category: 'Balık',       portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 160, p: 23.5, c: 0,    f: 7.5  } },
  { id: 'f9',  name: 'Sardalye (konserve)',       nameAlt: 'Sardines',      category: 'Balık',       portion: { label: '1 kutu (80 g)', grams: 80  }, per100g: { kcal: 208, p: 24.6, c: 0,    f: 11.5 } },
  { id: 'f10', name: 'Alabalık (pişmiş)',         nameAlt: 'Trout',         category: 'Balık',       portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 190, p: 26.6, c: 0,    f: 8.5  } },

  // ── SÜT ÜRÜNLERİ & YUMURTA ───────────────────────────────────────────────
  { id: 'd1',  name: 'Süt (tam yağlı)',       nameAlt: 'Whole milk',        category: 'Süt & Yumurta', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 61,  p: 3.2,  c: 4.8,  f: 3.3  } },
  { id: 'd2',  name: 'Süt (yağsız)',          nameAlt: 'Skim milk',         category: 'Süt & Yumurta', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 34,  p: 3.4,  c: 5.0,  f: 0.1  } },
  { id: 'd3',  name: 'Yoğurt (tam yağlı)',    nameAlt: 'Whole milk yogurt', category: 'Süt & Yumurta', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 61,  p: 3.5,  c: 4.7,  f: 3.3  } },
  { id: 'd4',  name: 'Süzme yoğurt',          nameAlt: 'Strained yogurt',   category: 'Süt & Yumurta', portion: { label: '1 kase (150 g)', grams: 150 }, per100g: { kcal: 97,  p: 10.0, c: 4.0,  f: 4.0  } },
  { id: 'd5',  name: 'Beyaz peynir',          nameAlt: 'Feta cheese',       category: 'Süt & Yumurta', portion: { label: '1 porsiyon (50 g)', grams: 50  }, per100g: { kcal: 250, p: 16.0, c: 1.7,  f: 20.0 } },
  { id: 'd6',  name: 'Kaşar peyniri',         nameAlt: 'Kashar cheese',     category: 'Süt & Yumurta', portion: { label: '2-3 dilim (30 g)', grams: 30  }, per100g: { kcal: 338, p: 23.0, c: 1.7,  f: 27.0 } },
  { id: 'd7',  name: 'Lor peyniri',           nameAlt: 'Cottage cheese',    category: 'Süt & Yumurta', portion: { label: '100 g', grams: 100 }, per100g: { kcal: 98,  p: 11.0, c: 3.3,  f: 4.3  } },
  { id: 'd8',  name: 'Yumurta (bütün)',       nameAlt: 'Whole egg',         category: 'Süt & Yumurta', portion: { label: '1 büyük yumurta (60 g)', grams: 60  }, per100g: { kcal: 155, p: 12.6, c: 1.1,  f: 10.6 } },
  { id: 'd9',  name: 'Yumurta akı',           nameAlt: 'Egg white',         category: 'Süt & Yumurta', portion: { label: '1 büyük (33 g)', grams: 33  }, per100g: { kcal: 52,  p: 10.9, c: 0.7,  f: 0.2  } },
  { id: 'd10', name: 'Tereyağı',              nameAlt: 'Butter',            category: 'Yağ',           portion: { label: '1 çay kaşığı (10 g)', grams: 10  }, per100g: { kcal: 717, p: 0.9,  c: 0.1,  f: 81.1 } },
  { id: 'd11', name: 'Ayran',                                               category: 'Süt & Yumurta', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 31,  p: 2.0,  c: 2.5,  f: 1.3  } },
  { id: 'd12', name: 'Kefir',                                               category: 'Süt & Yumurta', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 52,  p: 3.5,  c: 6.5,  f: 1.0  } },
  { id: 'd13', name: 'Yoğurt (az yağlı)',     nameAlt: 'Low fat yogurt',    category: 'Süt & Yumurta', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 56,  p: 5.7,  c: 6.8,  f: 0.9  } },

  // ── SEBZELER ─────────────────────────────────────────────────────────────
  { id: 'v1',  name: 'Domates',          nameAlt: 'Tomato',        category: 'Sebze', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 18,  p: 0.9, c: 3.9,  f: 0.2 } },
  { id: 'v2',  name: 'Salatalık',        nameAlt: 'Cucumber',      category: 'Sebze', portion: { label: '½ orta boy (100 g)', grams: 100 }, per100g: { kcal: 15,  p: 0.6, c: 3.6,  f: 0.1 } },
  { id: 'v3',  name: 'Yeşil biber',      nameAlt: 'Green pepper',  category: 'Sebze', portion: { label: '1 orta boy (80 g)', grams: 80  }, per100g: { kcal: 31,  p: 1.3, c: 6.0,  f: 0.3 } },
  { id: 'v4',  name: 'Soğan',            nameAlt: 'Onion',         category: 'Sebze', portion: { label: '1 orta boy (100 g)', grams: 100 }, per100g: { kcal: 40,  p: 1.1, c: 9.3,  f: 0.1 } },
  { id: 'v5',  name: 'Ispanak',          nameAlt: 'Spinach',       category: 'Sebze', portion: { label: '1 kase (100 g)', grams: 100 }, per100g: { kcal: 23,  p: 2.9, c: 3.6,  f: 0.4 } },
  { id: 'v6',  name: 'Brokoli',          nameAlt: 'Broccoli',      category: 'Sebze', portion: { label: '1 porsiyon (100 g)', grams: 100 }, per100g: { kcal: 34,  p: 2.8, c: 7.0,  f: 0.4 } },
  { id: 'v7',  name: 'Havuç',            nameAlt: 'Carrot',        category: 'Sebze', portion: { label: '1 orta boy (80 g)', grams: 80  }, per100g: { kcal: 41,  p: 0.9, c: 10.0, f: 0.2 } },
  { id: 'v8',  name: 'Patates (haşlanmış)', nameAlt: 'Boiled potato', category: 'Sebze', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 87,  p: 1.9, c: 20.1, f: 0.1 } },
  { id: 'v9',  name: 'Tatlı patates',    nameAlt: 'Sweet potato',  category: 'Sebze', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 90,  p: 2.0, c: 20.7, f: 0.1 } },
  { id: 'v10', name: 'Kabak',            nameAlt: 'Zucchini',      category: 'Sebze', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 17,  p: 1.2, c: 3.1,  f: 0.3 } },
  { id: 'v11', name: 'Patlıcan',         nameAlt: 'Eggplant',      category: 'Sebze', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 25,  p: 1.0, c: 6.0,  f: 0.2 } },
  { id: 'v12', name: 'Mantar',           nameAlt: 'Mushroom',      category: 'Sebze', portion: { label: '5-6 adet (100 g)', grams: 100 }, per100g: { kcal: 22,  p: 3.1, c: 3.3,  f: 0.3 } },
  { id: 'v13', name: 'Mısır',            nameAlt: 'Corn',          category: 'Sebze', portion: { label: '½ koçan (80 g)', grams: 80  }, per100g: { kcal: 86,  p: 3.2, c: 19.0, f: 1.2 } },
  { id: 'v14', name: 'Avokado',          nameAlt: 'Avocado',       category: 'Sebze', portion: { label: '½ orta boy (100 g)', grams: 100 }, per100g: { kcal: 160, p: 2.0, c: 8.5,  f: 14.7} },
  { id: 'v15', name: 'Marul',            nameAlt: 'Lettuce',       category: 'Sebze', portion: { label: '1 kase (80 g)', grams: 80  }, per100g: { kcal: 15,  p: 1.4, c: 2.9,  f: 0.2 } },
  { id: 'v16', name: 'Bezelye',          nameAlt: 'Peas',          category: 'Sebze', portion: { label: '½ kase (80 g)', grams: 80  }, per100g: { kcal: 81,  p: 5.4, c: 14.5, f: 0.4 } },
  { id: 'v17', name: 'Lahana',           nameAlt: 'Cabbage',       category: 'Sebze', portion: { label: '1 porsiyon (100 g)', grams: 100 }, per100g: { kcal: 25,  p: 1.3, c: 6.0,  f: 0.1 } },
  { id: 'v18', name: 'Sarımsak',         nameAlt: 'Garlic',        category: 'Sebze', portion: { label: '2-3 diş (10 g)', grams: 10  }, per100g: { kcal: 149, p: 6.4, c: 33.1, f: 0.5 } },

  // ── MEYVELER ─────────────────────────────────────────────────────────────
  { id: 'fr1',  name: 'Elma',       nameAlt: 'Apple',        category: 'Meyve', portion: { label: '1 orta boy (180 g)', grams: 180 }, per100g: { kcal: 52, p: 0.3, c: 13.8, f: 0.2 } },
  { id: 'fr2',  name: 'Muz',        nameAlt: 'Banana',       category: 'Meyve', portion: { label: '1 orta boy (120 g)', grams: 120 }, per100g: { kcal: 89, p: 1.1, c: 22.8, f: 0.3 } },
  { id: 'fr3',  name: 'Portakal',   nameAlt: 'Orange',       category: 'Meyve', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 47, p: 0.9, c: 11.8, f: 0.1 } },
  { id: 'fr4',  name: 'Çilek',      nameAlt: 'Strawberry',   category: 'Meyve', portion: { label: '1 kase (150 g)', grams: 150 }, per100g: { kcal: 32, p: 0.7, c: 7.7,  f: 0.3 } },
  { id: 'fr5',  name: 'Üzüm',       nameAlt: 'Grapes',       category: 'Meyve', portion: { label: '1 salkım (150 g)', grams: 150 }, per100g: { kcal: 69, p: 0.7, c: 18.1, f: 0.2 } },
  { id: 'fr6',  name: 'Kiraz',      nameAlt: 'Cherry',       category: 'Meyve', portion: { label: '10-12 adet (100 g)', grams: 100 }, per100g: { kcal: 63, p: 1.1, c: 16.0, f: 0.2 } },
  { id: 'fr7',  name: 'Karpuz',     nameAlt: 'Watermelon',   category: 'Meyve', portion: { label: '2 dilim (300 g)', grams: 300 }, per100g: { kcal: 30, p: 0.6, c: 7.6,  f: 0.2 } },
  { id: 'fr8',  name: 'Kavun',      nameAlt: 'Melon',        category: 'Meyve', portion: { label: '1 dilim (200 g)', grams: 200 }, per100g: { kcal: 34, p: 0.8, c: 8.2,  f: 0.2 } },
  { id: 'fr9',  name: 'Armut',      nameAlt: 'Pear',         category: 'Meyve', portion: { label: '1 orta boy (166 g)', grams: 166 }, per100g: { kcal: 57, p: 0.4, c: 15.2, f: 0.1 } },
  { id: 'fr10', name: 'Şeftali',    nameAlt: 'Peach',        category: 'Meyve', portion: { label: '1 orta boy (150 g)', grams: 150 }, per100g: { kcal: 39, p: 0.9, c: 9.5,  f: 0.3 } },
  { id: 'fr11', name: 'İncir (taze)', nameAlt: 'Fresh fig',  category: 'Meyve', portion: { label: '1 adet (50 g)', grams: 50  }, per100g: { kcal: 74, p: 0.8, c: 19.2, f: 0.3 } },
  { id: 'fr12', name: 'Nar',        nameAlt: 'Pomegranate',  category: 'Meyve', portion: { label: '½ orta boy (120 g)', grams: 120 }, per100g: { kcal: 83, p: 1.7, c: 18.7, f: 1.2 } },
  { id: 'fr13', name: 'Kivi',       nameAlt: 'Kiwi',         category: 'Meyve', portion: { label: '1 orta boy (80 g)', grams: 80  }, per100g: { kcal: 61, p: 1.1, c: 14.7, f: 0.5 } },
  { id: 'fr14', name: 'Mandalina',  nameAlt: 'Mandarin',     category: 'Meyve', portion: { label: '1 orta boy (80 g)', grams: 80  }, per100g: { kcal: 53, p: 0.8, c: 13.3, f: 0.3 } },
  { id: 'fr15', name: 'Kayısı',     nameAlt: 'Apricot',      category: 'Meyve', portion: { label: '2 adet (80 g)', grams: 80  }, per100g: { kcal: 48, p: 1.4, c: 11.1, f: 0.4 } },
  { id: 'fr16', name: 'Erik',       nameAlt: 'Plum',         category: 'Meyve', portion: { label: '2 adet (80 g)', grams: 80  }, per100g: { kcal: 46, p: 0.7, c: 11.4, f: 0.3 } },

  // ── BAKLAGİLLER ──────────────────────────────────────────────────────────
  { id: 'l1', name: 'Mercimek (pişmiş)',       nameAlt: 'Lentils',          category: 'Baklagil', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 116, p: 9.0, c: 20.1, f: 0.4 } },
  { id: 'l2', name: 'Nohut (pişmiş)',          nameAlt: 'Chickpeas',        category: 'Baklagil', portion: { label: '1 kase (150 g)', grams: 150 }, per100g: { kcal: 164, p: 8.9, c: 27.4, f: 2.6 } },
  { id: 'l3', name: 'Kuru fasulye (pişmiş)',   nameAlt: 'White beans',      category: 'Baklagil', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 127, p: 8.7, c: 22.8, f: 0.5 } },
  { id: 'l4', name: 'Barbunya (pişmiş)',        nameAlt: 'Borlotti beans',   category: 'Baklagil', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 127, p: 8.7, c: 22.8, f: 0.5 } },
  { id: 'l5', name: 'Siyah fasulye (pişmiş)',  nameAlt: 'Black beans',      category: 'Baklagil', portion: { label: '1 kase (150 g)', grams: 150 }, per100g: { kcal: 132, p: 8.9, c: 23.7, f: 0.5 } },
  { id: 'l6', name: 'Tofu',                                                  category: 'Baklagil', portion: { label: '100 g', grams: 100 }, per100g: { kcal: 76,  p: 8.1, c: 1.9,  f: 4.2 } },
  { id: 'l7', name: 'Hummus',                                                category: 'Baklagil', portion: { label: '4 yemek kaşığı (80 g)', grams: 80  }, per100g: { kcal: 166, p: 7.9, c: 14.3, f: 9.6 } },
  { id: 'l8', name: 'Börülce (pişmiş)',         nameAlt: 'Black-eyed peas', category: 'Baklagil', portion: { label: '1 kase (200 g)', grams: 200 }, per100g: { kcal: 116, p: 7.7, c: 20.8, f: 0.4 } },

  // ── KURUYEMIŞLER & TOHUMLAR ───────────────────────────────────────────────
  { id: 'n1',  name: 'Badem',            nameAlt: 'Almonds',         category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 579, p: 21.2, c: 21.6, f: 49.9 } },
  { id: 'n2',  name: 'Ceviz',            nameAlt: 'Walnuts',         category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 654, p: 15.2, c: 13.7, f: 65.2 } },
  { id: 'n3',  name: 'Fındık',           nameAlt: 'Hazelnuts',       category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 628, p: 14.9, c: 16.7, f: 60.8 } },
  { id: 'n4',  name: 'Antep fıstığı',    nameAlt: 'Pistachios',      category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 560, p: 20.2, c: 27.5, f: 45.3 } },
  { id: 'n5',  name: 'Kaju',             nameAlt: 'Cashews',         category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 553, p: 18.2, c: 30.2, f: 43.9 } },
  { id: 'n6',  name: 'Yer fıstığı',      nameAlt: 'Peanuts',         category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 567, p: 25.8, c: 16.1, f: 49.2 } },
  { id: 'n7',  name: 'Tahin',                                         category: 'Kuruyemiş', portion: { label: '1 yemek kaşığı (15 g)', grams: 15 }, per100g: { kcal: 595, p: 17.0, c: 21.2, f: 53.8 } },
  { id: 'n8',  name: 'Chia tohumu',      nameAlt: 'Chia seeds',      category: 'Kuruyemiş', portion: { label: '2 yemek kaşığı (20 g)', grams: 20 }, per100g: { kcal: 486, p: 16.5, c: 42.1, f: 30.7 } },
  { id: 'n9',  name: 'Kabak çekirdeği',  nameAlt: 'Pumpkin seeds',   category: 'Kuruyemiş', portion: { label: 'Bir avuç (30 g)', grams: 30 }, per100g: { kcal: 559, p: 30.2, c: 10.7, f: 49.1 } },
  { id: 'n10', name: 'Susam',            nameAlt: 'Sesame seeds',    category: 'Kuruyemiş', portion: { label: '1 yemek kaşığı (10 g)', grams: 10 }, per100g: { kcal: 573, p: 17.7, c: 23.5, f: 49.7 } },

  // ── YAĞLAR & TATLANDIRICILLAR ──────────────────────────────────────────────
  { id: 'oi1', name: 'Zeytinyağı',     nameAlt: 'Olive oil',        category: 'Yağ', portion: { label: '1 yemek kaşığı (10 ml)', grams: 10 }, per100g: { kcal: 884, p: 0,    c: 0,    f: 100.0 } },
  { id: 'oi2', name: 'Ayçiçek yağı',  nameAlt: 'Sunflower oil',    category: 'Yağ', portion: { label: '1 yemek kaşığı (10 ml)', grams: 10 }, per100g: { kcal: 884, p: 0,    c: 0,    f: 100.0 } },
  { id: 'oi3', name: 'Bal',           nameAlt: 'Honey',            category: 'Yağ', portion: { label: '1 yemek kaşığı (20 g)', grams: 20 }, per100g: { kcal: 304, p: 0.3,  c: 82.4, f: 0     } },
  { id: 'oi4', name: 'Pekmez',                                     category: 'Yağ', portion: { label: '1 yemek kaşığı (20 g)', grams: 20 }, per100g: { kcal: 281, p: 1.0,  c: 70.0, f: 0.1   } },
  { id: 'oi5', name: 'Fıstık ezmesi', nameAlt: 'Peanut butter',    category: 'Yağ', portion: { label: '1 yemek kaşığı (15 g)', grams: 15 }, per100g: { kcal: 588, p: 25.1, c: 20.1, f: 50.4  } },
  { id: 'oi6', name: 'Badem ezmesi',  nameAlt: 'Almond butter',    category: 'Yağ', portion: { label: '1 yemek kaşığı (15 g)', grams: 15 }, per100g: { kcal: 614, p: 21.4, c: 19.0, f: 55.5  } },
  { id: 'oi7', name: 'Ketçap',        nameAlt: 'Ketchup',          category: 'Yağ', portion: { label: '1 yemek kaşığı (20 g)', grams: 20 }, per100g: { kcal: 112, p: 1.5,  c: 27.2, f: 0.2   } },
  { id: 'oi8', name: 'Mayonez',       nameAlt: 'Mayonnaise',       category: 'Yağ', portion: { label: '1 yemek kaşığı (15 g)', grams: 15 }, per100g: { kcal: 680, p: 1.3,  c: 5.1,  f: 74.8  } },

  // ── TÜRK MUTFAĞI ─────────────────────────────────────────────────────────
  { id: 'tk1',  name: 'Mercimek çorbası',       category: 'Türk Mutfağı', portion: { label: '1 kase (250 ml)', grams: 250 }, per100g: { kcal: 52,  p: 3.2,  c: 8.0,  f: 0.8  } },
  { id: 'tk2',  name: 'Ezogelin çorbası',       category: 'Türk Mutfağı', portion: { label: '1 kase (250 ml)', grams: 250 }, per100g: { kcal: 55,  p: 3.0,  c: 9.5,  f: 0.5  } },
  { id: 'tk3',  name: 'Tavuk suyu çorbası',     category: 'Türk Mutfağı', portion: { label: '1 kase (250 ml)', grams: 250 }, per100g: { kcal: 37,  p: 3.5,  c: 3.5,  f: 0.7  } },
  { id: 'tk4',  name: 'Yayla çorbası',          category: 'Türk Mutfağı', portion: { label: '1 kase (250 ml)', grams: 250 }, per100g: { kcal: 48,  p: 2.5,  c: 6.5,  f: 1.2  } },
  { id: 'tk5',  name: 'İmam bayıldı',           category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 105, p: 1.8,  c: 8.0,  f: 7.5  } },
  { id: 'tk6',  name: 'Karnıyarık',             category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 148, p: 8.0,  c: 9.5,  f: 9.5  } },
  { id: 'tk7',  name: 'Zeytinyağlı fasulye',    category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 95,  p: 3.5,  c: 12.0, f: 4.0  } },
  { id: 'tk8',  name: 'Zeytinyağlı dolma',      category: 'Türk Mutfağı', portion: { label: '4-5 adet (100 g)', grams: 100 }, per100g: { kcal: 160, p: 2.5,  c: 21.0, f: 7.0  } },
  { id: 'tk9',  name: 'Menemen',                category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 120, p: 7.5,  c: 7.0,  f: 7.5  } },
  { id: 'tk10', name: 'Börek (peynirli)',        category: 'Türk Mutfağı', portion: { label: '1 dilim (100 g)', grams: 100 }, per100g: { kcal: 340, p: 12.0, c: 28.0, f: 20.0 } },
  { id: 'tk11', name: 'Lahmacun',               category: 'Türk Mutfağı', portion: { label: '1 adet (120 g)', grams: 120 }, per100g: { kcal: 230, p: 11.0, c: 28.0, f: 8.5  } },
  { id: 'tk12', name: 'Şiş kebap (tavuk)',       category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 167, p: 25.0, c: 2.0,  f: 6.5  } },
  { id: 'tk13', name: 'Adana kebap',             category: 'Türk Mutfağı', portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 260, p: 20.0, c: 5.0,  f: 18.0 } },
  { id: 'tk14', name: 'Pide (kaşarlı)',          category: 'Türk Mutfağı', portion: { label: '1 küçük pide (200 g)', grams: 200 }, per100g: { kcal: 270, p: 12.0, c: 32.0, f: 10.0 } },
  { id: 'tk15', name: 'Baklava',                 category: 'Türk Mutfağı', portion: { label: '1 dilim (60 g)', grams: 60  }, per100g: { kcal: 472, p: 6.0,  c: 46.0, f: 29.0 } },
  { id: 'tk16', name: 'Sütlaç',                  category: 'Türk Mutfağı', portion: { label: '1 kase (150 g)', grams: 150 }, per100g: { kcal: 118, p: 3.5,  c: 21.5, f: 2.5  } },
  { id: 'tk17', name: 'Helva (tahin)',            category: 'Türk Mutfağı', portion: { label: '1 dilim (50 g)', grams: 50  }, per100g: { kcal: 516, p: 11.0, c: 50.0, f: 30.0 } },
  { id: 'tk18', name: 'Lokum',                   category: 'Türk Mutfağı', portion: { label: '3 adet (30 g)', grams: 30  }, per100g: { kcal: 322, p: 0.2,  c: 81.0, f: 0.6  } },
  { id: 'tk19', name: 'Çoban salatası',           category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 45,  p: 1.2,  c: 5.5,  f: 2.2  } },
  { id: 'tk20', name: 'Gözleme (peynirli)',       category: 'Türk Mutfağı', portion: { label: '1 adet (150 g)', grams: 150 }, per100g: { kcal: 230, p: 9.0,  c: 28.0, f: 9.0  } },
  { id: 'tk21', name: 'Zeytinyağlı enginar',      category: 'Türk Mutfağı', portion: { label: '1 porsiyon (200 g)', grams: 200 }, per100g: { kcal: 65,  p: 2.0,  c: 8.0,  f: 3.0  } },
  { id: 'tk22', name: 'Tarhana çorbası',          category: 'Türk Mutfağı', portion: { label: '1 kase (250 ml)', grams: 250 }, per100g: { kcal: 44,  p: 2.0,  c: 7.5,  f: 0.8  } },
  { id: 'tk23', name: 'Kısır',                    category: 'Türk Mutfağı', portion: { label: '1 porsiyon (150 g)', grams: 150 }, per100g: { kcal: 130, p: 3.5,  c: 22.0, f: 3.5  } },

  // ── ATIŞTIRMALIKLAR & TATLILAR ────────────────────────────────────────────
  { id: 'sn1', name: 'Sütlü çikolata',    nameAlt: 'Milk chocolate',   category: 'Atıştırmalık', portion: { label: '1 kare (30 g)', grams: 30  }, per100g: { kcal: 535, p: 7.7,  c: 59.4, f: 29.7 } },
  { id: 'sn2', name: 'Bitter çikolata',   nameAlt: 'Dark chocolate',   category: 'Atıştırmalık', portion: { label: '1 kare (30 g)', grams: 30  }, per100g: { kcal: 546, p: 4.9,  c: 59.4, f: 31.3 } },
  { id: 'sn3', name: 'Cips (patates)',    nameAlt: 'Potato chips',     category: 'Atıştırmalık', portion: { label: 'Küçük paket (30 g)', grams: 30  }, per100g: { kcal: 536, p: 7.0,  c: 53.0, f: 34.0 } },
  { id: 'sn4', name: 'Granola',           nameAlt: 'Granola',          category: 'Atıştırmalık', portion: { label: '½ kase (60 g)', grams: 60  }, per100g: { kcal: 450, p: 10.0, c: 64.0, f: 16.0 } },
  { id: 'sn5', name: 'Kraker',            nameAlt: 'Crackers',         category: 'Atıştırmalık', portion: { label: '4-5 adet (30 g)', grams: 30  }, per100g: { kcal: 422, p: 9.0,  c: 69.0, f: 13.0 } },
  { id: 'sn6', name: 'Protein bar',       nameAlt: 'Protein bar',      category: 'Atıştırmalık', portion: { label: '1 bar (60 g)', grams: 60  }, per100g: { kcal: 350, p: 25.0, c: 35.0, f: 10.0 } },
  { id: 'sn7', name: 'Dondurma (vanilya)', nameAlt: 'Vanilla ice cream', category: 'Atıştırmalık', portion: { label: '2 top (100 g)', grams: 100 }, per100g: { kcal: 207, p: 3.5,  c: 23.6, f: 11.0 } },
  { id: 'sn8', name: 'Kek (çikolatalı)', nameAlt: 'Chocolate cake',   category: 'Atıştırmalık', portion: { label: '1 dilim (60 g)', grams: 60  }, per100g: { kcal: 371, p: 5.0,  c: 53.0, f: 16.0 } },
  { id: 'sn9', name: 'Popcorn (yağsız)', nameAlt: 'Popcorn',          category: 'Atıştırmalık', portion: { label: '1 kase (30 g)', grams: 30  }, per100g: { kcal: 387, p: 12.0, c: 77.9, f: 4.5  } },

  // ── İÇECEKLER ────────────────────────────────────────────────────────────
  { id: 'bv1', name: 'Çay (şekersiz)',          nameAlt: 'Black tea',               category: 'İçecek', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 1,  p: 0,   c: 0.2,  f: 0   } },
  { id: 'bv2', name: 'Türk kahvesi (sade)',      nameAlt: 'Turkish coffee',          category: 'İçecek', portion: { label: '1 fincan (60 ml)', grams: 60  }, per100g: { kcal: 8,  p: 0.3, c: 1.4,  f: 0.2 } },
  { id: 'bv3', name: 'Filtre kahve (sade)',      nameAlt: 'Filter coffee',           category: 'İçecek', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 4,  p: 0.6, c: 0.5,  f: 0   } },
  { id: 'bv4', name: 'Portakal suyu (taze)',     nameAlt: 'Fresh orange juice',      category: 'İçecek', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 45, p: 0.7, c: 10.4, f: 0.2 } },
  { id: 'bv5', name: 'Elma suyu',               nameAlt: 'Apple juice',             category: 'İçecek', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 46, p: 0.1, c: 11.4, f: 0.1 } },
  { id: 'bv6', name: 'Smoothie (muz-süt)',       nameAlt: 'Banana smoothie',         category: 'İçecek', portion: { label: '1 bardak (250 ml)', grams: 250 }, per100g: { kcal: 75, p: 3.3, c: 13.5, f: 1.3 } },
  { id: 'bv7', name: 'Kola',                    nameAlt: 'Cola',                    category: 'İçecek', portion: { label: '1 kutu (330 ml)', grams: 330 }, per100g: { kcal: 42, p: 0,   c: 10.6, f: 0   } },
  { id: 'bv8', name: 'Nar suyu (taze)',          nameAlt: 'Fresh pomegranate juice', category: 'İçecek', portion: { label: '1 bardak (200 ml)', grams: 200 }, per100g: { kcal: 54, p: 0.2, c: 13.4, f: 0.3 } },

  // ── PROTEİN & FITNESS ────────────────────────────────────────────────────
  { id: 'pt1', name: 'Whey protein tozu',  nameAlt: 'Whey protein powder', category: 'Fitness', portion: { label: '1 ölçek (30 g)', grams: 30 }, per100g: { kcal: 400, p: 75.0, c: 8.0,  f: 5.0  } },
  { id: 'pt2', name: 'Protein bar (yüksek)', nameAlt: 'High protein bar',  category: 'Fitness', portion: { label: '1 bar (60 g)', grams: 60 }, per100g: { kcal: 380, p: 33.0, c: 30.0, f: 12.0 } },
  { id: 'pt3', name: 'Yulaf proteini',     nameAlt: 'Oat protein',         category: 'Fitness', portion: { label: '1 ölçek (30 g)', grams: 30 }, per100g: { kcal: 380, p: 65.0, c: 15.0, f: 8.0  } },
];

export function toSearchFood(item: FoodDBItem): SearchFood {
  const r = item.portion.grams / 100;
  return {
    name: item.name,
    qty: item.portion.label,
    kcal: Math.round(item.per100g.kcal * r),
    p: Math.round(item.per100g.p * r * 10) / 10,
    c: Math.round(item.per100g.c * r * 10) / 10,
    f: Math.round(item.per100g.f * r * 10) / 10,
    cat: item.category,
  };
}

export function searchFoodDB(query: string, limit = 40): SearchFood[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_DB.slice(0, limit).map(toSearchFood);
  return FOOD_DB
    .filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.nameAlt?.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map(toSearchFood);
}

export function getAllFoodsAsSearchFood(): SearchFood[] {
  return FOOD_DB.map(toSearchFood);
}
