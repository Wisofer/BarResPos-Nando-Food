// ============================================================================
// DATOS Y MOTOR MATEMÁTICO EXACTO — COSTOS Y PRODUCTOS NANDO V3 (.xlsm)
// Extraído 1:1 de las 47 hojas de COSTOS Y PRODUCTOS NANDO V3.xlsm
// ============================================================================

export const INITIAL_CATEGORIES = [
  {
    "id": "cat-hamburguesas",
    "name": "Hamburguesas",
    "description": "Hamburguesas clásicas y especiales de la casa",
    "type": "food",
    "recipeIds": [
      "H. RES",
      "H. POLLO",
      "H. NANDO"
    ]
  },
  {
    "id": "cat-alitas",
    "name": "Alitas",
    "description": "Órdenes de alitas empanizadas y bañadas en salsa",
    "type": "food",
    "recipeIds": [
      "ALAS P"
    ]
  },
  {
    "id": "cat-nachos",
    "name": "Nachos",
    "description": "Nachos especiales con carne de res o pollo",
    "type": "food",
    "recipeIds": [
      "NACHO P, R"
    ]
  },
  {
    "id": "cat-tacos",
    "name": "Tacos",
    "description": "Tacos al pastor y tacos de birria con consomé",
    "type": "food",
    "recipeIds": [
      "TACO PASTOR",
      "TACO BIRRIA"
    ]
  },
  {
    "id": "cat-quesadillas",
    "name": "Quesadillas",
    "description": "Quesabirrias, quesadillas de pollo y de queso",
    "type": "food",
    "recipeIds": [
      "QUESABIRRIAS",
      "QUESADILLAS POLLO",
      "QUESADILLA DE QUESO"
    ]
  },
  {
    "id": "cat-salchipapa",
    "name": "Salchipapas",
    "description": "Salchipapas con pollo, papas y queso",
    "type": "food",
    "recipeIds": [
      "SALCHIPAPA"
    ]
  },
  {
    "id": "cat-deditos",
    "name": "Deditos de Pollo",
    "description": "Deditos de pollo empanizados en panko con papas",
    "type": "food",
    "recipeIds": [
      "DEDITOS"
    ]
  },
  {
    "id": "cat-subway",
    "name": "Subway & Sándwiches",
    "description": "Subs artesanales de pollo y res",
    "type": "food",
    "recipeIds": [
      "SUB POLLO",
      "SUB RES"
    ]
  },
  {
    "id": "cat-burrito",
    "name": "Burritos",
    "description": "Burritos mixtos con frijoles, queso y aderezo",
    "type": "food",
    "recipeIds": [
      "BURRITO"
    ]
  },
  {
    "id": "cat-palomitas",
    "name": "Palomitas de Pollo",
    "description": "Palomitas de pollo crujientes con papas",
    "type": "food",
    "recipeIds": [
      "PALOMITAS"
    ]
  },
  {
    "id": "cat-snacks",
    "name": "Snacks",
    "description": "Tostones rellenos y nuevas especialidades de snacks",
    "type": "extra",
    "recipeIds": [
      "SNACK 1",
      "SNACK 2",
      "SNACK 3",
      "SNACK 4",
      "SNACK 5",
      "SNACK 6",
      "SNACK 7",
      "SNACK 8"
    ]
  },
  {
    "id": "cat-batidos",
    "name": "Batidos & Frappés",
    "description": "Batidos naturales de fruta, Oreo y Frappé Moka",
    "type": "drink",
    "recipeIds": [
      "BATIDO FRESA ",
      "BATIDO MORA",
      "BATIDO G",
      "BATIDO PINA",
      "BATIDO N1",
      "BATIDO N2",
      "BATIDO N3",
      "BATIDO N4"
    ]
  },
  {
    "id": "cat-extras",
    "name": "Extras & Adicionales",
    "description": "Porciones extra de papas gajo, papas fritas, queso y salsa búfalo",
    "type": "extra",
    "recipeIds": [
      "PAPA GAJO",
      "PAPAS EXTRA",
      "QUESO CHEDAR",
      "BUFALO EXTRA"
    ]
  }
];

export const INITIAL_PORCENTAJES = [
  {
    "row": 2,
    "top": 2,
    "name": "ALAS",
    "days15": 390,
    "days30": 900,
    "autoDouble": false
  },
  {
    "row": 3,
    "top": 3,
    "name": "NACHOS",
    "days15": 175,
    "days30": 400,
    "autoDouble": false
  },
  {
    "row": 4,
    "top": 4,
    "name": "HAM RES",
    "days15": 175,
    "days30": 350,
    "autoDouble": true
  },
  {
    "row": 5,
    "top": 5,
    "name": "SALCHIPAPA",
    "days15": 90,
    "days30": 250,
    "autoDouble": false
  },
  {
    "row": 6,
    "top": 6,
    "name": "DEDITOS",
    "days15": 80,
    "days30": 160,
    "autoDouble": true
  },
  {
    "row": 7,
    "top": 7,
    "name": "QUESADILLA POLLO",
    "days15": 80,
    "days30": 120,
    "autoDouble": false
  },
  {
    "row": 8,
    "top": 8,
    "name": "SUB RES",
    "days15": 15,
    "days30": 30,
    "autoDouble": false
  },
  {
    "row": 9,
    "top": 9,
    "name": "BURRITO",
    "days15": 42,
    "days30": 84,
    "autoDouble": false
  },
  {
    "row": 10,
    "top": 10,
    "name": "PALOMITAS",
    "days15": 30,
    "days30": 70,
    "autoDouble": false
  },
  {
    "row": 11,
    "top": 11,
    "name": "HAM NANDO",
    "days15": 30,
    "days30": 180,
    "autoDouble": false
  },
  {
    "row": 12,
    "top": 12,
    "name": "TACO BIRRIA",
    "days15": 22,
    "days30": 136,
    "autoDouble": false
  },
  {
    "row": 13,
    "top": 13,
    "name": "TACO PASTOR",
    "days15": 16,
    "days30": 95,
    "autoDouble": false
  },
  {
    "row": 14,
    "top": 14,
    "name": "QUESABIRRIA",
    "days15": 15,
    "days30": 30,
    "autoDouble": false
  },
  {
    "row": 15,
    "top": 15,
    "name": "SUB POLLO",
    "days15": 10,
    "days30": 30,
    "autoDouble": false
  },
  {
    "row": 16,
    "top": 16,
    "name": "PAPAS GAJO",
    "days15": 10,
    "days30": 20,
    "autoDouble": false
  },
  {
    "row": 17,
    "top": 17,
    "name": "QUESADILLA QUESO",
    "days15": 3,
    "days30": 6,
    "autoDouble": true
  },
  {
    "row": 18,
    "top": 18,
    "name": "Hamburguesa de pollo",
    "days15": 70,
    "days30": 140,
    "autoDouble": false
  },
  {
    "row": 19,
    "top": 19,
    "name": "PAPAS EXTRA",
    "days15": 40,
    "days30": 80,
    "autoDouble": false
  },
  {
    "row": 20,
    "top": 20,
    "name": "CHEDAR EXTRA",
    "days15": 12,
    "days30": 25,
    "autoDouble": false
  },
  {
    "row": 21,
    "top": 21,
    "name": "BUFALO EXTRA",
    "days15": 20,
    "days30": 40,
    "autoDouble": false
  },
  {
    "row": 22,
    "top": 22,
    "name": "B MORA",
    "days15": 26,
    "days30": 52,
    "autoDouble": true
  },
  {
    "row": 23,
    "top": 23,
    "name": "B GUANABANA",
    "days15": 21,
    "days30": 42,
    "autoDouble": true
  },
  {
    "row": 24,
    "top": 24,
    "name": "B PINA",
    "days15": 11,
    "days30": 22,
    "autoDouble": false
  },
  {
    "row": 25,
    "top": 25,
    "name": "B FRESA",
    "days15": 41,
    "days30": 82,
    "autoDouble": false
  },
  {
    "row": 26,
    "top": 26,
    "name": "B OREO",
    "days15": 20,
    "days30": 40,
    "autoDouble": false
  },
  {
    "row": 27,
    "top": 27,
    "name": "TOSTONES RELLENOS",
    "days15": 15,
    "days30": 30,
    "autoDouble": false
  },
  {
    "row": 28,
    "top": 28,
    "name": "FRAPPE MOKA",
    "days15": 15,
    "days30": 30,
    "autoDouble": false
  },
  {
    "row": 29,
    "top": 29,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 30,
    "top": 30,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 31,
    "top": 31,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 32,
    "top": 32,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 33,
    "top": 33,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 34,
    "top": 34,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  },
  {
    "row": 35,
    "top": 35,
    "name": "",
    "days15": 0,
    "days30": 0,
    "autoDouble": false
  }
];

export const INITIAL_RECIPES = {
  "H. RES": {
    "id": "H. RES",
    "sheetName": "H. RES",
    "title": "COSTOS Y PRECIO DE VENTA HAMBURGESA DE RES",
    "batchQty": 270,
    "batchLinkedToPorcentajes": false,
    "porcentajesRow": 4,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "Carne",
        "unitCost": 28.0
      },
      {
        "id": "ing-2",
        "name": "cebolla",
        "unitCost": 1.0
      },
      {
        "id": "ing-3",
        "name": "tomate",
        "unitCost": 1.4
      },
      {
        "id": "ing-4",
        "name": "pan",
        "unitCost": 14.0
      },
      {
        "id": "ing-5",
        "name": "queso",
        "unitCost": 6.5
      },
      {
        "id": "ing-6",
        "name": "mayonesa",
        "unitCost": 1.5
      },
      {
        "id": "ing-7",
        "name": "lechuga",
        "unitCost": 4.11
      },
      {
        "id": "ing-8",
        "name": "salsa tomate",
        "unitCost": 2.5
      },
      {
        "id": "ing-9",
        "name": "salsitas",
        "unitCost": 2.8
      },
      {
        "id": "ing-10",
        "name": "bolsas papas",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "bacon",
        "unitCost": 7.2
      },
      {
        "id": "ing-12",
        "name": "papas",
        "unitCost": 32.0
      },
      {
        "id": "ing-13",
        "name": "empaque",
        "unitCost": 3.64
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "PRESTAMO",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 1300.0
      },
      {
        "id": "exp-7",
        "name": "Envio",
        "amount": 8000.0
      }
    ],
    "displayName": "Hamburguesa de Res"
  },
  "H. POLLO": {
    "id": "H. POLLO",
    "sheetName": "H. POLLO",
    "title": "COSTOS Y PRECIO DE VENTA HAMBURGUESA DE POLLO",
    "batchQty": 140,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 18,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "filete pollo 100G",
        "unitCost": 30.0
      },
      {
        "id": "ing-2",
        "name": "cebolla",
        "unitCost": 1.0
      },
      {
        "id": "ing-3",
        "name": "tomate",
        "unitCost": 1.4
      },
      {
        "id": "ing-4",
        "name": "pan",
        "unitCost": 14.0
      },
      {
        "id": "ing-5",
        "name": "Queso chedar",
        "unitCost": 8.0
      },
      {
        "id": "ing-6",
        "name": "mayonesa",
        "unitCost": 1.5
      },
      {
        "id": "ing-7",
        "name": "lechuga",
        "unitCost": 4.11
      },
      {
        "id": "ing-8",
        "name": "salsa tomate",
        "unitCost": 1.0
      },
      {
        "id": "ing-9",
        "name": "salsitas",
        "unitCost": 2.8
      },
      {
        "id": "ing-10",
        "name": "bolsas papas",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "papas",
        "unitCost": 29.0
      },
      {
        "id": "ing-12",
        "name": "empaque",
        "unitCost": 3.64
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Hamburguesa de Pollo"
  },
  "H. NANDO": {
    "id": "H. NANDO",
    "sheetName": "H. NANDO",
    "title": "COSTOS Y PRECIO DE VENTA HAMBURGUESA NANDO",
    "batchQty": 180,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 11,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "2 Carne",
        "unitCost": 48.0
      },
      {
        "id": "ing-2",
        "name": "cebolla",
        "unitCost": 1.0
      },
      {
        "id": "ing-3",
        "name": "tomate",
        "unitCost": 1.4
      },
      {
        "id": "ing-4",
        "name": "1.5 pan",
        "unitCost": 22.0
      },
      {
        "id": "ing-5",
        "name": "2 queso",
        "unitCost": 13.0
      },
      {
        "id": "ing-6",
        "name": "3 mayonesa",
        "unitCost": 4.5
      },
      {
        "id": "ing-7",
        "name": "lechuga",
        "unitCost": 4.11
      },
      {
        "id": "ing-8",
        "name": "salsa tomate",
        "unitCost": 2.5
      },
      {
        "id": "ing-9",
        "name": "salsitas",
        "unitCost": 2.8
      },
      {
        "id": "ing-10",
        "name": "bolsas papas",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "papas",
        "unitCost": 32.0
      },
      {
        "id": "ing-12",
        "name": "empaque",
        "unitCost": 3.64
      },
      {
        "id": "ing-13",
        "name": "2 bacon",
        "unitCost": 14.5
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 8000.0
      }
    ],
    "displayName": "Hamburguesa Nando"
  },
  "ALAS P": {
    "id": "ALAS P",
    "sheetName": "ALAS P",
    "title": "COSTOS Y PRECIO DE VENTA ALAS DE POLLO",
    "batchQty": 900,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 2,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "1 LB ALAS",
        "unitCost": 87.0
      },
      {
        "id": "ing-2",
        "name": "140 G PAPAS",
        "unitCost": 32.0
      },
      {
        "id": "ing-3",
        "name": "1 BLS SALAS",
        "unitCost": 1.1
      },
      {
        "id": "ing-4",
        "name": "1 BLS MAYONESA",
        "unitCost": 1.8
      },
      {
        "id": "ing-5",
        "name": "EMPAQUE",
        "unitCost": 5.38
      },
      {
        "id": "ing-6",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-7",
        "name": "ENVASE SALSA",
        "unitCost": 1.1
      },
      {
        "id": "ing-8",
        "name": "SALSA BUFALO",
        "unitCost": 5.0
      },
      {
        "id": "ing-9",
        "name": "INGREDIENTES",
        "unitCost": 7.5
      },
      {
        "id": "ing-10",
        "name": "EMPANIZADOR",
        "unitCost": 4.8
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Alas de Pollo"
  },
  "NACHO P, R": {
    "id": "NACHO P, R",
    "sheetName": "NACHO P, R",
    "title": "COSTOS Y PRECIO DE VENTA NACHOS RES, POLLO.",
    "batchQty": 400,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 3,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "TORTILLA",
        "unitCost": 24.0
      },
      {
        "id": "ing-2",
        "name": "CARNE 200G",
        "unitCost": 48.0
      },
      {
        "id": "ing-3",
        "name": "CREMA",
        "unitCost": 6.0
      },
      {
        "id": "ing-4",
        "name": "QUESO",
        "unitCost": 9.0
      },
      {
        "id": "ing-5",
        "name": "LECHUGA",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "FRIJOLES 100G",
        "unitCost": 10.0
      },
      {
        "id": "ing-7",
        "name": "PICO GALLO",
        "unitCost": 5.0
      },
      {
        "id": "ing-8",
        "name": "CHILE",
        "unitCost": 3.0
      },
      {
        "id": "ing-9",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "INGREDIENTES",
        "unitCost": 12.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Nachos Res / Pollo"
  },
  "SALCHIPAPA": {
    "id": "SALCHIPAPA",
    "sheetName": "SALCHIPAPA",
    "title": "COSTOS Y PRECIO DE VENTA SALCHIPAPA POLLO",
    "batchQty": 250,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 5,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "pollo",
        "unitCost": 40.0
      },
      {
        "id": "ing-2",
        "name": "papa",
        "unitCost": 42.0
      },
      {
        "id": "ing-3",
        "name": "salsa tomate",
        "unitCost": 2.0
      },
      {
        "id": "ing-4",
        "name": "mayonesa",
        "unitCost": 4.0
      },
      {
        "id": "ing-5",
        "name": "bolsa",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "empaque",
        "unitCost": 5.0
      },
      {
        "id": "ing-7",
        "name": "tenedor",
        "unitCost": 1.5
      },
      {
        "id": "ing-8",
        "name": "salchicha",
        "unitCost": 29.0
      },
      {
        "id": "ing-9",
        "name": "queso amarillo",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Salchipapa Pollo"
  },
  "DEDITOS": {
    "id": "DEDITOS",
    "sheetName": "DEDITOS",
    "title": "COSTOS Y PRECIO DE VENTA DEDITOS",
    "batchQty": 160,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 6,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "150 G POLLO",
        "unitCost": 43.0
      },
      {
        "id": "ing-2",
        "name": "INGREDIENTES",
        "unitCost": 3.7
      },
      {
        "id": "ing-3",
        "name": "140G PAPA",
        "unitCost": 32.0
      },
      {
        "id": "ing-4",
        "name": "EMPANIZADOR",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "PANKO",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "LECHE",
        "unitCost": 2.0
      },
      {
        "id": "ing-7",
        "name": "SALSA",
        "unitCost": 2.0
      },
      {
        "id": "ing-8",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-9",
        "name": "ADERESO",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-11",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 8000.0
      }
    ],
    "displayName": "Deditos de Pollo"
  },
  "QUESADILLAS POLLO": {
    "id": "QUESADILLAS POLLO",
    "sheetName": "QUESADILLAS POLLO",
    "title": "COSTOS Y PRECIO DE VENTA QUESADILLAS POLLO",
    "batchQty": 120,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 7,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "TORTILLA",
        "unitCost": 13.0
      },
      {
        "id": "ing-2",
        "name": "QUESO",
        "unitCost": 20.0
      },
      {
        "id": "ing-3",
        "name": "ADERESO",
        "unitCost": 5.0
      },
      {
        "id": "ing-4",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-5",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-7",
        "name": "POLLO 100G",
        "unitCost": 60.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Quesadilla de Pollo"
  },
  "BURRITO": {
    "id": "BURRITO",
    "sheetName": "BURRITO",
    "title": "COSTOS Y PRECIO DE VENTA BURRITO",
    "batchQty": 84,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 9,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "frijoles 60g",
        "unitCost": 7.0
      },
      {
        "id": "ing-2",
        "name": "pepino",
        "unitCost": 4.0
      },
      {
        "id": "ing-3",
        "name": "tomate",
        "unitCost": 4.0
      },
      {
        "id": "ing-4",
        "name": "lechuga",
        "unitCost": 8.0
      },
      {
        "id": "ing-5",
        "name": "queso  45g",
        "unitCost": 20.0
      },
      {
        "id": "ing-6",
        "name": "pollo/carne",
        "unitCost": 60.0
      },
      {
        "id": "ing-7",
        "name": "aderezo",
        "unitCost": 5.0
      },
      {
        "id": "ing-8",
        "name": "tortilla",
        "unitCost": 18.0
      },
      {
        "id": "ing-9",
        "name": "empaque",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "bolsa",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "papel",
        "unitCost": 1.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Burrito Mixto"
  },
  "PALOMITAS": {
    "id": "PALOMITAS",
    "sheetName": "PALOMITAS",
    "title": "COSTOS Y PRECIO DE VENTA PALOMITAS",
    "batchQty": 70,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 10,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "140 G POLLO",
        "unitCost": 43.0
      },
      {
        "id": "ing-2",
        "name": "PAPA",
        "unitCost": 32.0
      },
      {
        "id": "ing-3",
        "name": "SALSA TOMATE",
        "unitCost": 1.8
      },
      {
        "id": "ing-4",
        "name": "MAYONESA",
        "unitCost": 1.1
      },
      {
        "id": "ing-5",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-7",
        "name": "INGREDIENTE",
        "unitCost": 4.0
      },
      {
        "id": "ing-8",
        "name": "EMPANIZADOR",
        "unitCost": 5.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 8000.0
      }
    ],
    "displayName": "Palomitas de Pollo"
  },
  "QUESABIRRIAS": {
    "id": "QUESABIRRIAS",
    "sheetName": "QUESABIRRIAS",
    "title": "COSTOS Y PRECIO DE VENTA QUESABIRRIA",
    "batchQty": 39,
    "batchLinkedToPorcentajes": false,
    "porcentajesRow": 14,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "1 TORTILLA",
        "unitCost": 11.0
      },
      {
        "id": "ing-2",
        "name": "chile",
        "unitCost": 7.0
      },
      {
        "id": "ing-3",
        "name": "150G CARNE",
        "unitCost": 71.0
      },
      {
        "id": "ing-4",
        "name": "Cebolla",
        "unitCost": 7.0
      },
      {
        "id": "ing-5",
        "name": "1/2 LIMON",
        "unitCost": 2.0
      },
      {
        "id": "ing-6",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-7",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-8",
        "name": "culantro",
        "unitCost": 2.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0.0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Quesabirria"
  },
  "QUESADILLA DE QUESO": {
    "id": "QUESADILLA DE QUESO",
    "sheetName": "QUESADILLA DE QUESO",
    "title": "COSTOS Y PRECIO DE VENTA QUESADILLA DE QUESO",
    "batchQty": 6,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 17,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "1 TORTILLA",
        "unitCost": 13.0
      },
      {
        "id": "ing-2",
        "name": "60G QUESO",
        "unitCost": 13.0
      },
      {
        "id": "ing-3",
        "name": "ADEREZO",
        "unitCost": 5.0
      },
      {
        "id": "ing-4",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0.0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Quesadilla de Queso"
  },
  "TACO BIRRIA": {
    "id": "TACO BIRRIA",
    "sheetName": "TACO BIRRIA",
    "title": "COSTOS Y PRECIO DE VENTA TACO BIRRIA",
    "batchQty": 136,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 12,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "3 TORTILLAS",
        "unitCost": 5.0
      },
      {
        "id": "ing-2",
        "name": "75G QUESO",
        "unitCost": 16.0
      },
      {
        "id": "ing-3",
        "name": "CARNE 180G",
        "unitCost": 99.0
      },
      {
        "id": "ing-4",
        "name": "SALSA",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "CEBOLLA Y CULANTRO 100G",
        "unitCost": 7.0
      },
      {
        "id": "ing-6",
        "name": "1/2 LIMON",
        "unitCost": 2.0
      },
      {
        "id": "ing-7",
        "name": "CALDO",
        "unitCost": 7.0
      },
      {
        "id": "ing-8",
        "name": "2 TAZAS",
        "unitCost": 2.2
      },
      {
        "id": "ing-9",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0.0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Taco de Birria"
  },
  "TACO PASTOR": {
    "id": "TACO PASTOR",
    "sheetName": "TACO PASTOR",
    "title": "COSTOS Y PRECIO DE VENTA TACO PASTOR",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "carne",
        "unitCost": 50.0
      },
      {
        "id": "ing-2",
        "name": "3 tortilla",
        "unitCost": 5.0
      },
      {
        "id": "ing-3",
        "name": "cebolla y culantro",
        "unitCost": 7.0
      },
      {
        "id": "ing-4",
        "name": "pina",
        "unitCost": 8.0
      },
      {
        "id": "ing-5",
        "name": "1/2 limon",
        "unitCost": 1.5
      },
      {
        "id": "ing-6",
        "name": "empaque",
        "unitCost": 5.0
      },
      {
        "id": "ing-7",
        "name": "bolsa",
        "unitCost": 1.0
      },
      {
        "id": "ing-8",
        "name": "taza",
        "unitCost": 1.1
      },
      {
        "id": "ing-9",
        "name": "chile",
        "unitCost": 6.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 8000.0
      }
    ],
    "displayName": "Taco al Pastor"
  },
  "SUB POLLO": {
    "id": "SUB POLLO",
    "sheetName": "SUB POLLO",
    "title": "COSTOS Y PRECIO DE VENTA SUB DE POLLO",
    "batchQty": 30,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 15,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "PAN",
        "unitCost": 24.0
      },
      {
        "id": "ing-2",
        "name": "QUESO",
        "unitCost": 5.4
      },
      {
        "id": "ing-3",
        "name": "POLLO",
        "unitCost": 50.0
      },
      {
        "id": "ing-4",
        "name": "PEPINO 30G",
        "unitCost": 3.0
      },
      {
        "id": "ing-5",
        "name": "TOMATE 30G",
        "unitCost": 3.0
      },
      {
        "id": "ing-6",
        "name": "LECHUGA 40G",
        "unitCost": 4.1
      },
      {
        "id": "ing-7",
        "name": "ADEREZO RANCH 10G",
        "unitCost": 6.0
      },
      {
        "id": "ing-8",
        "name": "JAMON",
        "unitCost": 6.0
      },
      {
        "id": "ing-9",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "PAPEL",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-12",
        "name": "SALSA TOMATE",
        "unitCost": 2.0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0.0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 8000.0
      }
    ],
    "displayName": "Sub de Pollo"
  },
  "SUB RES": {
    "id": "SUB RES",
    "sheetName": "SUB RES",
    "title": "COSTOS Y PRECIO DE VENTA SUB DE RES",
    "batchQty": 30,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 8,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "POLLO 600 G",
        "unitCost": 98.0
      },
      {
        "id": "ing-2",
        "name": "MARINADO",
        "unitCost": 4.0
      },
      {
        "id": "ing-3",
        "name": "MARINADO",
        "unitCost": 4.0
      },
      {
        "id": "ing-4",
        "name": "EMPANIZADO",
        "unitCost": 13.0
      },
      {
        "id": "ing-5",
        "name": "MIEL",
        "unitCost": 13.0
      },
      {
        "id": "ing-6",
        "name": "WAFFLES",
        "unitCost": 20.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-9",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "PAPEL",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0.0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Sub de Res"
  },
  "PAPA GAJO": {
    "id": "PAPA GAJO",
    "sheetName": "PAPA GAJO",
    "title": "COSTOS Y PRECIO DE VENTA PAPA GAJO",
    "batchQty": 20,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 16,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "140G PAPAS GAJO",
        "unitCost": 32.0
      },
      {
        "id": "ing-2",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-3",
        "name": "ADEREZO",
        "unitCost": 5.0
      },
      {
        "id": "ing-4",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-5",
        "name": "BOLSA P",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Papas Gajo"
  },
  "PAPAS EXTRA": {
    "id": "PAPAS EXTRA",
    "sheetName": "PAPAS EXTRA",
    "title": "COSTOS Y PRECIO DE VENTA PAPAS EXTRA",
    "batchQty": 80,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 19,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "140G PAPAS",
        "unitCost": 32.0
      },
      {
        "id": "ing-2",
        "name": "SALSA TOMATE",
        "unitCost": 1.0
      },
      {
        "id": "ing-3",
        "name": "MAYONESA",
        "unitCost": 1.8
      },
      {
        "id": "ing-4",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA P",
        "unitCost": 4.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 28000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Papas Extra"
  },
  "QUESO CHEDAR": {
    "id": "QUESO CHEDAR",
    "sheetName": "QUESO CHEDAR",
    "title": "COSTOS Y PRECIO DE VENTA QUESO EXTRA",
    "batchQty": 25,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 20,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "2 ONZ QUESO",
        "unitCost": 10.0
      },
      {
        "id": "ing-2",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-3",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Queso Cheddar Extra"
  },
  "BUFALO EXTRA": {
    "id": "BUFALO EXTRA",
    "sheetName": "BUFALO EXTRA",
    "title": "COSTOS Y PRECIO DE VENTA BUFALO EXTRA",
    "batchQty": 82,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 25,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "2 ONZ DE SALSA",
        "unitCost": 8.2
      },
      {
        "id": "ing-2",
        "name": "TAZA",
        "unitCost": 1.1
      },
      {
        "id": "ing-3",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 30000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Salsa Búfalo Extra"
  },
  "BATIDO FRESA ": {
    "id": "BATIDO FRESA ",
    "sheetName": "BATIDO FRESA ",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO FRESA",
    "batchQty": 82,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 25,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "PULPA DE FRESA 1.5 ONZ",
        "unitCost": 16.25
      },
      {
        "id": "ing-2",
        "name": "LECHE 6 ONZ",
        "unitCost": 9.7
      },
      {
        "id": "ing-3",
        "name": "LECHE PINITO",
        "unitCost": 2.1
      },
      {
        "id": "ing-4",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "PAJILLA",
        "unitCost": 0.5
      },
      {
        "id": "ing-7",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26800.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido de Fresa"
  },
  "BATIDO MORA": {
    "id": "BATIDO MORA",
    "sheetName": "BATIDO MORA",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO MORA",
    "batchQty": 52,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 22,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "PULPA DE FRESA 1.5 ONZ",
        "unitCost": 14.8
      },
      {
        "id": "ing-2",
        "name": "LECHE 6 ONZ",
        "unitCost": 9.7
      },
      {
        "id": "ing-3",
        "name": "LECHE PINITO",
        "unitCost": 2.1
      },
      {
        "id": "ing-4",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "PAJILLA",
        "unitCost": 0.5
      },
      {
        "id": "ing-7",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido de Mora"
  },
  "BATIDO G": {
    "id": "BATIDO G",
    "sheetName": "BATIDO G",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO GUANABANA",
    "batchQty": 42,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 23,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "PULPA DE FRESA 3 ONZ",
        "unitCost": 20.26
      },
      {
        "id": "ing-2",
        "name": "LECHE 6 ONZ",
        "unitCost": 9.7
      },
      {
        "id": "ing-3",
        "name": "LECHE PINITO",
        "unitCost": 2.1
      },
      {
        "id": "ing-4",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "PAJILLA",
        "unitCost": 0.5
      },
      {
        "id": "ing-7",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido de Guanábana"
  },
  "BATIDO PINA": {
    "id": "BATIDO PINA",
    "sheetName": "BATIDO PINA",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO PIÑA",
    "batchQty": 22,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 24,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "PULPA DE FRESA 3 ONZ",
        "unitCost": 20.26
      },
      {
        "id": "ing-2",
        "name": "LECHE 6 ONZ",
        "unitCost": 9.7
      },
      {
        "id": "ing-3",
        "name": "LECHE PINITO",
        "unitCost": 2.1
      },
      {
        "id": "ing-4",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "PAJILLA",
        "unitCost": 0.5
      },
      {
        "id": "ing-7",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido de Piña"
  },
  "BATIDO N1": {
    "id": "BATIDO N1",
    "sheetName": "BATIDO N1",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO OREO",
    "batchQty": 40,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 26,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "COCOA",
        "unitCost": 9.5
      },
      {
        "id": "ing-2",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-3",
        "name": "GALLETA",
        "unitCost": 9.2
      },
      {
        "id": "ing-4",
        "name": "BARQUILLO",
        "unitCost": 1.5
      },
      {
        "id": "ing-5",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "PAJILLA",
        "unitCost": 1.0
      },
      {
        "id": "ing-7",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-8",
        "name": "CHANTILLY",
        "unitCost": 11.0
      },
      {
        "id": "ing-9",
        "name": "SIROPE HERSHEYS",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "LECHE",
        "unitCost": 9.7
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido de Oreo"
  },
  "BATIDO N2": {
    "id": "BATIDO N2",
    "sheetName": "BATIDO N2",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO FRAPPE MOKA",
    "batchQty": 30,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 28,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "VASO",
        "unitCost": 5.0
      },
      {
        "id": "ing-2",
        "name": "LECHE",
        "unitCost": 9.7
      },
      {
        "id": "ing-3",
        "name": "LECHE PINITO",
        "unitCost": 2.4
      },
      {
        "id": "ing-4",
        "name": "CAFÉ",
        "unitCost": 5.0
      },
      {
        "id": "ing-5",
        "name": "SIROPE",
        "unitCost": 5.0
      },
      {
        "id": "ing-6",
        "name": "MOKA",
        "unitCost": 20.0
      },
      {
        "id": "ing-7",
        "name": "LECHE CONSENDASA",
        "unitCost": 8.0
      },
      {
        "id": "ing-8",
        "name": "HIELO",
        "unitCost": 4.0
      },
      {
        "id": "ing-9",
        "name": "CHANTILLY",
        "unitCost": 11.0
      },
      {
        "id": "ing-10",
        "name": "PAJILLA",
        "unitCost": 1.0
      },
      {
        "id": "ing-11",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Frappé Moka"
  },
  "BATIDO N3": {
    "id": "BATIDO N3",
    "sheetName": "BATIDO N3",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO",
    "batchQty": 22,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 24,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido Nuevo 3"
  },
  "BATIDO N4": {
    "id": "BATIDO N4",
    "sheetName": "BATIDO N4",
    "title": "COSTOS Y PRECIO DE VENTA BATIDO",
    "batchQty": 22,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 24,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Batido Nuevo 4"
  },
  "SNACK 1": {
    "id": "SNACK 1",
    "sheetName": "SNACK 1",
    "title": "COSTOS Y PRECIO DE VENTA  TOSTONES RELLENOS",
    "batchQty": 30,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 27,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Tostones Rellenos"
  },
  "SNACK 2": {
    "id": "SNACK 2",
    "sheetName": "SNACK 2",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "CARNE",
        "unitCost": 54.0
      },
      {
        "id": "ing-2",
        "name": "ADEREZO",
        "unitCost": 4.0
      },
      {
        "id": "ing-3",
        "name": "EMPAQUE",
        "unitCost": 5.0
      },
      {
        "id": "ing-4",
        "name": "CREMA",
        "unitCost": 3.0
      },
      {
        "id": "ing-5",
        "name": "BOLSA",
        "unitCost": 1.0
      },
      {
        "id": "ing-6",
        "name": "PAPEL",
        "unitCost": 1.3
      },
      {
        "id": "ing-7",
        "name": "TORTILLA PEQUEÑA",
        "unitCost": 3.7
      },
      {
        "id": "ing-8",
        "name": "TORTLLA GRANDE",
        "unitCost": 16.0
      },
      {
        "id": "ing-9",
        "name": "TORTILLA TOSTADA",
        "unitCost": 5.0
      },
      {
        "id": "ing-10",
        "name": "CHEDDAR",
        "unitCost": 10.0
      },
      {
        "id": "ing-11",
        "name": "VEGETALES",
        "unitCost": 15.0
      },
      {
        "id": "ing-12",
        "name": "SALSA BUFALO",
        "unitCost": 10.0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 16000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 14400.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 26400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 54000.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 2 (Especial)"
  },
  "SNACK 3": {
    "id": "SNACK 3",
    "sheetName": "SNACK 3",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 3"
  },
  "SNACK 4": {
    "id": "SNACK 4",
    "sheetName": "SNACK 4",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 4"
  },
  "SNACK 5": {
    "id": "SNACK 5",
    "sheetName": "SNACK 5",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 5"
  },
  "SNACK 6": {
    "id": "SNACK 6",
    "sheetName": "SNACK 6",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 6"
  },
  "SNACK 7": {
    "id": "SNACK 7",
    "sheetName": "SNACK 7",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 7"
  },
  "SNACK 8": {
    "id": "SNACK 8",
    "sheetName": "SNACK 8",
    "title": "COSTOS Y PRECIO DE VENTA",
    "batchQty": 95,
    "batchLinkedToPorcentajes": true,
    "porcentajesRow": 13,
    "customMarginPercent": 35.0,
    "ingredients": [
      {
        "id": "ing-1",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-2",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-3",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-4",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-5",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-6",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-7",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-8",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-9",
        "name": "",
        "unitCost": 0.0
      },
      {
        "id": "ing-10",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-11",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-12",
        "name": "",
        "unitCost": 0
      },
      {
        "id": "ing-13",
        "name": "",
        "unitCost": 0
      }
    ],
    "workers": [
      {
        "id": "w-1",
        "name": "trabajador 1",
        "amount": 13000.0
      },
      {
        "id": "w-2",
        "name": "trabajador 2",
        "amount": 13000.0
      },
      {
        "id": "w-3",
        "name": "trabajador 3",
        "amount": 12400.0
      }
    ],
    "monthlyExpenses": [
      {
        "id": "exp-1",
        "name": "Gas",
        "amount": 12000.0
      },
      {
        "id": "exp-2",
        "name": "aceite",
        "amount": 12600.0
      },
      {
        "id": "exp-3",
        "name": "luz",
        "amount": 6000.0
      },
      {
        "id": "exp-4",
        "name": "agua",
        "amount": 1200.0
      },
      {
        "id": "exp-5",
        "name": "limpieza",
        "amount": 2500.0
      },
      {
        "id": "exp-6",
        "name": "internet",
        "amount": 2000.0
      },
      {
        "id": "exp-7",
        "name": "Envios",
        "amount": 6500.0
      }
    ],
    "displayName": "Snack 8"
  }
};

export const INITIAL_PRECIOS = [
  {
    "row": 3,
    "name": "ALAS",
    "gainPercent": 33.7,
    "recipeSheet": "ALAS P",
    "defaultCalculadoraSales": 900
  },
  {
    "row": 4,
    "name": "NACHOS",
    "gainPercent": 29.7,
    "recipeSheet": "NACHO P, R",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 5,
    "name": "HAM RES",
    "gainPercent": 33.3,
    "recipeSheet": "H. RES",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 6,
    "name": "SALCHIPAPA",
    "gainPercent": 29.7,
    "recipeSheet": "SALCHIPAPA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 7,
    "name": "DEDITOS",
    "gainPercent": 30.6,
    "recipeSheet": "DEDITOS",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 8,
    "name": "QUESADILLA POLLO",
    "gainPercent": 29.1,
    "recipeSheet": "QUESADILLAS POLLO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 9,
    "name": "HAM POLLO",
    "gainPercent": 33.4,
    "recipeSheet": "H. POLLO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 10,
    "name": "BURRITO",
    "gainPercent": 25.5,
    "recipeSheet": "BURRITO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 11,
    "name": "PALOMITAS",
    "gainPercent": 30.0,
    "recipeSheet": "PALOMITAS",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 12,
    "name": "HAM NANDO",
    "gainPercent": 34.2,
    "recipeSheet": "H. NANDO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 13,
    "name": "TACO BIRRIA",
    "gainPercent": 22.5,
    "recipeSheet": "TACO BIRRIA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 14,
    "name": "TACO PASTOR",
    "gainPercent": 33.1,
    "recipeSheet": "TACO PASTOR",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 15,
    "name": "QUESABIRRIA",
    "gainPercent": 19.0,
    "recipeSheet": "QUESABIRRIAS",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 16,
    "name": "SUB POLLO",
    "gainPercent": 30.2,
    "recipeSheet": "SUB POLLO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 17,
    "name": "SUB RES",
    "gainPercent": 31.2,
    "recipeSheet": "SUB RES",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 18,
    "name": "PAPAS GAJO",
    "gainPercent": 23.0,
    "recipeSheet": "PAPA GAJO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 19,
    "name": "QUESADILLA QUESO",
    "gainPercent": 30.0,
    "recipeSheet": "QUESADILLA DE QUESO",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 20,
    "name": "PAPAS EXTRA",
    "gainPercent": 10.5,
    "recipeSheet": "PAPAS EXTRA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 21,
    "name": "CHEDAR EXTRA",
    "gainPercent": 18.0,
    "recipeSheet": "QUESO CHEDAR",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 22,
    "name": "BUFALO EXTRA",
    "gainPercent": 30.0,
    "recipeSheet": "BUFALO EXTRA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 23,
    "name": "BATIDO FRESA",
    "gainPercent": 32.3,
    "recipeSheet": "BATIDO FRESA ",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 24,
    "name": "BATIDO MORA",
    "gainPercent": 33.7,
    "recipeSheet": "BATIDO MORA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 25,
    "name": "BATIDO PINA",
    "gainPercent": 28.5,
    "recipeSheet": "BATIDO PINA",
    "defaultCalculadoraSales": 0
  },
  {
    "row": 26,
    "name": "BATIDO GUANABANA",
    "gainPercent": 28.5,
    "recipeSheet": "BATIDO G",
    "defaultCalculadoraSales": 0
  }
];

// ============================================================================
// MOTOR DE FÓRMULAS EXCEL (100% FIEL A COSTOS Y PRODUCTOS NANDO V3.xlsm)
// ============================================================================

/**
 * Calcula la hoja PORCENTAJES:
 * Suma E2:E45 (30 DIAS) y para cada fila calcula:
 *   porcentajeDecimal = days30 / totalDays30
 */
export function calculatePorcentajesTable(porcentajesRows) {
  const totalDays15 = porcentajesRows.reduce((acc, r) => acc + (Number(r.days15) || 0), 0);
  const totalDays30 = porcentajesRows.reduce((acc, r) => acc + (Number(r.days30) || 0), 0);

  const rowsByRowNumber = {};
  const computedRows = porcentajesRows.map((row) => {
    const days30 = Number(row.days30) || 0;
    const pctDecimal = totalDays30 > 0 ? days30 / totalDays30 : 0;
    const item = {
      ...row,
      days15: Number(row.days15) || 0,
      days30,
      pctDecimal,
      pctDisplay: (pctDecimal * 100).toFixed(1) + '%',
    };
    rowsByRowNumber[row.row] = item;
    return item;
  });

  return {
    rows: computedRows,
    rowsByRowNumber,
    totalDays15,
    totalDays30,
  };
}

/**
 * Calcula una hoja de receta individual (ej. H. RES, TOSTONES RELLENOS, ALAS P):
 * - C4 (Productos por generar): si batchLinkedToPorcentajes es true y el usuario no lo sobreescribió manualmente,
 *   toma PORCENTAJES!E{row}, o bien usa recipe.batchQty.
 * - G4 (Porcentaje G/V): toma PORCENTAJES!F{row} (pctDecimal).
 * - Costos Directos:
 *     Fila D_r = C_r * C4
 *     C20 = SUM(C7:C19)
 *     D20 = SUM(D7:D19)
 * - Costos Indirectos:
 *     G10 = SUM(G7:G9)
 *     I10 (Proporcional) = G10 * G4
 * - Gastos Mensuales:
 *     G20 = SUM(G13:G19)
 *     I20 (Proporcional) = G20 * G4
 * - Egreso Mensual (B24) = D20 + I10 + I20
 * - Egreso por Producto (F24) = B24 / C4
 * - Precios de Venta por margen (F27, F30, F33, F36):
 *     Precio = F24 / (1 - margen)
 */
export function calculateRecipeSheet(recipe, porcentajesInfo) {
  if (!recipe) return null;

  const linkedPctRow = recipe.porcentajesRow
    ? porcentajesInfo?.rowsByRowNumber?.[recipe.porcentajesRow]
    : null;

  const batchQty =
    recipe.batchLinkedToPorcentajes && linkedPctRow
      ? Number(linkedPctRow.days30) || 0
      : Number(recipe.batchQty) || 0;

  const pctDecimal = linkedPctRow ? linkedPctRow.pctDecimal : 0;
  const pctPercent = pctDecimal * 100;

  // Costos Directos (B7:D19)
  const ingredients = (recipe.ingredients || []).map((ing) => {
    const unitCost = Number(ing.unitCost) || 0;
    const totalCost = unitCost * batchQty;
    return {
      ...ing,
      unitCost,
      totalCost,
    };
  });

  const totalDirectUnit = ingredients.reduce((acc, i) => acc + i.unitCost, 0);
  const totalDirectBatch = ingredients.reduce((acc, i) => acc + i.totalCost, 0);

  // Costos Indirectos (F7:I10)
  const workers = (recipe.workers || []).map((w) => ({
    ...w,
    amount: Number(w.amount) || 0,
  }));
  const totalWorkers = workers.reduce((acc, w) => acc + w.amount, 0);
  const proportionalWorkers = totalWorkers * pctDecimal;

  // Gastos Mensuales (F13:I20)
  const monthlyExpenses = (recipe.monthlyExpenses || []).map((e) => ({
    ...e,
    amount: Number(e.amount) || 0,
  }));
  const totalMonthlyExpenses = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const proportionalExpenses = totalMonthlyExpenses * pctDecimal;

  // Egreso Mensual (B24) & Egreso por Producto (F24)
  const egresoMensual = totalDirectBatch + proportionalWorkers + proportionalExpenses;
  const egresoPorProducto = batchQty > 0 ? egresoMensual / batchQty : totalDirectUnit;

  // 4 Escenarios fijos de Ganancia (30%, 25%, 20%, y customMarginPercent ej. 35%)
  const customMargin = Number(recipe.customMarginPercent) || 35;
  const calcPrice = (marginPct) => {
    const m = Math.min(Math.max(Number(marginPct) || 0, 0), 99) / 100;
    return egresoPorProducto / (1 - m);
  };

  return {
    batchQty,
    pctDecimal,
    pctPercent,
    ingredients,
    totalDirectUnit,
    totalDirectBatch,
    workers,
    totalWorkers,
    proportionalWorkers,
    monthlyExpenses,
    totalMonthlyExpenses,
    proportionalExpenses,
    egresoMensual,
    egresoPorProducto,
    scenarios: [
      { id: 'm30', marginPercent: 30, price: calcPrice(30), editable: false },
      { id: 'm25', marginPercent: 25, price: calcPrice(25), editable: false },
      { id: 'm20', marginPercent: 20, price: calcPrice(20), editable: false },
      { id: 'mCustom', marginPercent: customMargin, price: calcPrice(customMargin), editable: true },
    ],
  };
}

/**
 * Calcula la hoja PRECIOS (sheet33):
 * Para cada fila toma el Egreso por Producto (F24) de su hoja de receta vinculada
 * y calcula:
 *   PRECIO = F24 / (1 - GANANCIAS)
 * Además calcula el Promedio general de ganancia en D43 = SUM(D3:D26) / N
 */
export function calculatePreciosTable(preciosRows, recipesMap, porcentajesInfo) {
  const computedRows = preciosRows.map((row) => {
    const recipe = recipesMap[row.recipeSheet];
    const recipeCalc = recipe ? calculateRecipeSheet(recipe, porcentajesInfo) : null;
    const unitCostF24 = recipeCalc ? recipeCalc.egresoPorProducto : 0;
    const gainPct = Number(row.gainPercent) || 0;
    const gainDecimal = Math.min(Math.max(gainPct, 0), 99) / 100;
    const officialPrice = gainDecimal < 1 ? unitCostF24 / (1 - gainDecimal) : unitCostF24;

    return {
      ...row,
      gainPercent: gainPct,
      unitCostF24,
      officialPrice,
    };
  });

  const avgGainPercent =
    computedRows.length > 0
      ? computedRows.reduce((acc, r) => acc + r.gainPercent, 0) / computedRows.length
      : 0;
  const avgGainDecimal = avgGainPercent / 100;

  return {
    rows: computedRows,
    avgGainPercent,
    avgGainDecimal,
  };
}

/**
 * Calcula la hoja CALCULADORA (sheet34):
 * Fórmulas exactas del Excel:
 * - PRECIO (E_r) = PRECIOS!E_r (officialPrice)
 * - TOTAL (F_r) = VENTAS (D_r) * PRECIO (E_r)
 * - GANANCIA (H_r) = TOTAL (F_r) * PRECIOS!D3 (avgGainDecimal)
 * - GASTOS (G_r) = TOTAL (F_r) - GANANCIA (H_r)
 */
export function calculateCalculadoraTable(preciosInfo, salesByRow) {
  const avgGainDecimal = preciosInfo.avgGainDecimal || 0;

  const rows = preciosInfo.rows.map((pRow) => {
    const ventas = Number(salesByRow[pRow.row] ?? 0) || 0;
    const precio = pRow.officialPrice || 0;
    const total = ventas * precio;
    const ganancia = total * avgGainDecimal;
    const gastos = total - ganancia;

    return {
      row: pRow.row,
      name: pRow.name,
      recipeSheet: pRow.recipeSheet,
      ventas,
      precio,
      total,
      gastos,
      ganancia,
    };
  });

  const totalVentasUnidades = rows.reduce((acc, r) => acc + r.ventas, 0);
  const totalIngresos = rows.reduce((acc, r) => acc + r.total, 0);
  const totalCostos = rows.reduce((acc, r) => acc + r.gastos, 0);
  const totalGanancias = rows.reduce((acc, r) => acc + r.ganancia, 0);

  return {
    rows,
    totalVentasUnidades,
    totalIngresos,
    totalCostos,
    totalGanancias,
    avgGainPercent: preciosInfo.avgGainPercent,
  };
}
