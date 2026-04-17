
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { CreditCard, Users, CalendarCheck, TrendingUp, Loader2 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function AnalyticsAdmin() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin", "analytics"],
        queryFn: async () => {
            // 1. Fetch Appointments (Confirmed/Completed)
            const { data: appointments, error: apptError } = await supabase
                .from("appointments")
                .select(`
            id, 
            status, 
            starts_at, 
            services (title, price_text)
        `)
                .neq("status", "cancelled");

            if (apptError) throw apptError;

            // Process Data
            const totalAppts = appointments.length;

            // Calculate Revenue (Approximation - assuming price_text is like "R$ 150")
            // Better way would be to have a numeric price column. Parsing for MVP.
            let totalRevenue = 0;
            const serviceCounts: Record<string, number> = {};

            appointments.forEach(appt => {
                // Revenue
                const priceString = appt.services?.price_text || "0";
                const price = parseFloat(priceString.replace(/[^0-9,]/g, '').replace(',', '.'));
                if (!isNaN(price)) totalRevenue += price;

                // Service Count
                const serviceName = appt.services?.title || "Outro";
                serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
            });

            // Chart Data: Last 7 Days
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 6 - i);
                return d;
            });

            const dailyData = last7Days.map(day => {
                const count = appointments.filter(a => isSameDay(new Date(a.starts_at), day)).length;
                return {
                    name: format(day, "EEE", { locale: ptBR }),
                    fullDate: format(day, "dd/MM"),
                    agendamentos: count
                };
            });

            const pieData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));

            return {
                totalAppts,
                totalRevenue,
                dailyData,
                pieData
            };
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Visão geral do desempenho da clínica.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Estimada (Total)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats?.totalRevenue.toFixed(2).replace('.', ',')}</div>
                        <p className="text-xs text-muted-foreground">Baseado nos agendamentos ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAppts}</div>
                        <p className="text-xs text-muted-foreground">Confirmados ou Pendentes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12%</div>
                        <p className="text-xs text-muted-foreground">Em relação ao mês anterior (Simulado)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Bar Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Agendamentos por Dia</CardTitle>
                        <CardDescription>Últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="agendamentos" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Serviços Populares</CardTitle>
                        <CardDescription>Distribuição por tipo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats?.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {stats?.pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1 text-xs">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span>{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
