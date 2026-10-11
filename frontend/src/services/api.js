/**
 * ReturnSphere Backend API Client
 * Seamlessly interfaces the frontend with the FastAPI + MongoDB Atlas Backend
 */

const API_BASE = '/api';

/**
 * Health check & diagnostic status of the AI Models (CLIP & YOLO)
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Backend health check failed:', err.message);
    return null;
  }
}

/**
 * Real-time database status & collection document counts in MongoDB Atlas
 */
export async function getDatabaseStatus() {
  try {
    const res = await fetch(`${API_BASE}/database/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Database status check failed:', err.message);
    return null;
  }
}

/* =========================================================================
   USER AUTHENTICATION (MongoDB Atlas: Customers & Shop Owners)
   ========================================================================= */

/**
 * Register a customer or shop owner in MongoDB Atlas
 */
export async function registerUser({ name, email, password, role = 'customer', storeName = null, shopId = null }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      store_name: storeName,
      shop_id: shopId
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }

  return await res.json();
}

/**
 * Login customer or shop owner
 */
export async function loginUser({ email, password, role = null }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(err.detail || 'Login failed');
  }

  return await res.json();
}

/**
 * Sync Google Authenticated User to MongoDB Atlas
 */
export async function syncGoogleUser({ name, email, role = 'customer', storeName = null }) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, role, store_name: storeName })
  });

  if (!res.ok) throw new Error('Google auth sync failed');
  return await res.json();
}

/* =========================================================================
   AI MODEL VERIFICATION
   ========================================================================= */

/**
 * Run AI Visual Condition Verification comparing customer photo with catalog reference
 */
export async function verifyReturnImages({
  returnedFile,
  referenceFile,
  productId,
  category = 'shoes_clothes',
  similarityThreshold = 75.0,
  confThreshold = 0.50
}) {
  const formData = new FormData();
  if (returnedFile) formData.append('returned_image', returnedFile);
  if (referenceFile) formData.append('reference_image', referenceFile);
  if (productId) formData.append('product_id', productId);
  formData.append('category', category);
  formData.append('similarity_threshold', similarityThreshold.toString());
  formData.append('conf_threshold', confThreshold.toString());

  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Verification failed: ${errorText}`);
  }

  return await res.json();
}

/**
 * Run CLIP Image Similarity only between two images
 */
export async function checkSimilarityOnly(file1, file2, threshold = 75.0) {
  const formData = new FormData();
  formData.append('image1', file1);
  formData.append('image2', file2);
  formData.append('threshold', threshold.toString());

  const res = await fetch(`${API_BASE}/v1/similarity-only`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Similarity check failed');
  return await res.json();
}

/* =========================================================================
   CUSTOMER SIDE DATA: RETURNS, ORDERS & CLAIMS
   ========================================================================= */

/**
 * Fetch catalog products
 */
export async function fetchProducts(shopId) {
  const url = shopId ? `${API_BASE}/products?shop_id=${encodeURIComponent(shopId)}` : `${API_BASE}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
}

/**
 * Lookup order by 8-character ID
 */
export async function lookupOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Order lookup failed');
  }
  return await res.json();
}

/**
 * Fetch all return/exchange claims from MongoDB
 */
export async function fetchReturns(shopId = null, status = null, customerEmail = null, orderId = null) {
  const params = new URLSearchParams();
  if (shopId) params.append('shop_id', shopId);
  if (status) params.append('status', status);
  if (customerEmail) params.append('customer_email', customerEmail);
  if (orderId) params.append('order_id', orderId);

  const url = `${API_BASE}/returns${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch returns');
  return await res.json();
}

/**
 * Submit a return or exchange claim with automated AI condition inspection
 * Persists in MongoDB Atlas
 */
export async function submitReturnClaim(formData) {
  const res = await fetch(`${API_BASE}/returns`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Submit return failed: ${err}`);
  }

  return await res.json();
}

/**
 * Update return claim status (Approve / Reject)
 */
export async function updateReturnStatus(returnId, newStatus, note) {
  const res = await fetch(`${API_BASE}/returns/${encodeURIComponent(returnId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus, note })
  });

  if (!res.ok) throw new Error('Failed to update status');
  return await res.json();
}

/* =========================================================================
   SHOP OWNER SIDE DATA: INVENTORY & HISTORY
   ========================================================================= */

/**
 * Fetch shop inventory from MongoDB Atlas
 */
export async function fetchInventory(shopId = null) {
  const url = shopId ? `${API_BASE}/inventory?shop_id=${encodeURIComponent(shopId)}` : `${API_BASE}/inventory`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return await res.json();
}

/**
 * Add a new product to inventory in MongoDB Atlas
 */
export async function addInventoryItem(itemData) {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) throw new Error('Failed to add inventory item');
  return await res.json();
}

/**
 * Adjust stock count (+1 or -1) in MongoDB Atlas
 */
export async function adjustInventoryStock(itemId, delta) {
  const res = await fetch(`${API_BASE}/inventory/${encodeURIComponent(itemId)}/adjust-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta })
  });
  if (!res.ok) throw new Error('Failed to adjust stock');
  return await res.json();
}

/**
 * Update inventory item details in MongoDB Atlas
 */
export async function updateInventoryItem(itemId, updates) {
  const res = await fetch(`${API_BASE}/inventory/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update inventory item');
  return await res.json();
}

/**
 * Fetch historical outcomes & resolution logs from MongoDB Atlas
 */
export async function fetchHistory(shopId = null) {
  const url = shopId ? `${API_BASE}/history?shop_id=${encodeURIComponent(shopId)}` : `${API_BASE}/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch history');
  return await res.json();
}

/**
 * Fetch history summary metrics for shop dashboard
 */
export async function fetchHistoryMetrics() {
  const res = await fetch(`${API_BASE}/history/metrics`);
  if (!res.ok) throw new Error('Failed to fetch history metrics');
  return await res.json();
}

/**
 * Record a resolved return or exchange outcome in MongoDB Atlas
 */
export async function addHistoryRecord(historyData) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(historyData)
  });
  if (!res.ok) throw new Error('Failed to record history outcome');
  return await res.json();
}

/**
 * Update shop return policy
 */
export async function updateShopPolicy(shopId, policyUpdates) {
  const res = await fetch(`${API_BASE}/shops/${encodeURIComponent(shopId)}/policy`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policyUpdates)
  });

  if (!res.ok) throw new Error('Failed to update policy');
  return await res.json();
}
