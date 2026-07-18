import { getCreators, addCreator } from './actions';

export default async function CreatorsPage(props: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const allCreators = await getCreators();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Creators Management</h1>
      
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

      {/* Combined Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Creator</h2>
        <form action={addCreator} className="space-y-6">
          
          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input name="handle" type="text" required placeholder="Creator Handle *" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="code" type="text" required placeholder="Creator Code *" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="email" type="email" placeholder="Primary Email" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="rate" type="number" step="0.01" placeholder="Payout Rate (%)" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {/* Financial Details Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Financial & Payout Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input name="legalName" type="text" placeholder="Legal Name (as per PAN)" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="pan" type="text" placeholder="PAN Number" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase" />
              <input name="upi" type="text" placeholder="UPI ID" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="bankName" type="text" placeholder="Bank Name" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="accountHolder" type="text" placeholder="Account Holder Name" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="accLast4" type="text" maxLength={4} placeholder="A/c Last 4 Digits" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              <input name="ifsc" type="text" placeholder="IFSC Code" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase" />
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors py-2 px-6">
            Add Creator & Financial Details
          </button>
        </form>
      </div>

      {/* Creators Table with UPI */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Active Creators ({allCreators.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allCreators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No creators found. Add your first creator above!
                  </td>
                </tr>
              ) : (
                allCreators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">@{creator.creatorHandle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{creator.creatorCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.upiId || <span className="text-gray-400 italic">Not set</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.payoutRate ? `${creator.payoutRate}%` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        creator.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {creator.status || 'ACTIVE'}
                      </span>
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
