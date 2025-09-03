export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Smart Press Monitor</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">システムテスト</h2>
          <p className="text-gray-600 mb-4">
            認証なしのシンプルなページです。このページが表示されればNext.jsは正常に動作しています。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-medium text-blue-900">✅ Next.js</h3>
              <p className="text-sm text-blue-700">フレームワーク動作中</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-medium text-green-900">✅ Tailwind CSS</h3>
              <p className="text-sm text-green-700">スタイル適用中</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <p><strong>現在時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
            <p><strong>環境:</strong> Development</p>
          </div>
        </div>
      </main>
    </div>
  )
}