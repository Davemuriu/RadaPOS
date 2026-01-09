import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.date || "No Date"),
    datasets: [
      {
        label: "Daily Sales",
        data: data.map((d) => d.amount || 0),
        fill: false,
        borderColor: "blue",
      },
    ],
  };

  return <Line data={chartData} />;
}
