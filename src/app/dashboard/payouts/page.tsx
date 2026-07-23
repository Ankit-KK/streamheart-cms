import { getPayouts, getActiveCreators, recordPayout, deletePayout, generateBulkPayouts } from './actions';
import Link from 'next/link';

const formatToRupees = (paise: number | null | undefined) => {
  if (!paise) return '₹0.00';
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default async function PayoutsPage(props: {
  searchParams: Promise<{ error?: string; success?: string; tab?: string; creatorSearch?: string; historySearch?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || 'new'; 
  
  const payouts = await getPayouts(searchParams.historySearch);
  const allActiveCreators = await getActiveCreators();

  const filteredCreators = searchParams.creatorSearch 
    ? allActiveCreators.filter(c => 
        c.creatorHandle.toLowerCase().includes(searchParams.creatorSearch!.toLowerCase()) || 
        c.creatorCode.toLowerCase().includes(searchParams.creatorSearch!.toLowerCase())
      )
    : allActiveCreators;

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4 font-medium">
        ← Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payouts Management</h1>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link href="/dashboard/payouts?tab=new" className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${activeTab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
              ➕ Record New Payout
            </Link>
            <Link href="/dashboard/payouts?tab=history" className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
              📊 Payout History ({payouts.length})
            </Link>
          </nav>
        </div>
      </div>
      
      {searchParams.error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md"><p className="text-red-700 font-medium">{searchParams.error}</p></div>}
      {searchParams.success && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md"><p className="text-green-700 font-medium">{searchParams.success}</p></div>}

      {activeTab === 'new' ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Process a New Payout</h2>
          <form action={recordPayout} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search & Select Creator *</label>
                <form action="/dashboard/payouts" method="GET" className="flex gap-2 mb-2">
                  <input type="hidden" name="tab" value="new" />
                  <input name="creatorSearch" type="text" placeholder="Search by handle or code..." defaultValue={searchParams.creatorSearch || ''} className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                  <button type="submit" className="bg-gray-200 text-gray-700 text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-300 transition-colors">Search</button>
                  {searchParams.creatorSearch && <Link href="/dashboard/payouts?tab=new" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 underline flex items-center">Clear</Link>}
                </form>
                <select name="creatorId" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">-- Choose an active creator --</option>
                  {filteredCreators.map((c) => (<option key={c.id} value={c.id}>@{c.creatorHandle} ({c.creatorCode}) - Rate: {c.payoutRate}%</option>))}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Gross Amount (₹) *</label><input name="grossInr" type="number" required min="0" step="0.01" placeholder="e.g. 500.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Refunds (₹)</label><input name="refundsInr" type="number" min="0" step="0.01" defaultValue="0" placeholder="e.g. 0.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payout Rate (%) *</label><input name="payoutRate" type="number" required min="0" max="100" step="0.01" placeholder="e.g. 85.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label><input name="periodStart" type="date" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label><input name="periodEnd" type="date" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label><input name="transactionRef" type="text" placeholder="e.g. UTR123456789" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label><select name="paymentMethod" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"><option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option><option value="Other">Other</option></select></div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors py-2 px-6">Record Payout & Update Ledger</button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* HISTORY SEARCH BAR */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <form action="/dashboard/payouts" method="GET" className="flex gap-2 items-center">
              <input type="hidden" name="tab" value="history" />
              <input name="historySearch" type="text" placeholder="Search history by creator handle, code, or UTR..." defaultValue={searchParams.historySearch || ''} className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <button type="submit" className="bg-indigo-600 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-indigo-500 transition-colors">Search History</button>
              {searchParams.historySearch && <Link href="/dashboard/payouts?tab=history" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 underline">Clear</Link>}
            </form>
          </div>

          {/* BULK GENERATE ADMIN CARD */}
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">⚡ Bulk Generate Payouts</h3>
            <p className="text-sm text-indigo-700 mb-4">Automatically calculate outstanding dues from the ledger and generate 'GENERATED' payout records for all active creators.</p>
            <form action={generateBulkPayouts} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-indigo-800 mb-1">Period Start</label>
                <input name="periodStart" type="date" required className="rounded-md border border-indigo-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-indigo-800 mb-1">Period End</label>
                <input name="periodEnd" type="date" required className="rounded-md border border-indigo-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors py-2 px-6">
                Generate Bulk Payouts
              </button>
            </form>
          </div>

          {/* PAYOUT HISTORY TABLE WITH DELETE */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refunds</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No payouts found.</td></tr>
                  ) : (
                    payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">@{p.creatorHandle || 'Unknown'}<div className="text-xs text-gray-500 font-normal">{p.creatorCode || ''}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.periodStart ? new Date(p.periodStart).toLocaleDateString() : '-'} to {p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatToRupees(p.grossInr)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatToRupees(p.refundsInr)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.payoutRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">{formatToRupees(p.netPayoutInr)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                          {p.transactionReference && <div className="text-xs text-gray-500 mt-1 font-mono">{p.transactionReference}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <form action={deletePayout}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="creatorId" value={p.creatorId} />
                            <input type="hidden" name="netPayoutInr" value={p.netPayoutInr || 0} />
                            <button type="submit" className="text-red-600 hover:text-red-900 font-medium text-xs border border-red-200 hover:border-red-500 rounded px-2 py-1 transition-colors" onClick={(e) => { if(!confirm('Delete this payout and reverse the ledger entry?')) e.preventDefault(); }}>
                              Delete & Reverse
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
