export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">テストページ</h1>
        <p className="text-gray-600">このページが表示されれば、基本的なNext.jsアプリは動作しています。</p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ Next.js正常動作中</p>
          <p className="text-sm text-gray-600 mt-2">
            現在時刻: {new Date().toLocaleString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  )
}