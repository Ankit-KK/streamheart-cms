import { getPayouts, getActiveCreators, recordPayout } from './actions';
import Link from 'next/link';

// Helper function to convert Paise (from DB) to formatted Rupees (for UI)
const formatToRupees = (paise: number | null | undefined) => {
  if (!paise) return '₹0.00';
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default async function PayoutsPage(props: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const payouts = await getPayouts();
  const activeCreators = await getActiveCreators();

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4 font-medium">
        ← Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payouts Management</h1>
      </div>
      
      {searchParams.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-red-700 font-medium">{searchParams.error}</p>
        </div>
      )}
      
      {searchParams.success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
          <p className="text-green-700 font-medium">{searchParams.success}</p>
        </div>
      )}

      {/* Record Payout Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Record New Payout</h2>
        <form action={recordPayout} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Creator *</label>
              <select name="creatorId" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                <option value="">-- Choose an active creator --</option>
                {activeCreators.map((c) => (
                  <option key={c.id} value={c.id}>
                    @{c.creatorHandle} ({c.creatorCode}) - Rate: {c.payoutRate}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Amount (₹) *</label>
              <input name="grossInr" type="number" required min="0" step="0.01" placeholder="e.g. 500.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refunds (₹)</label>
              <input name="refundsInr" type="number" min="0" step="0.01" defaultValue="0" placeholder="e.g. 0.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout Rate (%) *</label>
              <input name="payoutRate" type="number" required min="0" max="100" step="0.01" placeholder="e.g. 85.00" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
              <input name="periodStart" type="date" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
              <input name="periodEnd" type="date" required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
              <input name="transactionRef" type="text" placeholder="e.g. UTR123456789" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="paymentMethod" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors py-2 px-6">
            Record Payout & Update Ledger
          </button>
        </form>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Payouts ({payouts.length})</h2>
        </div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payouts recorded yet.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      @{p.creatorHandle || 'Unknown'}
                      <div className="text-xs text-gray-500 font-normal">{p.creatorCode || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.periodStart ? new Date(p.periodStart).toLocaleDateString() : '-'} to {p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatToRupees(p.grossInr)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatToRupees(p.refundsInr)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.payoutRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">{formatToRupees(p.netPayoutInr)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status}
                      </span>
                      {p.transactionReference && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">{p.transactionReference}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
