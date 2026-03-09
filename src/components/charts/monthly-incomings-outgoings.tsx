"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export function MonthlyIncomingsOutgoingsChart({
  expenses,
  income,
}: {
  expenses: {
    rent: number;
    mortgage: number;
    serviceCharge: number;
    debt: number;
  };
  income: number;
}) {
  const totalExpenses = Object.values(expenses).reduce(
    (sum, val) => sum + val,
    0,
  );

  const remainingIncome = income - totalExpenses;

  const data = [
    {
      name: "Rent",
      y: (expenses.rent / income) * 100,
      color: "#7747FF",
    },
    {
      name: "Mortgage",
      y: (expenses.mortgage / income) * 100,
      color: "#D61F56",
    },
    {
      name: "Service Charge",
      y: (expenses.serviceCharge / income) * 100,
      color: "#C2AEF9",
    },
    {
      name: "Debt",
      y: (expenses.debt / income) * 100,
      color: "#FADBE0",
    },
    {
      name: "Income",
      y: (remainingIncome / income) * 100,
      color: "#F2F4F7",
    },
  ];

  const options = {
    chart: {
      type: "pie",
      width: 150, // Set the width of the chart
      height: 150, // Set the height of the chart
      backgroundColor: "transparent", // To make the background clean
    },
    title: {
      text: "",
    },
    subtitle: {
      text: `${(remainingIncome / income) * 100 ? ((remainingIncome / income) * 100).toFixed(2) + "%" : ""}`,
      verticalAlign: "middle",
      style: {
        fontFamily: "Inter",
        fontSize: "20px", // Adjust the font size for the subtitle
        fontWeight: "600",
        color: "#333",
      },
    },
    plotOptions: {
      pie: {
        innerSize: "80%", // Makes it look like a progress circle
        dataLabels: {
          enabled: false, // Hide labels on segments
        },
        borderWidth: 0, // No borders for smooth visuals
      },
    },
    series: [
      {
        name: "Expenses",
        data: data,
      },
    ],
    tooltip: {
      pointFormat: "<b>{point.name}</b>: {point.y:.2f}%",
    },
    credits: {
      enabled: false, // Hide Highcharts watermark
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
