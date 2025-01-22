import React, { useState, useEffect } from "react";
import OrderForm from "./components/OrderForm/OrderForm";
import PizzaStage from "./components/PizzaStage/PizzaStage";
import MainSection from "./components/MainSection/MainSection";

const App = () => {
  const [orders, setOrders] = useState([]);
  const [orderCounter, setOrderCounter] = useState(1); 

  
  const activeOrders = orders.filter((order) => order.stage !== "Order Picked").length;

  const EachStageTime = (orderId) => {
    const stages = ["Order Placed", "Order in Making", "Order Ready", "Order Picked"];
  
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const currentStageIndex = stages.indexOf(order.stage);
  
          if (currentStageIndex < stages.length - 1) {
            const nextStage = stages[currentStageIndex + 1];
            const now = new Date();
            const currentTimestampKey = stages[currentStageIndex].toLowerCase().replace(" ", "");
            const nextTimestampKey = nextStage.toLowerCase().replace(" ", "");
  
            const timeSpentInCurrentStage = order.timestamps[currentTimestampKey]
              ? (now - new Date(order.timestamps[currentTimestampKey])) / 1000 // in seconds
              : 0;
  
            return {
              ...order,
              stage: nextStage,
              timestamps: {
                ...order.timestamps,
                [nextTimestampKey]: now.toISOString(),
              },
              totalTime: (order.totalTime || 0) + timeSpentInCurrentStage, // Combine previous total with current stage time
            };
          }
        }
        return order;
      })
    );
  };
  
  const addOrder = (pizzaDetails) => {
    const newOrder = {
      id: `Order 00${orders.length + 1}`,
      details: pizzaDetails,
      stage: "Order Placed",
      timeSpent: 0,
      totalTime: 0, // Initialize cumulative time
      timestamps: {
        placed: new Date(),
      },
    };
    setOrders([...orders, newOrder]);
  };
  


  const cancelOrder = (orderId) => {
    const orderToCancel = orders.find((order) => order.id === orderId);
    if (orderToCancel.stage === "Order Ready" || orderToCancel.stage === "Order Picked") {
      alert("Cannot cancel the order. It is already in 'Order Ready' or beyond.");
      return;
    }

    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId)); // Remove order
  };

 
  
  const moveOrderToNextStage = (orderId) => {
    const nextStages = [
      "Order Placed",
      "Order in Making",
      "Order Ready",
      "Order Picked",
    ];
  
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              stage: nextStages[nextStages.indexOf(order.stage) + 1] || "Order Picked",
              totalTime: (order.totalTime || 0) + order.timeSpent, // Add current stage time to totalTime
              timeSpent: 0, // Reset timeSpent for the next stage
              timestamps: {
                ...order.timestamps,
                [nextStages[nextStages.indexOf(order.stage) + 1]]: new Date(), // Add timestamp for the next stage
              },
            }
          : order
      )
    );
  };
  


  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          timeSpent:
            order.stage !== "Order Picked"
              ? order.timeSpent + 1
              : order.timeSpent, 
        }))
      );
    }, 1000);

    return () => clearInterval(timer); 
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} sec`;
  };
  
 
  const totalDelivered = orders.filter((order) => order.stage === "Order Picked").length;

  return (
    <div>
      <OrderForm
        addOrder={addOrder}
        activeOrders={activeOrders}
        totalDelivered={totalDelivered}
      />
      <PizzaStage
        orders={orders}
        moveOrderToNextStage={moveOrderToNextStage}
        formatTime={formatTime}
      />
      <MainSection
        orders={orders}
        formatTime={formatTime}
        totalDelivered={totalDelivered}
        cancelOrder={cancelOrder}
      />
      
    </div>
  );
};

export default App;
