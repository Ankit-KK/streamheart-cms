import { getCreators, addCreator } from './actions';

export default async function CreatorsPage(props: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const allCreators = await getCreators();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Creators Management</h1>
      
      {/* Success/Error Messages */}
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

      {/* Add Creator Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Creator</h2>
        <form action={addCreator} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input name="handle" type="text" required placeholder="Creator Handle" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          <input name="code" type="text" required placeholder="Creator Code" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          <input name="upi" type="text" required placeholder="UPI ID" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          <input name="rate" type="number" required placeholder="Payout %" className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          <button type="submit" className="bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors py-2">
            Add Creator
          </button>
        </form>
      </div>

      {/* Creators Table */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.upiId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.payoutRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {creator.status}
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
