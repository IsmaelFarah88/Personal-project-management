import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
    return (
        <div className={`bg-gray-800 p-4 rounded-lg flex items-center gap-4 border-l-4 ${colorClass} transition-transform transform hover:scale-105`}>
            <div className={`text-3xl ${colorClass.replace('border', 'text')}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
