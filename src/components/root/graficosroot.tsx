"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { api_allEstablishments } from "@/services/axios.services";

interface Establishment {
    id: number;
    attributes: {
        name: string;
        Region: string | null;
    };
}

interface ChartData {
    region: string;
    count: number;
}

const allRegions = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén",
    "Magallanes y de la Antártica Chilena",
];

const chartConfig = {
    views: {
        label: "Establecimientos",
    },
    count: {
        label: "Cantidad",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export default function GraficosRoot() {
    const [chartData, setChartData] = React.useState<ChartData[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api_allEstablishments();
                const establishments: Establishment[] = response.data.data;

                const regionCounts: { [key: string]: number } = {};
                establishments.forEach((establishment) => {
                    const region = establishment.attributes.Region || "Sin región";
                    regionCounts[region] = (regionCounts[region] || 0) + 1;
                });

                const formattedData: ChartData[] = allRegions.map((region) => ({
                    region,
                    count: regionCounts[region] || 0,
                }));

                setChartData(formattedData);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="md:col-span-2 overflow-x-auto mb-2">
            <CardHeader>
                <CardTitle>Establecimientos por Región</CardTitle>
                <CardDescription>
                    Distribución de establecimientos en las regiones de Chile
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div> {/* Habilita el desplazamiento horizontal */}
                    <div style={{ minWidth: "1200px" }}> {/* Ancho fijo del gráfico */}
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[400px] w-full"
                        >
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
                                width={1200} // Fija el ancho del gráfico
                                height={400} // Fija la altura del gráfico
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="region"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => value}
                                    angle={-45} // Rotar etiquetas para mejor visualización
                                    textAnchor="end"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    domain={[0, Math.ceil(Math.max(...chartData.map(data => data.count)) * 1.1)]} // Añade un 10% al valor máximo
                                    tickFormatter={(value) => value.toFixed(0)} // Muestra solo enteros
                                    allowDecimals={false} // Evita que se generen ticks con decimales
                                    ticks={Array.from(
                                        { length: Math.ceil(Math.max(...chartData.map((data) => data.count)) + 1) },
                                        (_, i) => i
                                    )} // Genera ticks manualmente desde 0 hasta el valor máximo
                                />

                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[150px]"
                                            nameKey="count"
                                            labelFormatter={(value) => `Región: ${value}`}
                                        />
                                    }
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
