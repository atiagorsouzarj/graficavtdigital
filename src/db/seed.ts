import { db } from "./index";
import {
  users,
  clients,
  printerCategories,
  printers,
  materials,
  finishes,
  products,
  quotesOrders,
  quoteOrderItems,
  financialAccounts,
  financialTransactions,
  pdvShifts,
  systemSettings,
  communicationTemplates,
  whatsappConfig,
  apiKeys,
} from "./schema";
import { DEFAULT_KONICA_C284E_CONSUMABLES } from "@/lib/laserPricingEngine";
import { DEFAULT_EPSON_L18050_CONSUMABLES } from "@/lib/inkjetPricingEngine";
import { DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES } from "@/lib/sublimationPricingEngine";
import { DEFAULT_ELGIN_L42_PRO_CONSUMABLES } from "@/lib/thermalPricingEngine";
import { DEFAULT_PRODUCT_COMPOSITIONS, calculateProductPricingDetails } from "@/lib/productPricingEngine";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const existingPrinters = await db.select().from(printers).limit(1);
    if (existingPrinters.length > 0) {
      return { success: true, message: "Database already populated" };
    }

    console.log("Seeding database with 6+ demo records in all ERP/CRM modules...");

    // 1. Users
    const existingUsers = await db.select().from(users).limit(1);
    let userAdmin = existingUsers[0];
    if (!userAdmin) {
      [userAdmin] = await db
        .insert(users)
        .values({
          name: "Tiago Souza",
          email: "tiago@vtdigital.com.br",
          role: "Admin",
          pinCode: "1234",
          active: true,
        })
        .returning();
    }

    // 2. Clients CRM (At least 6 Demo Clients PF & PJ)
    const [client1] = await db
      .insert(clients)
      .values({
        type: "PJ",
        name: "Studio Design & Eventos Ltda",
        tradeName: "Studio Eventos",
        clientStatus: "VIP",
        document: "12.345.678/0001-90",
        stateRegistration: "109.876.543.210",
        email: "contato@studioeventos.com.br",
        phone: "(11) 3456-7890",
        mobile: "(11) 98765-4321",
        whatsapp: "(11) 98765-4321",
        contactPerson: "Mariana Costa",
        originMarketing: "Instagram",
        foundUs: "Redes Sociais",
        segment: "Eventos",
        zipCode: "01310-100",
        address: "Av. Paulista",
        number: "1000",
        complement: "Sala 42",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        creditLimit: "5000.00",
        notes: "Cliente VIP de eventos corporativos, faturamento quinzenal.",
      })
      .returning();

    const [client2] = await db
      .insert(clients)
      .values({
        type: "PF",
        name: "Raphaela Pinheiro",
        nickname: "Raphaela",
        clientStatus: "Liberado",
        document: "172.595.737-08",
        birthDate: "18/07/1995",
        gender: "Feminino",
        email: "raphaela.pinheiro@gmail.com",
        phone: "(21) 2038-3504",
        mobile: "(21) 99690-2449",
        whatsapp: "(21) 99690-2449",
        originMarketing: "Google",
        foundUs: "Busca",
        zipCode: "21863-090",
        address: "Rua Luzia de Macedo Dantas",
        number: "151",
        neighborhood: "Bangu",
        city: "Rio de Janeiro",
        state: "RJ",
        creditLimit: "500.00",
        notes: "Não deixe de aproveitar as nossas promoções!!!",
      })
      .returning();

    const [client3] = await db
      .insert(clients)
      .values({
        type: "PJ",
        name: "Restaurante e Bar Sabor & Arte Eireli",
        tradeName: "Sabor & Arte Bar",
        clientStatus: "Liberado",
        document: "98.765.432/0001-10",
        stateRegistration: "987.654.321.000",
        email: "compras@saborearte.com.br",
        phone: "(11) 3344-5566",
        mobile: "(11) 99112-2334",
        whatsapp: "(11) 99112-2334",
        contactPerson: "Carlos Eduardo",
        originMarketing: "Indicação",
        foundUs: "Indicação de Cliente",
        segment: "Gastronomia",
        zipCode: "05402-000",
        address: "Rua Oscar Freire",
        number: "500",
        neighborhood: "Pinheiros",
        city: "São Paulo",
        state: "SP",
        creditLimit: "3000.00",
        notes: "Cardápios plastificados e etiquetas de delivery.",
      })
      .returning();

    const [client4] = await db
      .insert(clients)
      .values({
        type: "PF",
        name: "Camila Rocha Eventos",
        nickname: "Cami",
        clientStatus: "VIP",
        document: "456.789.123-00",
        birthDate: "20/04/1988",
        gender: "Feminino",
        email: "camila.rocha@eventos.com.br",
        mobile: "(11) 98822-3344",
        whatsapp: "(11) 98822-3344",
        originMarketing: "Instagram",
        foundUs: "Redes Sociais",
        zipCode: "01408-000",
        address: "Alameda Santos",
        number: "1200",
        neighborhood: "Jardins",
        city: "São Paulo",
        state: "SP",
        creditLimit: "2500.00",
      })
      .returning();

    const [client5] = await db
      .insert(clients)
      .values({
        type: "PJ",
        name: "Padaria Bella Vista Ltda",
        tradeName: "Padaria Bella Vista",
        clientStatus: "Liberado",
        document: "55.444.333/0001-22",
        email: "pedidos@bellavista.com.br",
        phone: "(11) 3100-2000",
        whatsapp: "(11) 97700-1100",
        contactPerson: "Seu Antonio",
        segment: "Comércio",
        zipCode: "01311-000",
        address: "Rua Treze de Maio",
        number: "800",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        creditLimit: "1500.00",
      })
      .returning();

    const [client6] = await db
      .insert(clients)
      .values({
        type: "PJ",
        name: "Gabriel Martins Advocacia",
        tradeName: "Martins Advogados",
        clientStatus: "Especial",
        document: "66.777.888/0001-99",
        email: "contato@martinsadv.com.br",
        phone: "(11) 3210-4321",
        whatsapp: "(11) 96655-4433",
        contactPerson: "Dr. Gabriel",
        segment: "Corporativo",
        zipCode: "04543-000",
        address: "Av. Brigadeiro Faria Lima",
        number: "3000",
        neighborhood: "Itaim Bibi",
        city: "São Paulo",
        state: "SP",
        creditLimit: "4000.00",
      })
      .returning();

    // 3. Printer Categories
    let [catThermal] = await db.select().from(printerCategories).where(eq(printerCategories.name, "Impressora Térmica")).limit(1);
    if (!catThermal) {
      [catThermal] = await db
        .insert(printerCategories)
        .values({
          name: "Impressora Térmica",
          description: "Impressoras Térmicas de Etiquetas com Ribbon Cera, Misto, Resina e Resina Metálica.",
          technology: "thermal",
        })
        .returning();
    }

    let [catSublimacao] = await db.select().from(printerCategories).where(eq(printerCategories.name, "Sublimação")).limit(1);
    if (!catSublimacao) {
      [catSublimacao] = await db
        .insert(printerCategories)
        .values({
          name: "Sublimação",
          description: "Impressoras de Sublimação com Tintas Gênesis Sublidesk e Prensas Térmicas.",
          technology: "sublimation",
        })
        .returning();
    }

    let [catInkjet] = await db.select().from(printerCategories).where(eq(printerCategories.name, "Jato de Tinta")).limit(1);
    if (!catInkjet) {
      [catInkjet] = await db
        .insert(printerCategories)
        .values({
          name: "Jato de Tinta",
          description: "Impressoras e Multifuncionais de Tanque de Tinta de 6 cores (Epson EcoTank).",
          technology: "inkjet",
        })
        .returning();
    }

    let [catLaser] = await db.select().from(printerCategories).where(eq(printerCategories.name, "Laser Digital")).limit(1);
    if (!catLaser) {
      [catLaser] = await db
        .insert(printerCategories)
        .values({
          name: "Laser Digital",
          description: "Impressoras Laser / LED de alta resolução para folhetos, cartões e cartazes.",
          technology: "laser",
        })
        .returning();
    }

    let [catPlotter] = await db.select().from(printerCategories).where(eq(printerCategories.name, "Plotter / Comunicação Visual")).limit(1);
    if (!catPlotter) {
      [catPlotter] = await db
        .insert(printerCategories)
        .values({
          name: "Plotter / Comunicação Visual",
          description: "Plotters de impressão eco-solvente para lonas, banners e adesivos em m².",
          technology: "plotter",
        })
        .returning();
    }

    // 4. 6 Registered Printers
    const [printerElginL42] = await db
      .insert(printers)
      .values({
        categoryId: catThermal.id,
        categoryName: "Impressora Térmica",
        name: "ELGIN L42 Pro FULL",
        brand: "Elgin",
        model: "L42 Pro FULL",
        technology: "thermal",
        maxSheetWidthMm: 108,
        maxSheetHeightMm: 1000,
        maintenanceCostPerImp: "0.0090",
        energyCostPerImp: "0.0020",
        fixedCostPerImp: "0.0650",
        coveragePercent: "100.00",
        consumablesData: DEFAULT_ELGIN_L42_PRO_CONSUMABLES as any,
      })
      .returning();

    const [printerL3150] = await db
      .insert(printers)
      .values({
        categoryId: catSublimacao.id,
        categoryName: "Sublimação",
        name: "Epson EcoTank L3150 Sublimática",
        brand: "Epson",
        model: "EcoTank L3150",
        technology: "sublimation",
        maxSheetWidthMm: 210,
        maxSheetHeightMm: 297,
        maintenanceCostPerImp: "0.0045",
        energyCostPerImp: "0.0050",
        fixedCostPerImp: "0.3395",
        coveragePercent: "100.00",
        consumablesData: DEFAULT_EPSON_L3150_SUBLIMATION_CONSUMABLES as any,
      })
      .returning();

    const [printerEpsonL18050] = await db
      .insert(printers)
      .values({
        categoryId: catInkjet.id,
        categoryName: "Jato de Tinta",
        name: "Epson EcoTank L18050 A3+",
        brand: "Epson",
        model: "EcoTank L18050",
        technology: "inkjet",
        maxSheetWidthMm: 329,
        maxSheetHeightMm: 483,
        maintenanceCostPerImp: "0.0073",
        energyCostPerImp: "0.0050",
        fixedCostPerImp: "0.0828",
        coveragePercent: "80.00",
        consumablesData: DEFAULT_EPSON_L18050_CONSUMABLES as any,
      })
      .returning();

    const [printerKonica] = await db
      .insert(printers)
      .values({
        categoryId: catLaser.id,
        categoryName: "Laser Digital",
        name: "Konica Minolta bizhub C284e",
        brand: "Konica Minolta",
        model: "bizhub C284e",
        technology: "laser",
        maxSheetWidthMm: 330,
        maxSheetHeightMm: 488,
        maintenanceCostPerImp: "0.0214",
        energyCostPerImp: "0.0200",
        fixedCostPerImp: "0.1341",
        coveragePercent: "80.00",
        consumablesData: DEFAULT_KONICA_C284E_CONSUMABLES as any,
      })
      .returning();

    const [printerXerox] = await db
      .insert(printers)
      .values({
        categoryId: catLaser.id,
        categoryName: "Laser Digital",
        name: "Xerox Versant 180 Press",
        brand: "Xerox",
        model: "Versant 180",
        technology: "laser",
        maxSheetWidthMm: 330,
        maxSheetHeightMm: 660,
        maintenanceCostPerImp: "0.0300",
        energyCostPerImp: "0.0250",
        fixedCostPerImp: "0.1650",
        coveragePercent: "80.00",
        consumablesData: DEFAULT_KONICA_C284E_CONSUMABLES as any,
      })
      .returning();

    const [printerPlotter] = await db
      .insert(printers)
      .values({
        categoryId: catPlotter.id,
        categoryName: "Plotter / Comunicação Visual",
        name: "Plotter Roland Eco-Solvente 1.60m",
        brand: "Roland",
        model: "VersaEXPRESS RF-640",
        technology: "plotter",
        maxSheetWidthMm: 1600,
        maxSheetHeightMm: 50000,
        maintenanceCostPerImp: "2.5000",
        energyCostPerImp: "1.0000",
        fixedCostPerImp: "9.5000",
        coveragePercent: "100.00",
      })
      .returning();

    // 5. Materials
    const [matOffset180] = await db
      .insert(materials)
      .values({
        code: "INS-PAP-OFF180A4",
        name: "Papel Offset 180g A4",
        itemType: "insumo",
        category: "paper",
        purchaseUnit: "PCT",
        consumptionUnit: "FLS",
        conversionFactor: "100.00",
        stockQuantity: "5000.00",
        minStockQuantity: "500.00",
        purchasePrice: "85.00",
        costPrice: "0.8500",
        ncm: "4802.57.99",
        grammage: "180g",
        dimensions: "A4 (210x297mm)",
        finishType: "Branco Fosco",
        supplier: "Suzano Papéis",
      })
      .returning();

    const [matVinilBobina] = await db
      .insert(materials)
      .values({
        code: "INS-VIN-BRI60",
        name: "Vinil Adesivo Brilho Bobina 60cm x 50m",
        itemType: "insumo",
        category: "vinyl",
        purchaseUnit: "ROLO",
        consumptionUnit: "M",
        conversionFactor: "50.00",
        stockQuantity: "250.00",
        minStockQuantity: "20.00",
        purchasePrice: "350.00",
        costPrice: "7.0000",
        ncm: "3919.90.90",
        grammage: "80 micras",
        dimensions: "60cm x 50m",
        finishType: "Monomérico Brilho",
        supplier: "Imprimax Mídias",
      })
      .returning();

    const [matCartao300] = await db
      .insert(materials)
      .values({
        code: "INS-PAP-COU300",
        name: "Papel Couché 300g Brilho 66x96cm",
        itemType: "insumo",
        category: "paper",
        purchaseUnit: "RSM",
        consumptionUnit: "FLS",
        conversionFactor: "100.00",
        stockQuantity: "850.00",
        minStockQuantity: "200.00",
        purchasePrice: "185.00",
        costPrice: "1.8500",
        ncm: "4810.19.89",
        grammage: "300g",
        dimensions: "66x96cm",
        finishType: "Brilho Espelhado",
        supplier: "Fedrigoni Papéis",
      })
      .returning();

    const [matCouche150] = await db
      .insert(materials)
      .values({
        code: "INS-PAP-COU150",
        name: "Papel Couché 150g Brilho 66x96cm",
        itemType: "insumo",
        category: "paper",
        purchaseUnit: "RSM",
        consumptionUnit: "FLS",
        conversionFactor: "100.00",
        stockQuantity: "1200.00",
        minStockQuantity: "300.00",
        purchasePrice: "95.00",
        costPrice: "0.9500",
        ncm: "4810.19.89",
        grammage: "150g",
        dimensions: "66x96cm",
        finishType: "Brilho",
        supplier: "Papercorp",
      })
      .returning();

    const [matLona440] = await db
      .insert(materials)
      .values({
        code: "INS-LON-440",
        name: "Lona Frontlight 440g Brilho (m²)",
        itemType: "insumo",
        category: "vinyl",
        purchaseUnit: "ROLO",
        consumptionUnit: "M2",
        conversionFactor: "50.00",
        stockQuantity: "180.00",
        minStockQuantity: "40.00",
        purchasePrice: "700.00",
        costPrice: "14.0000",
        ncm: "3921.90.90",
        grammage: "440g",
        dimensions: "1.60m x 50m",
        finishType: "Frontlight Brilho",
        supplier: "Sansuy Mídias",
      })
      .returning();

    const [matAgendaFinished] = await db
      .insert(materials)
      .values({
        code: "PRO-AGD-CAD2027",
        name: "Agenda Personalizada Capa Dura 2027",
        itemType: "produto_acabado",
        category: "finished",
        purchaseUnit: "UN",
        consumptionUnit: "UN",
        conversionFactor: "1.00",
        stockQuantity: "150.00",
        minStockQuantity: "20.00",
        purchasePrice: "18.50",
        costPrice: "18.5000",
        ncm: "4820.10.00",
        grammage: "Capa 1.9mm + Miolo 75g",
        dimensions: "15x21cm (A5)",
        finishType: "Laminado Fosco + Wire-o",
        supplier: "Produção Própria Gráfica",
      })
      .returning();

    // 6. Finishes
    await db.insert(finishes).values([
      { name: "Laminação BoPP Fosca", unit: "m2", costPrice: "2.50", sellPrice: "6.00", estimatedMinutes: 5 },
      { name: "Plastificação Polaseal A4", unit: "unit", costPrice: "0.80", sellPrice: "3.50", estimatedMinutes: 2 },
      { name: "Corte e Vinco Digital", unit: "unit", costPrice: "0.05", sellPrice: "0.20", estimatedMinutes: 1 },
      { name: "Ilhós em Lona", unit: "unit", costPrice: "0.30", sellPrice: "1.50", estimatedMinutes: 1 },
      { name: "Verniz UV Localizado", unit: "unit", costPrice: "0.12", sellPrice: "0.50", estimatedMinutes: 3 },
      { name: "Encadernação Wire-o Duplo Anel", unit: "unit", costPrice: "1.50", sellPrice: "6.00", estimatedMinutes: 5 },
    ]);

    // 7. Products
    const compCartao = DEFAULT_PRODUCT_COMPOSITIONS.cartao_visita;
    const calcCartao = calculateProductPricingDetails(compCartao);
    const [prodCartao] = await db
      .insert(products)
      .values({
        code: "PRO-CRV-COU300VT",
        name: "Cartão de Visita Couchê 300g Verniz (100un)",
        category: "grafica_rapida",
        description: "100 cartões de visita 9x5cm em papel couché 300g impresso frente e verso na Konica C284e.",
        salesUnit: "CT",
        printerId: printerKonica.id,
        paperMaterialId: matCartao300.id,
        defaultYieldPerSheet: 24,
        yieldFactor: "0.0416",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "60.00",
        calculatedBaseCost: calcCartao.baseCompositionCost.toFixed(4),
        costWithLoss: calcCartao.costWithLoss.toFixed(4),
        suggestedPrice: "95.00",
        minSellPrice: String(calcCartao.minSellPrice),
        overrideSellPrice: "95.00",
        compositionData: compCartao as any,
        active: true,
      })
      .returning();

    const compEtiqueta = DEFAULT_PRODUCT_COMPOSITIONS.etiqueta_5cm;
    const calcEtiqueta = calculateProductPricingDetails(compEtiqueta);
    const [prodEtiqueta] = await db
      .insert(products)
      .values({
        code: "PRO-ETQ-RED5CM",
        name: "Etiqueta Adesiva Redonda 5cm (Recortada)",
        category: "brindes",
        description: "Etiqueta redonda 5cm adesiva com meio-corte eletrônico para destacar.",
        salesUnit: "UN",
        printerId: printerKonica.id,
        defaultYieldPerSheet: 40,
        yieldFactor: "0.0250",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "65.00",
        calculatedBaseCost: calcEtiqueta.baseCompositionCost.toFixed(4),
        costWithLoss: calcEtiqueta.costWithLoss.toFixed(4),
        suggestedPrice: String(calcEtiqueta.suggestedPrice),
        minSellPrice: String(calcEtiqueta.minSellPrice),
        compositionData: compEtiqueta as any,
        active: true,
      })
      .returning();

    const compCaixa = DEFAULT_PRODUCT_COMPOSITIONS.caixa_cone;
    const calcCaixa = calculateProductPricingDetails(compCaixa);
    const [prodCaixa] = await db
      .insert(products)
      .values({
        code: "PRO-CXA-CONEPIR",
        name: "Caixa Cone / Pirâmide Personalizada",
        category: "papelaria_personalizada",
        description: "Caixa cone para festa infantil em papel offset 180g impresso e vinco na plotter.",
        salesUnit: "UN",
        printerId: printerKonica.id,
        paperMaterialId: matOffset180.id,
        defaultYieldPerSheet: 1,
        yieldFactor: "1.0000",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "60.00",
        calculatedBaseCost: calcCaixa.baseCompositionCost.toFixed(4),
        costWithLoss: calcCaixa.costWithLoss.toFixed(4),
        suggestedPrice: String(calcCaixa.suggestedPrice),
        minSellPrice: String(calcCaixa.minSellPrice),
        compositionData: compCaixa as any,
        active: true,
      })
      .returning();

    const [prodTopoBolo] = await db
      .insert(products)
      .values({
        code: "PRO-TOP-BOLO",
        name: "Topo de Bolo Personalizado",
        category: "papelaria_personalizada",
        description: "Topo de bolo impresso e recortado em papel offset 180g.",
        salesUnit: "UNI",
        printerId: printerKonica.id,
        paperMaterialId: matOffset180.id,
        defaultYieldPerSheet: 1,
        yieldFactor: "1.0000",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "60.00",
        calculatedBaseCost: "14.2500",
        costWithLoss: "14.2500",
        suggestedPrice: "14.25",
        minSellPrice: "12.00",
        overrideSellPrice: "14.25",
        active: true,
      })
      .returning();

    const [prodFolder] = await db
      .insert(products)
      .values({
        code: "PRO-FLD-COU150A5",
        name: "Impressão Xerox A4 Laser Offset 75g",
        category: "grafica_rapida",
        description: "Impressão A4 Laser.",
        salesUnit: "UNI",
        printerId: printerKonica.id,
        paperMaterialId: matCouche150.id,
        defaultYieldPerSheet: 1,
        yieldFactor: "1.0000",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "60.00",
        calculatedBaseCost: "1.4600",
        costWithLoss: "1.5000",
        suggestedPrice: "1.50",
        minSellPrice: "1.20",
        overrideSellPrice: "1.50",
        active: true,
      })
      .returning();

    const [prodCaneca] = await db
      .insert(products)
      .values({
        code: "PRO-CNK-SUB325ML",
        name: "Caneca de Porcelana Sublimada 325ml",
        category: "papelaria_personalizada",
        description: "Caneca branca de porcelana com estampa em sublimação Epson L3150.",
        salesUnit: "UN",
        printerId: printerL3150.id,
        defaultYieldPerSheet: 1,
        yieldFactor: "1.0000",
        lossMarginPercent: "5.00",
        taxPercent: "6.00",
        cardTaxPercent: "3.16",
        targetMarginPercent: "55.00",
        calculatedBaseCost: "14.5000",
        costWithLoss: "15.2250",
        suggestedPrice: "38.00",
        minSellPrice: "32.00",
        overrideSellPrice: "38.00",
        active: true,
      })
      .returning();

    // 8. Financial Accounts
    const [accCaixa] = await db
      .insert(financialAccounts)
      .values({
        name: "Caixa Loja",
        type: "cash",
        accountNumber: "CX-LOJA-01",
        balance: "3558.00",
        active: true,
      })
      .returning();

    const [accInter] = await db
      .insert(financialAccounts)
      .values({
        name: "Banco Inter",
        type: "bank",
        accountNumber: "Ag 0001 / C/C 882910-4",
        balance: "4636.50",
        active: true,
      })
      .returning();

    const [accInfinity] = await db
      .insert(financialAccounts)
      .values({
        name: "InfinitePay",
        type: "gateway",
        accountNumber: "WALLET-INF-9912",
        balance: "2132.50",
        active: true,
      })
      .returning();

    await db.insert(financialAccounts).values({
      name: "VTO Digital",
      type: "bank",
      accountNumber: "C/C 19283-0",
      balance: "0.00",
      active: true,
    });

    await db.insert(financialAccounts).values({
      name: "Itaú Unibanco",
      type: "bank",
      accountNumber: "Ag 1234 / C/C 56789-0",
      balance: "12500.00",
      active: true,
    });

    await db.insert(financialAccounts).values({
      name: "Cofre Loja",
      type: "cash",
      accountNumber: "COFRE-SEG-01",
      balance: "5000.00",
      active: true,
    });

    // 9. Financial Transactions
    const transactionsData = [
      { code: "CUP-003798", desc: "Cupom Não Fiscal 003798", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "17.17", method: "Dinheiro" },
      { code: "PV-0000101", desc: "Venda balcão PV-0000101", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "45.00", method: "PDV" },
      { code: "PV-0000008", desc: "Venda balcão PV-0000008", cat: "Link de Pagamento", acc: accInfinity.name, accId: accInfinity.id, val: "252.50", method: "InfinitePay" },
      { code: "PV-4978503", desc: "Venda balcão PV-4978503", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "45.00", method: "PDV" },
      { code: "PV-7343042", desc: "Venda balcão PV-7343042", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "95.00", method: "PDV" },
      { code: "PV-2108521", desc: "Venda balcão PV-2108521", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "130.00", method: "PDV" },
      { code: "PV-9035936", desc: "Venda balcão PV-9035936", cat: "Venda Balcão", acc: accInter.name, accId: accInter.id, val: "95.00", method: "PIX" },
      { code: "PV-7307135", desc: "Venda balcão PV-7307135", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "130.00", method: "PDV" },
      { code: "PV-6227402", desc: "Venda balcão PV-6227402", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "98.00", method: "PDV" },
      { code: "PV-0971447", desc: "Venda balcão PV-0971447", cat: "Venda Balcão", acc: accCaixa.name, accId: accCaixa.id, val: "98.00", method: "PDV" },
      { code: "PV-9027315", desc: "Venda balcão PV-9027315", cat: "Dinheiro", acc: accCaixa.name, accId: accCaixa.id, val: "98.00", method: "Dinheiro" },
      { code: "PV-7716919", desc: "Venda balcão PV-7716919", cat: "Venda Balcão", acc: accInter.name, accId: accInter.id, val: "91.50", method: "PIX" },
      { code: "PV-0120108", desc: "Venda balcão PV-0120108", cat: "Venda Balcão", acc: accInter.name, accId: accInter.id, val: "130.00", method: "PIX" },
      { code: "PAG-000102", desc: "Compra Papel Offset 180g Suzano", cat: "Insumos e Papéis", acc: accInter.name, accId: accInter.id, val: "420.00", method: "Boleto" },
      { code: "REC-000921", desc: "Sabor & Arte Bar Pedido Cardápios", cat: "Faturado Mensal", acc: accInter.name, accId: accInter.id, val: "850.00", method: "PIX" },
    ];

    for (const t of transactionsData) {
      await db.insert(financialTransactions).values({
        code: t.code,
        description: t.desc,
        type: t.code.startsWith("PAG") ? "expense" : "income",
        category: t.cat,
        costCenter: "Loja Física",
        accountId: t.accId,
        accountName: t.acc,
        dueDate: new Date(),
        paymentDate: new Date(),
        amount: t.val,
        status: "paid",
        paymentMethod: t.method,
      });
    }

    // 10. Receipt Matching Screenshot 3 (003798 for Raphaela Pinheiro)
    const [orderReceipt] = await db
      .insert(quotesOrders)
      .values({
        code: "CUP-003798",
        type: "order",
        clientId: client2.id,
        clientName: client2.name,
        clientDocument: client2.document,
        clientPhone: client2.mobile,
        clientEmail: client2.email,
        status: "completed",
        subtotalAmount: "18.00",
        discountAmount: "0.83",
        freightAmount: "0.00",
        totalAmount: "17.17",
        paymentMethod: "cash",
        paymentStatus: "paid",
        shippingMethod: "pickup",
        artApprovalStatus: "approved",
        notes: "Não deixe de aproveitar as nossas promoções!!!",
        operatorName: userAdmin.name,
      })
      .returning();

    await db.insert(quoteOrderItems).values({
      orderId: orderReceipt.id,
      productId: prodTopoBolo.id,
      productName: "TOPO BOLO PERSONALIZADO",
      quantity: 1,
      unitCost: "14.25",
      unitPrice: "15.00",
      totalPrice: "14.25",
    });

    await db.insert(quoteOrderItems).values({
      orderId: orderReceipt.id,
      productId: prodFolder.id,
      productName: "IMPRESSAO XEROX A4 LASER OFFSET 75GR",
      quantity: 2,
      unitCost: "1.46",
      unitPrice: "1.50",
      totalPrice: "2.92",
    });

    // 11. Communication Templates (6 Templates)
    await db.insert(communicationTemplates).values([
      {
        channel: "whatsapp",
        code: "wa_quote_sent",
        title: "Envio de Orçamento Gráfica",
        body: "Olá {{nome_cliente}}, tudo bem? Segue o seu orçamento *{{codigo_pedido}}* no valor total de *{{valor_total}}*.\n\nVocê pode visualizar os detalhes e aprovar no link: {{link_aprovacao}}\n\nQualquer dúvida, estamos à disposição!",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}", "{{valor_total}}", "{{link_aprovacao}}"]),
        active: true,
      },
      {
        channel: "whatsapp",
        code: "wa_art_approval",
        title: "Solicitação de Aprovação de Arte",
        body: "Olá {{nome_cliente}}! A arte digital do pedido *{{codigo_pedido}}* está pronta para sua validação final.\n\nPor favor acesse o portal de aprovação: {{link_aprovacao}}\nConfira os textos e cores antes de autorizar a impressão.",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}", "{{link_aprovacao}}"]),
        active: true,
      },
      {
        channel: "whatsapp",
        code: "wa_order_approved",
        title: "Pedido e Arte Aprovados",
        body: "Oba {{nome_cliente}}! A arte do pedido *{{codigo_pedido}}* foi APROVADA e o pedido já foi encaminhado para a fila de produção!",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}"]),
        active: true,
      },
      {
        channel: "whatsapp",
        code: "wa_in_printing",
        title: "Pedido em Produção e Impressão",
        body: "Notícia boa! Seu pedido *{{codigo_pedido}}* já entrou na fase de IMPRESSÃO DIGITAL nas nossas máquinas.",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}"]),
        active: true,
      },
      {
        channel: "whatsapp",
        code: "wa_ready_for_pickup",
        title: "Pedido Pronto para Retirada / Envio",
        body: "Eba {{nome_cliente}}! Seu pedido *{{codigo_pedido}}* passou do acabamento e está *PRONTO PARA RETIRADA* no balcão da gráfica!",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}"]),
        active: true,
      },
      {
        channel: "email",
        code: "email_quote_sent",
        title: "Proposta Comercial & Orçamento PDF",
        subject: "Orçamento {{codigo_pedido}} - {{empresa_nome}}",
        body: "<h2>Prezado(a) {{nome_cliente}},</h2><p>Agradecemos o seu contato. Segue em anexo a sua proposta comercial referente ao pedido <strong>{{codigo_pedido}}</strong>.</p><p>Valor Total: <strong>{{valor_total}}</strong></p><p><a href='{{link_aprovacao}}' style='background:#0284c7;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>Visualizar Proposta em PDF</a></p>",
        variables: JSON.stringify(["{{nome_cliente}}", "{{codigo_pedido}}", "{{valor_total}}", "{{link_aprovacao}}"]),
        active: true,
      },
    ]);

    // 12. WhatsApp Config
    await db.insert(whatsappConfig).values({
      instanceName: "Baileys Main Instance (Baileys v6.7.0)",
      status: "connected",
      connectedPhone: "+55 (21) 97886-9414",
      botEnabled: true,
      botGreetingMsg: "Olá! Bem-vindo à VTDIGITAL ART STUDIO. Como podemos te ajudar hoje?\n\n1️⃣ - Solicitar Novo Orçamento\n2️⃣ - Aprovação de Arte Digital\n3️⃣ - Consultar Status do Pedido\n4️⃣ - Falar com Atendente Humano",
      botSecurityToken: "sec_token_grafica_9921",
    });

    // 13. System Settings (Screenshot 3 Company Details)
    const defaultSettings = [
      { key: "company_name", value: "VTDIGITAL ART STUDIO", category: "general" },
      { key: "company_trade_name", value: "VTDIGITAL ART STUDIO", category: "general" },
      { key: "company_cnpj", value: "30.189.224/0001-54", category: "general" },
      { key: "company_phone", value: "(21) 2038-3504", category: "general" },
      { key: "company_whatsapp", value: "(21) 97886-9414", category: "general" },
      { key: "company_email", value: "contato.vt@vtdigital.com", category: "general" },
      { key: "company_address", value: "RUA ARAQUEM", category: "general" },
      { key: "company_number", value: "910", category: "general" },
      { key: "company_neighborhood", value: "BANGU", category: "general" },
      { key: "company_city", value: "RIO DE JANEIRO", category: "general" },
      { key: "company_uf", value: "RJ", category: "general" },
      { key: "company_logo_url", value: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80", category: "general" },
      { key: "infinitepay_api_key", value: "inf_live_pk_89217389127389127391283", category: "infinitepay" },
      { key: "superfrete_token", value: "superfrete_tok_991283912839", category: "superfrete" },
      { key: "default_hourly_labor", value: "45.00", category: "pricing" },
      { key: "default_target_margin", value: "60.00", category: "pricing" },
    ];

    for (const s of defaultSettings) {
      await db.insert(systemSettings).values(s);
    }

    // 14. API Keys
    await db.insert(apiKeys).values([
      { name: "Integração Telefonia VOIP", key: "gk_voip_89127391827391287319", permissions: "read,write" },
      { name: "Automação Comercial N8N", key: "gk_auto_1029381029381029381", permissions: "read,write" },
    ]);

    // 15. Open PDV Shift
    await db.insert(pdvShifts).values({
      operatorName: userAdmin.name,
      openingBalance: "150.00",
      cashTotal: "1250.00",
      cardTotal: "2132.50",
      pixTotal: "830.00",
      status: "open",
    });

    console.log("Database seeded successfully with VTDIGITAL company settings and 6+ demo records!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error: String(error) };
  }
}
