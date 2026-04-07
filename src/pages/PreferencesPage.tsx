// V3.0 用餐喜好设置页面
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Navbar } from '../components/V3/Navbar';
import { Button } from '../components/V3/Button';
import { Card } from '../components/V3/Card';

type DietType = 'vegetarian' | 'meat' | 'omnivore';
type TasteType = 'spicy' | 'non_spicy' | 'mild_spicy' | 'heavy_spicy';

const dietOptions = [
  { value: 'omnivore', label: '杂食', emoji: '🍽️' },
  { value: 'meat', label: '肉食', emoji: '🥩' },
  { value: 'vegetarian', label: '素食', emoji: '🥬' },
];

const tasteOptions = [
  { value: 'non_spicy', label: '不辣', emoji: '🌶️❌' },
  { value: 'mild_spicy', label: '微辣', emoji: '🌶️' },
  { value: 'spicy', label: '辣', emoji: '🌶️🌶️' },
  { value: 'heavy_spicy', label: '重辣', emoji: '🌶️🌶️🌶️' },
];

const ingredientOptions = [
  { value: 'beef', label: '牛肉', emoji: '🐄' },
  { value: 'pork', label: '猪肉', emoji: '🐷' },
  { value: 'chicken', label: '鸡肉', emoji: '🐔' },
  { value: 'lamb', label: '羊肉', emoji: '🐑' },
  { value: 'seafood', label: '海鲜', emoji: '🦐' },
  { value: 'vegetable', label: '蔬菜', emoji: '🥬' },
  { value: 'egg', label: '蛋类', emoji: '🥚' },
  { value: 'dairy', label: '奶制品', emoji: '🧀' },
];

const avoidOptions = [
  { value: 'cilantro', label: '香菜', emoji: '🌿' },
  { value: 'green_onion', label: '葱', emoji: '🧅' },
  { value: 'garlic', label: '蒜', emoji: '🧄' },
  { value: 'ginger', label: '姜', emoji: '🫚' },
  { value: 'chili', label: '辣椒', emoji: '🌶️' },
  { value: 'sesame', label: '芝麻', emoji: '🫘' },
  { value: 'peanut', label: '花生', emoji: '🥜' },
  { value: 'shellfish', label: '贝类', emoji: '🦪' },
];

export const PreferencesPage: React.FC = () => {
  const [diet, setDiet] = useState<DietType>('omnivore');
  const [taste, setTaste] = useState<TasteType | ''>('');
  const [likedIngredients, setLikedIngredients] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载用户喜好
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // 解析喜好数据
      const dietPref = data?.find(p => p.preference_type === 'diet');
      if (dietPref) setDiet(dietPref.preference_value as DietType);

      const tastePref = data?.find(p => p.preference_type === 'taste');
      setTaste((tastePref?.preference_value as TasteType) || '');

      const liked = data?.filter(p => p.preference_type === 'ingredient' && p.weight > 1);
      setLikedIngredients(liked?.map(p => p.preference_value) || []);

      const disliked = data?.filter(p => p.preference_type === 'ingredient' && p.weight < 1 && p.weight > 0);
      setDislikedIngredients(disliked?.map(p => p.preference_value) || []);

      const avoid = data?.filter(p => p.preference_type === 'avoid' || p.weight === 0);
      setAvoidIngredients(avoid?.map(p => p.preference_value) || []);
    } catch (err) {
      console.error('加载喜好失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const preferences = [
        { preference_type: 'diet', preference_value: diet, weight: 1.0 },
        ...(taste ? [{ preference_type: 'taste' as const, preference_value: taste, weight: 1.0 }] : []),
        ...likedIngredients.map(i => ({ preference_type: 'ingredient' as const, preference_value: i, weight: 2.0 })),
        ...dislikedIngredients.map(i => ({ preference_type: 'ingredient' as const, preference_value: i, weight: 0.3 })),
        ...avoidIngredients.map(i => ({ preference_type: 'avoid' as const, preference_value: i, weight: 0 })),
      ];

      // 批量插入/更新
      for (const pref of preferences) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            ...pref,
          }, {
            onConflict: 'user_id,preference_type,preference_value'
          });
      }

      alert('✅ 喜好设置已保存！');
    } catch (err) {
      console.error('保存失败:', err);
      alert('❌ 保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const selectTaste = (selectedTaste: TasteType) => {
    setTaste(selectedTaste);
  };

  const toggleIngredient = (
    ingredient: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const resetForm = () => {
    setDiet('omnivore');
    setTaste('');
    setLikedIngredients([]);
    setDislikedIngredients([]);
    setAvoidIngredients([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar title="用餐喜好设置" showBack />

      <main className="pt-20 p-4 space-y-6 max-w-2xl mx-auto">
        {/* 饮食类型 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 overflow-visible">饮食类型</h3>
          <div className="flex gap-3">
            {dietOptions.map(option => (
              <Button
                key={option.value}
                variant={diet === option.value ? 'primary' : 'outline'}
                onClick={() => setDiet(option.value as DietType)}
              >
                {option.emoji} {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 口味偏好 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 overflow-visible">口味偏好</h3>
          <div className="flex flex-wrap gap-3">
            {tasteOptions.map(option => (
              <Button
                key={option.value}
                variant={taste === option.value ? 'primary' : 'outline'}
                onClick={() => selectTaste(option.value as TasteType)}
              >
                {option.emoji} {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 喜欢的食材 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 overflow-visible">喜欢的食材 ❤️</h3>
          <div className="flex flex-wrap gap-3">
            {ingredientOptions.map(option => (
              <Button
                key={option.value}
                variant={likedIngredients.includes(option.value) ? 'primary' : 'outline'}
                onClick={() => toggleIngredient(option.value, setLikedIngredients)}
              >
                {option.emoji} {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 不喜欢的食材 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 overflow-visible">不喜欢的食材 😐</h3>
          <div className="flex flex-wrap gap-3">
            {ingredientOptions.map(option => (
              <Button
                key={option.value}
                variant={dislikedIngredients.includes(option.value) ? 'primary' : 'outline'}
                onClick={() => toggleIngredient(option.value, setDislikedIngredients)}
              >
                {option.emoji} {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 忌口设置 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 overflow-visible">忌口设置 🚫</h3>
          <div className="flex flex-wrap gap-3">
            {avoidOptions.map(option => (
              <Button
                key={option.value}
                variant={avoidIngredients.includes(option.value) ? 'primary' : 'outline'}
                onClick={() => toggleIngredient(option.value, setAvoidIngredients)}
              >
                {option.emoji} {option.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* 保存按钮 */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={savePreferences}
            loading={saving}
          >
            保存设置
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={resetForm}
          >
            重置
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PreferencesPage;
