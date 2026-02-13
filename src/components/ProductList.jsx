import React from 'react';

function ProductList({ products, category, categoryName, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="border border-cyber-cyan/20 bg-black/30 rounded-lg p-6">
        <h3 className="text-cyber-cyan font-bold mb-4 font-mono text-sm">{categoryName}</h3>
        <p className="text-cyber-cyan/40 font-mono text-xs">暂无商品</p>
      </div>
    );
  }

  return (
    <div className="border border-cyber-cyan/20 bg-black/30 rounded-lg overflow-hidden">
      <h3 className="text-cyber-cyan font-bold p-3 bg-cyber-cyan/10 font-mono text-sm">
        {categoryName} ({products.length})
      </h3>
      
      <div className="grid gap-2 p-3 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 border border-cyber-cyan/10 bg-black/50 hover:bg-black/70 transition-all rounded"
          >
            <img
              src={product.img}
              alt={product.name}
              className="w-16 h-16 object-cover rounded border border-cyber-cyan/20"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400/050505/00f7ff?text=No+Image';
              }}
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-mono text-sm truncate">{product.name}</p>
              {product.promoUrl && (
                <p className="text-cyber-cyan/60 font-mono text-[10px] truncate">
                  🔗 有推广链接
                </p>
              )}
              <p className="text-cyber-cyan/30 font-mono text-[10px] mt-1">
                {/* eslint-disable-next-line react-hooks/purity */}
                {new Date(product.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(category, product)}
                className="px-3 py-1 border border-cyber-cyan/30 text-cyber-cyan font-mono text-[10px] uppercase hover:bg-cyber-cyan/10 transition-all"
              >
                编辑
              </button>
              <button
                onClick={() => onDelete(category, product.id)}
                className="px-3 py-1 border border-cyber-pink/30 text-cyber-pink font-mono text-[10px] uppercase hover:bg-cyber-pink/10 transition-all"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
