import React from 'react';

const WeatherInsight = ({ temperature, condition }) => {
  const getAdvice = () => {
    if (temperature < 10) {
      return "外面才 6 度还下着雨，听猿哥一句劝，别整那冰美式了，来碗热腾腾的汤面才是正经事。";
    }
    return "天气不错，随便吃点啥都行，只要不是老板画的大饼。";
  };

  return (
    <div className="mt-2 p-2 border border-cyber-pink/30 bg-cyber-pink/5 backdrop-blur-md rounded animate-pulse">
      <p className="text-[10px] font-mono text-cyber-pink uppercase tracking-widest">
        [ 飞猿天气洞察 // {temperature}°C {condition} ]
      </p>
      <p className="text-xs text-white/80 mt-1 italic leading-relaxed">
        "{getAdvice()}"
      </p>
    </div>
  );
};

export default WeatherInsight;
