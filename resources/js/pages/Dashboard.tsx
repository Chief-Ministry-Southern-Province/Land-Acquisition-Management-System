export default function Dashboard() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="rounded-lg bg-white p-8 text-center shadow-lg">
                <h1 className="text-4xl font-bold text-blue-600">
                    Laravel + React + Tailwind Works!
                </h1>

                <p className="mt-4 text-gray-600">
                    Inventory Management System
                </p>

                <button
                    className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => alert('React is working!')}
                >
                    Test React
                </button>
            </div>
        </div>
    );
}
