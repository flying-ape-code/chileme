import React, { useState } from 'react';
import ResultRecommendation from './ResultRecommendation';

interface ResultWithCPSProps {
  mealId?: string;
  mealName?: string;
  onMealSelect?: (mealId: string) => void;
}

export default function ResultWithCPS({ mealId, mealName, onMealSelect }: ResultWithCPSProps) {
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleMealSelect = (id: string) => {
    onMealSelect?.(id);
    // 选择餐品后显示优惠券推荐
    setShowRecommendation(true);
  };

  return (
    <div className="result-with-cps">
      {/* 原有的结果展示逻辑 */}
      <div className="meal-result">
        {/* 这里集成原有的结果展示组件 */}
        <p>选择结果：{mealName || '未选择'}</p>
      </div>

      {/* CPS 优惠券推荐 */}
      {showRecommendation && (
        <ResultRecommendation
          mealId={mealId}
          mealName={mealName}
        />
      )}
    </div>
  );
}
ation
        mealId={mealId}
        mealName={mealName}
      />
    </div>
  );
}
