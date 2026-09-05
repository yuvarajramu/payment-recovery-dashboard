'use client'

import { useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Filter,
  LayoutDashboard,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
  XCircle,
  Zap,
} from 'lucide-react'

const payments = [
  { id: 'pay_9X2K7L', customer: 'Aarav Mehta', cause: 'Insufficient funds', action: 'Retry in 24 hours', status: 'In recovery', amount: '₹2,400', time: '12 min ago' },
  { id: 'pay_8F4M1Q', customer: 'Priya Sharma', cause: 'Card expired', action: 'Send update link', status: 'Recovered', amount: '₹6,800', time: '38 min ago' },
  { id: 'pay_7D8N3P', customer: 'Rohan Kapoor', cause: 'Bank decline', action: 'Route to backup card', status: 'Pending', amount: '₹1,200', time: '1 hr ago' },
  { id: 'pay_6A5C9R', customer: 'Nisha Iyer', cause: '3DS authentication', action: 'Request verification', status: 'Recovered', amount: '₹4,100', time: '2 hrs ago' },
  { id: 'pay_5B2H8T', customer: 'Kabir Singh', cause: 'Network timeout', action: 'Retry instantly', status: 'Failed', amount: '₹850', time: '3 hrs ago' },
]

const events = [
  { time: '10:42:18', label: 'Recovery attempt initiated', detail: 'Smart retry policy · Attempt 2 of 3', tone: 'success' },
  { time: '10:41:56', label: 'Payment failure classified', detail: 'Root cause: Insufficient funds · Confidence 94%', tone: 'violet' },
  { time: '10:41:54', label: 'Payment failed', detail: 'Gateway response: do_not_honor', tone: 'danger' },
  { time: '10:41:52', label: 'Recovery policy selected', detail: 'Rule: Retry after 24 hours', tone: 'neutral' },
]

function MetricCard({ label, value, change, icon: Icon, accent }: { label: string; value: string; change: string; icon: typeof Activity; accent: string }) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <div className={`metric-icon ${accent}`}><Icon aria-hidden="true" /></div>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-positive"><ArrowUpRight aria-hidden="true" /> {change}</span>
        <span>vs. last 30 days</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Recovered: 'status-success',
    'In recovery': 'status-warning',
    Pending: 'status-neutral',
    Failed: 'status-danger',
  }
  const Icon = status === 'Recovered' ? CheckCircle2 : status === 'Failed' ? XCircle : Clock3
  return <span className={`status-badge ${styles[status]}`}><Icon aria-hidden="true" />{status}</span>
}

export function PaymentDashboard() {
  const [lastUpdated, setLastUpdated] = useState('just now')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(payments[0].id)

  function refreshData() {
    setRefreshing(true)
    window.setTimeout(() => { setRefreshing(false); setLastUpdated('just now') }, 650)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="sidebar hidden lg:flex">
        <div className="flex items-center gap-3 px-3">
          <div className="brand-mark"><Zap aria-hidden="true" /></div>
          <span className="text-sm font-semibold tracking-tight">recover<span className="text-positive">ly</span></span>
        </div>
        <nav className="mt-12 flex flex-col gap-2" aria-label="Main navigation">
          <a className="nav-item nav-active" href="#overview"><LayoutDashboard aria-hidden="true" /> Overview</a>
          <a className="nav-item" href="#payments"><CreditCard aria-hidden="true" /> Payments <span className="nav-count">15</span></a>
          <a className="nav-item" href="#audit"><Activity aria-hidden="true" /> Audit log</a>
        </nav>
        <div className="mt-auto rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-positive"><ShieldCheck aria-hidden="true" /> System healthy</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">All recovery automations are operating normally.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="topbar">
          <div className="flex items-center gap-3 lg:hidden"><div className="brand-mark"><Zap aria-hidden="true" /></div><span className="font-semibold">recover<span className="text-positive">ly</span></span></div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><span>Workspace</span><span className="text-border">/</span><span className="text-foreground">Recovery overview</span></div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">Updated {lastUpdated}</span>
            <button className="icon-button" aria-label="Search"><Search aria-hidden="true" /></button>
            <button className="refresh-button" onClick={refreshData} disabled={refreshing}><RefreshCw aria-hidden="true" className={refreshing ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh</span></button>
            <div className="avatar" aria-label="Account: AM">AM</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <section id="overview" className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="eyebrow text-positive">Payments intelligence</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Recovery overview</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Monitor failed payments, automated actions, and the revenue your recovery engine brings back.</p></div>
            <button className="filter-button"><Filter aria-hidden="true" /> Last 30 days <ArrowDownToLine aria-hidden="true" /></button>
          </section>

          <section className="grid gap-4 md:grid-cols-3" aria-label="Recovery metrics">
            <MetricCard label="Failed payments" value="15" change="8.4%" icon={CreditCard} accent="metric-coral" />
            <MetricCard label="Recovery rate" value="70%" change="12.6%" icon={Activity} accent="metric-violet" />
            <MetricCard label="Recovered revenue" value="₹10,500" change="18.2%" icon={WalletCards} accent="metric-green" />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div id="payments" className="panel overflow-hidden">
              <div className="panel-header"><div><h2 className="panel-title">Payment recovery queue</h2><p className="panel-subtitle">Live status of failed and recovered transactions</p></div><button className="icon-button" aria-label="More payment options"><MoreHorizontal aria-hidden="true" /></button></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr><th>Payment</th><th>Root cause</th><th>Chosen action</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} onClick={() => setSelectedPayment(payment.id)} className={selectedPayment === payment.id ? 'row-selected' : ''}><td><div className="flex items-center gap-3"><div className="payment-symbol"><CreditCard aria-hidden="true" /></div><div><p className="font-medium text-foreground">{payment.id}</p><p className="mt-1 text-xs text-muted-foreground">{payment.customer} · {payment.time}</p></div></div></td><td className="text-muted-foreground">{payment.cause}</td><td className="text-muted-foreground">{payment.action}</td><td><StatusBadge status={payment.status} /></td><td className="text-right font-medium text-foreground">{payment.amount}</td></tr>)}</tbody></table></div>
              <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground"><span>Showing 5 of 15 payments</span><button className="text-positive hover:underline">View all payments <ArrowUpRight className="inline" aria-hidden="true" /></button></div>
            </div>

            <div id="audit" className="panel"><div className="panel-header"><div><h2 className="panel-title">Audit log</h2><p className="panel-subtitle">Event timeline per payment</p></div><button className="icon-button" aria-label="Open audit log"><ExternalLink aria-hidden="true" /></button></div><div className="border-b border-border px-5 py-4"><div className="flex items-center gap-3"><div className="payment-symbol"><CreditCard aria-hidden="true" /></div><div><p className="font-medium text-foreground">{selectedPayment}</p><p className="mt-1 text-xs text-muted-foreground">Aarav Mehta · ₹2,400</p></div></div></div><div className="flex flex-col gap-0 px-5 py-5">{events.map((event, index) => <div className="timeline-item" key={event.time}><div className={`timeline-dot dot-${event.tone}`}>{index === 0 ? <Sparkles aria-hidden="true" /> : null}</div><div className="min-w-0 pb-6"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-foreground">{event.label}</p><time className="shrink-0 font-mono text-[10px] text-muted-foreground">{event.time}</time></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{event.detail}</p></div></div>)}</div><div className="mx-5 mb-5 rounded-lg border border-positive/20 bg-positive/5 p-3"><div className="flex items-center gap-2 text-xs font-medium text-positive"><Sparkles aria-hidden="true" /> AI decision confidence: 94%</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Retry strategy selected from 3 eligible actions.</p></div></div>
          </section>
        </div>
      </div>
    </main>
  )
}
