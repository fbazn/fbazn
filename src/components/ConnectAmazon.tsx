'use client'

export default function ConnectAmazon() {
  const handleFakeConnect = () => {
    alert('Simulated Amazon seller account connected ✅ (sandbox)');
  }

  return (
    <button
      onClick={handleFakeConnect}
      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-2 rounded"
    >
      Simulate Amazon Connect
    </button>
  );
}
