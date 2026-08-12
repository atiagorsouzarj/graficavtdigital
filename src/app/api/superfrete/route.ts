import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const destZip = (body.destinationZip || "01000-000").replace(/\D/g, "");
    const weight = parseFloat(body.weightKg || "0.5");

    // SuperFrete calculation simulation with real rates logic
    const basePac = 18.50 + weight * 4.2;
    const baseSedex = 28.90 + weight * 7.5;
    const baseJadlog = 22.00 + weight * 5.0;

    const options = [
      {
        id: "superfrete_pac",
        name: "Correios PAC (SuperFrete)",
        price: basePac.toFixed(2),
        deliveryDays: 5,
        carrier: "Correios",
        serviceCode: "04510",
      },
      {
        id: "superfrete_sedex",
        name: "Correios SEDEX Express (SuperFrete)",
        price: baseSedex.toFixed(2),
        deliveryDays: 2,
        carrier: "Correios",
        serviceCode: "04016",
      },
      {
        id: "jadlog",
        name: "Jadlog Package (.Package)",
        price: baseJadlog.toFixed(2),
        deliveryDays: 3,
        carrier: "Jadlog",
        serviceCode: "JAD_PKG",
      },
      {
        id: "motoboy",
        name: "Entrega Expressa via Motoboy (Raio 15km)",
        price: "25.00",
        deliveryDays: 1,
        carrier: "Motoboy Loja",
        serviceCode: "LOCAL_MOTO",
      },
      {
        id: "pickup",
        name: "Retirada no Balcão da Gráfica",
        price: "0.00",
        deliveryDays: 0,
        carrier: "Balcão",
        serviceCode: "PICKUP",
      },
    ];

    return NextResponse.json({
      success: true,
      originZip: "01310-100",
      destinationZip: destZip,
      options,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
