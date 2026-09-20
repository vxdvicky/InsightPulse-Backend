import React, { useState } from 'react';
import axios from 'axios';
import { Upload, BarChart2, PieChart, Table, FileText, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/upload", formData);
      setData(response.data);
    } catch (error) {
      alert("Error uploading file! Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 p-5 bg-slate-950 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
          <BarChart2 className="w-8 h-8" /> PowerBI Ultra Light
        </h1>
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg flex items-center gap-2 transition font-medium">
          <Upload className="w-5 h-5" />
          {loading ? "Processing..." : "Upload CSV"}
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-7xl mx-auto">
        {!data && !loading && (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-16 text-center bg-slate-950/50 my-12">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Koi CSV File Upload Karein</h2>
            <p className="text-slate-400">Apni data file select karein aur instantly smooth dashboard dekhein.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Data Analytics & Visualizations Ban Rahe Hain...</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Top Cards KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">File Name</p>
                <p className="text-xl font-bold truncate mt-1">{data.filename}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Total Rows</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{data.total_rows}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Numeric Columns</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{data.numeric_columns.length}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Categorical Columns</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{data.categorical_columns.length}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Pie Chart */}
              {Object.keys(data.category_summary).map((catName, idx) => (
                <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-slate-200 border-b border-slate-700 pb-2">
                    Distribution: <span className="text-blue-400">{catName}</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={data.category_summary[catName]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {data.category_summary[catName].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}

              {/* Bar Chart for Numeric Columns */}
              {Object.keys(data.numeric_summary).map((numName, idx) => (
                <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-slate-200 border-b border-slate-700 pb-2">
                    Metric Trend: <span className="text-green-400">{numName}</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.numeric_summary[numName]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="index" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Bar dataKey={numName} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Table Preview */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-400" /> Data Preview (First 10 Rows)
              </h3>
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    {data.preview.length > 0 && Object.keys(data.preview[0]).map((key) => (
                      <th key={key} className="p-3 border-b border-slate-700">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.preview.map((row, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-750">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-3">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}