const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/styles/CollectionsPage.css', `.collections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.collections-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.collection-form {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
}

.collection-form h3 {
  margin-top: 0;
  font-size: 15px;
  font-weight: 600;
}

.collection-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.collection-form-grid .full-width {
  grid-column: 1 / -1;
}

.form-field label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.form-field input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border 0.2s;
}

.form-field input:focus {
  border-color: #111;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.collection-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.collection-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.collection-card-name {
  font-weight: 600;
  font-size: 15px;
}

.collection-card-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.badge-sale {
  background: #22c55e;
  color: #fff;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-inactive {
  background: #e5e7eb;
  color: #666;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.collection-card-info {
  font-size: 13px;
  color: #333;
  margin-bottom: 12px;
}

.collection-card-info .discount {
  color: #ef4444;
  font-weight: 700;
}

.collection-card-actions {
  display: flex;
  gap: 8px;
}

/* Product Panel Modal */
.product-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-panel {
  background: #fff;
  border-radius: 12px;
  width: 680px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-panel-header-title {
  font-weight: 700;
  font-size: 16px;
}

.product-panel-header-sub {
  font-size: 12px;
  color: #ef4444;
}

.product-panel-close {
  cursor: pointer;
  font-size: 20px;
  color: #666;
  line-height: 1;
}

.product-panel-search {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.product-panel-search input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
}

.product-panel-search input:focus {
  border-color: #111;
}

.search-results {
  padding: 8px 20px;
  border-bottom: 1px solid #eee;
  max-height: 180px;
  overflow-y: auto;
}

.search-results-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-name {
  font-size: 13px;
  font-weight: 500;
}

.search-result-price {
  font-size: 12px;
  color: #666;
}

.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.product-list-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.product-list-empty {
  color: #999;
  text-align: center;
  padding: 30px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.product-item-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}

.product-item-name {
  font-size: 13px;
  font-weight: 500;
}

.product-item-price .original {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.product-item-price .sale {
  color: #ef4444;
  margin-left: 8px;
  font-weight: 600;
  font-size: 12px;
}
`);

console.log('Done');
