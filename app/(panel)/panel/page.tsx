let stats;
let recent;

try {
  stats = await getDashboardStats();
} catch (error) {
  return (
    <div className="card p-6">
      <h1 className="text-xl font-bold">İstatistik hatası</h1>
      <pre className="mt-4 whitespace-pre-wrap break-words text-sm text-red-600">
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}

try {
  recent = await listInvoices({ limit: 5 });
} catch (error) {
  return (
    <div className="card p-6">
      <h1 className="text-xl font-bold">Fatura listesi hatası</h1>
      <pre className="mt-4 whitespace-pre-wrap break-words text-sm text-red-600">
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}
