import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

const GraficoBarra: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [chartOptions] = useState<ApexCharts.ApexOptions>({
    chart: {
      height: 350,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      position: "top",
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: { enabled: true },
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        show: false,
        formatter: (val: number) => `${val}%`,
      },
    },
    title: {
      text: "Monthly Inflation in Argentina, 2002",
      floating: true,
      offsetY: 330,
      align: "center",
      style: { color: "#444" },
    },
  });

  const [series] = useState([
    {
      name: "Inflation",
      data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
    },
  ]);

  useEffect(() => {
    if (chartRef.current) {
      const chart = new ApexCharts(chartRef.current, {
        series,
        ...chartOptions,
      });
      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [chartOptions, series]);

  return <div ref={chartRef}></div>;
};

export default GraficoBarra;
