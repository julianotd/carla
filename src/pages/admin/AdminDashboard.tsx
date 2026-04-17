
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="rounded-md border bg-muted/50 p-8 text-center">
        <h3 className="text-lg font-medium">Bem-vindo à Área Administrativa</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o menu lateral para gerenciar o conteúdo do site, serviços e agendamentos.
        </p>
      </div>
    </div>
  );
}
