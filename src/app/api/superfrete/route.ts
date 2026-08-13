import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ORIGIN_ZIP = "01310-100";

interface FreightOption {
  id: string;
  name: string;
  price: string;
  deliveryDays: number;
  carrier: string;
  serviceCode: string;
}

interface SuperFreteService {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  delivery_time?: unknown;
  service_code?: unknown;
  company?: { name?: unknown } | null;
}

function simulatedOptions(weightKg: number): FreightOption[] {
  const basePac = 18.5 + weightKg * 4.2;
  const baseSedex = 28.9 + weightKg * 7.5;
  const baseJadlog = 22.0 + weightKg * 5.0;

  return [
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
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
    }

    const destZip = String(body.destinationZip || "").replace(/\D/g, "");
    if (destZip.length !== 8) {
      return NextResponse.json(
        { error: "CEP de destino inválido — informe os 8 dígitos (ex: 01310-100)." },
        { status: 400 }
      );
    }

    const weightRaw = Number(body.weightKg ?? 0.5);
    const weightKg = Number.isFinite(weightRaw) ? weightRaw : NaN;
    if (Number.isNaN(weightKg) || weightKg <= 0 || weightKg > 30) {
      return NextResponse.json(
        { error: "Peso inválido — informe um valor entre 0.01kg e 30kg." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SUPERFRETE_API_KEY;
    let options: FreightOption[] = [];
    let source: "superfrete" | "simulado" = "simulado";

    // Integração real com a API SuperFrete quando a chave estiver configurada
    if (apiKey) {
      try {
        const apiRes = await fetch("https://api.superfrete.com/api/v1/freight/quote", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: { postal_code: ORIGIN_ZIP.replace(/\D/g, "") },
            to: { postal_code: destZip },
            package: { weight: weightKg, height: 2, width: 20, length: 30 },
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (apiRes.ok) {
          const data = (await apiRes.json()) as { services?: SuperFreteService[] };
          const services = Array.isArray(data.services) ? data.services : [];
          options = services
            .filter((s) => Boolean(s && s.name && s.price !== undefined))
            .map((s, index) => ({
              id: `superfrete_real_${index}`,
              name: String(s.name),
              price: String(Number(s.price || 0).toFixed(2)),
              deliveryDays: Number(s.delivery_time || 0),
              carrier: String(s.company?.name || "Correios"),
              serviceCode: String(s.id || s.service_code || `SF_${index}`),
            }));
          if (options.length > 0) source = "superfrete";
        }
      } catch (error) {
        console.error("SuperFrete API error (fallback para simulação):", error);
      }
    }

    if (options.length === 0) {
      options = simulatedOptions(weightKg);
    }

    return NextResponse.json({
      success: true,
      source,
      originZip: ORIGIN_ZIP,
      destinationZip: destZip,
      options,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
