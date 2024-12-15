import React from "react";
import {
  Navigation,
  ListTodo,
  Settings,
  Zap,
  Filter,
  RefreshCw,
} from "lucide-react";
import "../styles.css";

const iconMap = {
  navigation: Navigation,
  tasks: ListTodo,
  customize: Settings,
  zen: Zap,
  filter: Filter,
  sync: RefreshCw,
};

const Card = ({ title, description, icon }) => {
  const Icon = iconMap[icon] || Navigation;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-pink-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-purple-800">{title}</h3>
      <p className="text-purple-600">{description}</p>
    </div>
  );
};

export default Card;
