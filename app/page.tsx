'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Activity, ArrowUpRight, CheckCircle2,
  Clock3, CreditCard, ExternalLink,
  LayoutDashboard, RefreshCw, Search,
  ShieldCheck, Sparkles, WalletCards, XCircle, Zap,
} from 'lucide-react'

const supabase = createClient(
  'https://jbppnvzpoaznxzascdrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicHBudnpwb2F6bnh6YXNjZHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDM1MjcsImV4cCI6MjEwNDA3OTUyN30.ROvSkfWRJKisw3WE7tSLiazzLL2qofT_ID2ZCxT4Iug'
)

interface MetricCardProps {
  label: string
  value: string
  change: string
  icon: React.ElementType
  accent: string
}

function MetricCard({ label, value, change, icon: Icon, accent }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <div className={`metric-icon ${accent}`}><Icon aria-hidden="true" /></div>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-positive">
          <ArrowUpRight aria-hidden="true" />{change}
        </span>
        <span>vs. last 30 days</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    FAILED: 'status-danger', RECOVERED: 'status-success',
    PENDING: 'status-neutral', IN_RECOVERY: 'status-warning',
  }
  const Icon = status === 'RECOVERED' ? CheckCircle2 : status === 'FAILED' ? XCircle : Clock3
  return (
    <span className={`status-badge ${styles[status] || 'status-neutral'}`}>
      <Icon aria-hidden="true" />{status}
    </span>
  )
}

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>('just now')
  const [metrics, setMetrics] = useState({ failed: 0, recovered: 0, rate: 0, revenue: 0 })

  async function fetchData() {
    setRefreshing(true)

    const { data: paymentData } = await supabase
      .from('payments').select('*').order('created_at', { ascending: false }).limit(20)

    const { data: decisionData } = await supabase
      .from('decisions').select('*').order('created_at', { ascending: false }).limit(20)

    if (paymentData) {
      const failed = paymentData.filter((p: any) => p.status === 'FAILED').length
      const recovered = paymentData.filter((p: any) => p.status === 'RECOVERED').length
      const total = paymentData.length
      const rate = total > 0 ? Math.round((recovered / total) * 100) : 0
      const revenue = paymentData
        .filter((p: any) => p.status === 'RECOVERED')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0)
      setMetrics({ failed, recovered, rate, revenue: revenue / 100 })
      setPayments(paymentData)
    }

    if (decisionData) setDecisions(decisionData)
    if (paymentData && paymentData.length > 0) setSelectedPaymentId(paymentData[0].payment_id)

    setRefreshing(false)
    setLastUpdated('just now')
  }

  async function fetchAuditLogs(paymentId: string | null) {
    if (!paymentId) return
    const { data } = await supabase
      .from('audit_logs').select('*')
      .eq('payment_id', paymentId)
      .order('timestamp', { ascending: false })
    if (data) setAuditLogs(data)
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { fetchAuditLogs(selectedPaymentId) }, [selectedPaymentId])

  useEffect(() => {
    const sub = supabase.channel('payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const selectedDecision = decisions.find((d: any) => d.payment_id === selectedPaymentId)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="sidebar hidden lg:flex">
        <div className="flex items-center gap-3 px-3">
          <div className="brand-mark"><Zap aria-hidden="true" /></div>
          <span className="text-sm font-semibold tracking-tight">
            mandate<span className="text-positive">rescue</span>
          </span>
        </div>
        <nav className="mt-12 flex flex-col gap-2">
          <a className="nav-item nav-active" href="#overview">
            <LayoutDashboard aria-hidden="true" />Overview
          </a>
          <a className="nav-item" href="#payments">
            <CreditCard aria-hidden="true" />Payments
            <span className="nav-count">{metrics.failed}</span>
          </a>
          <a className="nav-item" href="#audit">
            <Activity aria-hidden="true" />Audit log
          </a>
        </nav>
        <div className="mt-auto rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-positive">
            <ShieldCheck aria-hidden="true" />System healthy
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            All recovery automations operating normally.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="topbar">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span>Workspace</span><span className="text-border">/</span>
            <span className="text-foreground">Recovery overview</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">Updated {lastUpdated}</span>
            <button className="icon-button"><Search aria-hidden="true" /></button>
            <button className="refresh-button" onClick={fetchData} disabled={refreshing}>
              <RefreshCw aria-hidden="true" className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <section id="overview" className="mb-8">
            <p className="eyebrow text-positive">Payments intelligence</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Recovery overview</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Monitor failed payments, automated decisions, and recovered revenue.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Failed payments" value={String(metrics.failed)} change="Live" icon={CreditCard} accent="metric-coral" />
            <MetricCard label="Recovery rate" value={`${metrics.rate}%`} change="Live" icon={Activity} accent="metric-violet" />
            <MetricCard label="Recovered revenue" value={`₹${metrics.revenue.toLocaleString()}`} change="Live" icon={WalletCards} accent="metric-green" />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div id="payments" className="panel overflow-hidden">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Payment recovery queue</h2>
                  <p className="panel-subtitle">Live status of failed transactions</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr>
                      <th>Payment ID</th><th>Root Cause</th>
                      <th>Chosen Action</th><th>Status</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payments yet. Send a test webhook.</td></tr>
                    ) : payments.map((p: any) => {
                      const decision = decisions.find((d: any) => d.payment_id === p.payment_id)
                      return (
                        <tr key={p.payment_id}
                          onClick={() => setSelectedPaymentId(p.payment_id)}
                          className={selectedPaymentId === p.payment_id ? 'row-selected' : ''}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="payment-symbol"><CreditCard aria-hidden="true" /></div>
                              <div>
                                <p className="font-medium text-foreground">{p.payment_id}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{p.customer_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted-foreground">{decision?.root_cause_category || p.normalized_error_code || '—'}</td>
                          <td className="text-muted-foreground">{decision?.chosen_action || '—'}</td>
                          <td><StatusBadge status={p.status} /></td>
                          <td className="text-right font-medium text-foreground">₹{(p.amount_paise / 100).toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="audit" className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Audit log</h2>
                  <p className="panel-subtitle">Event timeline · {selectedPaymentId || '—'}</p>
                </div>
                <button className="icon-button"><ExternalLink aria-hidden="true" /></button>
              </div>
              <div className="flex flex-col gap-0 px-5 py-5">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Select a payment to view its audit trail.</p>
                ) : auditLogs.map((log: any, i: number) => (
                  <div className="timeline-item" key={log.id}>
                    <div className={`timeline-dot dot-${i === 0 ? 'success' : 'neutral'}`}>
                      {i === 0 ? <Sparkles aria-hidden="true" /> : null}
                    </div>
                    <div className="min-w-0 pb-6">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{log.event_type}</p>
                        <time className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </time>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Step {log.step_number}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedDecision && (
                <div className="mx-5 mb-5 rounded-lg border border-positive/20 bg-positive/5 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-positive">
                    <Sparkles aria-hidden="true" />AI Decision: {selectedDecision.chosen_action}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {selectedDecision.reasoning || selectedDecision.policy_applied}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}