import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const BOOKINGS_BUCKETS = {
  Cheap: { min: 0, max: 100 },
  Normal: { min: 100, max: 200 },
  Expensive: { min: 200, max: 10000000 },
};

export default function BookingsChart({ bookings = [] }) {
  const labels = [];
  const data = [];

  for (const bucket in BOOKINGS_BUCKETS) {
    const count = bookings.reduce((prev, current) => {
      const price = current?.event?.price ?? 0;
      if (
        price > BOOKINGS_BUCKETS[bucket].min &&
        price < BOOKINGS_BUCKETS[bucket].max
      ) {
        return prev + 1;
      }
      return prev;
    }, 0);
    labels.push(bucket);
    data.push(count);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Bookings",
        data,
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
        borderColor: ["#388e3c", "#1976d2", "#f57c00"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div style={{ textAlign: "center", height: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
