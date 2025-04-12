import { useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import revisado from "../assets/img/icons/nao-revisado.png"

export default function Index() {
  useEffect(() => {
    document.title = "AnnotaPS"
  }, [])

  return (
    <div className="p-6 space-y-8">
      {/* Título da página */}
      <div>
        <h1 className="text-2xl text-white font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral dos relatórios</p>
      </div>

      {/* Relatórios numéricos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Usuários Ativos" value="128" />
        <StatCard title="Anotações Hoje" value="56" />
        <StatCard title="Setores Ativos" value="12" />
        <StatCard title="Tickets Pendentes" value="8" />
      </section>

      {/* Relatórios gráficos */}
      <section>
        <h2 className="text-xl text-white font-semibold mb-4">Relatórios Visuais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Anotações por dia</CardTitle>
              <CardDescription>Volume de registros na semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted flex items-center justify-center rounded">
                <span className="text-muted-foreground">[Gráfico de linhas]</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por setor</CardTitle>
              <CardDescription>Comparativo percentual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted flex items-center justify-center rounded">
                <span className="text-muted-foreground">[Gráfico de pizza]</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lista de anotações */}
      <section>
        <h2 className="text-xl text-white font-semibold mb-4">Anotações Recentes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NoteCard
            title="Paciente João"
            content="Evolução positiva observada nos últimos dias. Continuidade com medicação."
            badge={revisado}
          />
          <NoteCard
            title="Paciente Maria"
            content="Solicitada nova avaliação psicológica para próxima semana."
            badge="Psicologia"
          />
          <NoteCard
            title="Setor Psiquiatria"
            content="Discussão de casos marcada para sexta-feira às 14h."
            badge="Setor"
          />
        </div>
      </section>
    </div>
  )
}

// Componente de estatística
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
    </Card>
  )
}

// Componente de anotação
// Componente de anotação
function NoteCard({
    title,
    content,
    badge,
  }: {
    title: string
    content: string
    badge: string
  }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center">
            {typeof badge === "string" && badge.endsWith(".png") ? (
              <Badge><img src={badge} alt="ícone" className="h-5 w-5" /></Badge>
            ) : (
              <Badge>{badge}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{content}</p>
          <Progress value={100} className="mt-4" />
        </CardContent>
      </Card>
    )
  }
  