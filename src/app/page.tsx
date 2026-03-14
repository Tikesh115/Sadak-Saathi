"use client";

import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { stateData, StateEntry } from "./data";
import useAuth from "./hooks/useAuth";

export default function Home() {
    useAuth();
  const [activeState, setActiveState] = useState<StateEntry>(stateData[0]);

  const totals = useMemo(() => {
    return stateData.reduce(
      (acc, state) => {
        acc.total += state.total;
        return acc;
      },
      { total: 0 }
    );
  }, []);

  return (
    <MainLayout tickerMessage="New YOLO deployment active on NH corridors. State nodal officers are requested to update repair logs for this week.">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <article className="bg-white p-6 rounded shadow border-t-4 border-orange-500">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">Welcome to Sadak Saathi</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Sadak Saathi is a national initiative for safer roads using AI-assisted pothole detection,
              geotagging, and repair workflow tracking. The platform supports citizen reporting and
              administrative action from a single unified portal.
            </p>
          </article>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow border-l-4 border-blue-900">
              <h3 className="text-3xl font-bold text-gray-900">1.4M+</h3>
              <p className="text-xs text-gray-600 mt-1">Images Processed</p>
            </div>
            <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
              <h3 className="text-3xl font-bold text-gray-900">12,450</h3>
              <p className="text-xs text-gray-600 mt-1">Hazards Detected</p>
            </div>
            <div className="bg-white p-4 rounded shadow border-l-4 border-green-600">
              <h3 className="text-3xl font-bold text-gray-900">98.2%</h3>
              <p className="text-xs text-gray-600 mt-1">Model Accuracy</p>
            </div>
          </div>
        </div>

        <aside className="bg-white p-4 rounded shadow border border-gray-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Latest Circulars</h3>
          <ul className="text-sm text-blue-900 space-y-2">
            <li>YOLO API integration SOP for state engineering teams</li>
            <li>Monsoon preparedness advisory for district roads</li>
            <li>Dashboard training calendar for field supervisors</li>
            <li>Data privacy and retention notification update</li>
          </ul>
        </aside>
      </section>

      <section className="mt-6 bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">National Pothole Density Report</h2>
            <p className="text-xs text-blue-100">Live ranking and city-level distribution</p>
          </div>
          <span className="text-xs font-semibold bg-orange-500 px-2 py-1 rounded">Total: {totals.total}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-r border-gray-200">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-bold text-gray-700">
              Top States by Hazard Count
            </div>
            <ul className="divide-y divide-gray-100">
              {stateData.map((state, index) => (
                <li
                  key={state.id}
                  onClick={() => setActiveState(state)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition ${
                    activeState.id === state.id ? "bg-blue-50 border-l-4 border-blue-900" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white bg-blue-900 rounded-full w-6 h-6 grid place-items-center">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-800">{state.name}</span>
                  </div>
                  <span className="font-bold text-blue-900">{state.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-bold text-gray-700">
              District and City Breakdown: {activeState.name}
            </div>
            <div className="p-4 space-y-4 min-h-[250px]">
              {activeState.cities.map((city) => (
                <div key={city.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-800">{city.name}</span>
                    <span className="font-bold text-gray-700">{city.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${city.color} h-2 rounded-full`} style={{ width: `${city.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
