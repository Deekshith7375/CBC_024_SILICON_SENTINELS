let selectedRefFile = null;
let selectedRetFile = null;

document.addEventListener('DOMContentLoaded', () => {
    setupCategorySelectors();
    setupFileInputs();
    setupSlider();
});

function setupCategorySelectors() {
    const cardShoes = document.getElementById('cat-shoes');
    const cardElec = document.getElementById('cat-electronics');
    const radioShoes = cardShoes.querySelector('input');
    const radioElec = cardElec.querySelector('input');

    cardShoes.addEventListener('click', () => {
        radioShoes.checked = true;
        cardShoes.classList.add('active');
        cardElec.classList.remove('active');
    });

    cardElec.addEventListener('click', () => {
        radioElec.checked = true;
        cardElec.classList.add('active');
        cardShoes.classList.remove('active');
    });
}

function setupFileInputs() {
    const refFile = document.getElementById('ref-file');
    const retFile = document.getElementById('ret-file');

    refFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedRefFile = e.target.files[0];
            previewImage(selectedRefFile, 'ref');
        }
    });

    retFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedRetFile = e.target.files[0];
            previewImage(selectedRetFile, 'ret');
        }
    });
}

function setupSlider() {
    const simSlider = document.getElementById('similarity-threshold');
    const simLabel = document.getElementById('threshold-val');
    simSlider.addEventListener('input', (e) => {
        simLabel.textContent = `${e.target.value}%`;
    });

    const confSlider = document.getElementById('conf-threshold');
    const confLabel = document.getElementById('conf-val');
    confSlider.addEventListener('input', (e) => {
        confLabel.textContent = `${e.target.value}%`;
    });
}

function previewImage(fileOrBlob, type) {
    const previewDiv = document.getElementById(`${type}-preview`);
    const imgTag = document.getElementById(`${type}-img-tag`);
    
    if (typeof fileOrBlob === 'string') {
        imgTag.src = fileOrBlob;
    } else {
        imgTag.src = URL.createObjectURL(fileOrBlob);
    }
    previewDiv.style.display = 'block';
}

function removeImage(type) {
    if (type === 'ref') {
        selectedRefFile = null;
        document.getElementById('ref-file').value = '';
        document.getElementById('ref-preview').style.display = 'none';
    } else {
        selectedRetFile = null;
        document.getElementById('ret-file').value = '';
        document.getElementById('ret-preview').style.display = 'none';
    }
}

async function loadSample(presetType) {
    try {
        let category = 'shoes_clothes';
        let refUrl = '';
        let retUrl = '';

        if (presetType === 'shoes_clean') {
            category = 'shoes_clothes';
            refUrl = '/static/sample_ref_shoe.jpg';
            retUrl = '/static/sample_ret_shoe_clean.jpg';
        } else if (presetType === 'shoes_damaged') {
            category = 'shoes_clothes';
            refUrl = '/static/sample_ref_shoe.jpg';
            retUrl = '/static/sample_ret_shoe_damaged.jpg';
        } else if (presetType === 'phone_damaged') {
            category = 'electronics_smartphones';
            refUrl = '/static/sample_ref_phone.jpg';
            retUrl = '/static/sample_ret_phone_damaged.jpg';
        }

        // Set radio category
        document.querySelector(`input[name="category"][value="${category}"]`).checked = true;
        setupCategorySelectors();

        // Fetch sample images as blobs
        const refBlob = await fetch(refUrl).then(r => r.blob());
        const retBlob = await fetch(retUrl).then(r => r.blob());

        selectedRefFile = new File([refBlob], `${presetType}_ref.jpg`, { type: 'image/jpeg' });
        selectedRetFile = new File([retBlob], `${presetType}_ret.jpg`, { type: 'image/jpeg' });

        previewImage(selectedRefFile, 'ref');
        previewImage(selectedRetFile, 'ret');
    } catch (err) {
        console.error('Failed to load sample image preset:', err);
        alert('Could not load sample images. Ensure samples are generated.');
    }
}

async function processVerification() {
    if (!selectedRefFile || !selectedRetFile) {
        alert('Please upload both the Original Reference Image and the Customer Returned Image.');
        return;
    }

    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('btn-spinner');
    const btn = document.getElementById('btn-submit');
    const category = document.querySelector('input[name="category"]:checked').value;
    const threshold = document.getElementById('similarity-threshold').value;
    const confVal = document.getElementById('conf-threshold').value;
    const confThreshold = (parseFloat(confVal) / 100.0).toFixed(2);

    btnText.textContent = 'Processing Verification...';
    spinner.style.display = 'inline-block';
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('reference_image', selectedRefFile);
        formData.append('returned_image', selectedRetFile);
        formData.append('category', category);
        formData.append('similarity_threshold', threshold);
        formData.append('conf_threshold', confThreshold);

        const response = await fetch('/api/v1/verify-return', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'API Verification Failed');
        }

        const data = await response.json();
        renderResults(data);

    } catch (err) {
        alert(`Error: ${err.message}`);
        console.error(err);
    } finally {
        btnText.textContent = 'Verify Return Request';
        spinner.style.display = 'none';
        btn.disabled = false;
    }
}

function renderResults(data) {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('active-results').style.display = 'block';

    // Decision Status Pill
    const pill = document.getElementById('status-pill');
    pill.textContent = data.return_status.replace(/_/g, ' ');
    pill.className = `status-pill ${data.return_status}`;

    // Summary Text
    document.getElementById('summary-text').textContent = data.summary_message;

    // CLIP Similarity Score & Gauge
    const simScore = data.similarity_score;
    document.getElementById('sim-val').textContent = `${simScore}%`;
    const simBar = document.getElementById('sim-bar');
    simBar.style.width = `${Math.min(100, Math.max(0, simScore))}%`;

    if (simScore >= 85) simBar.style.background = '#10B981';
    else if (simScore >= 75) simBar.style.background = '#3B82F6';
    else if (simScore >= 60) simBar.style.background = '#F59E0B';
    else simBar.style.background = '#EF4444';

    const simVerdict = document.getElementById('sim-match-verdict');
    simVerdict.textContent = data.is_product_match 
        ? `✓ Product Matched (>= ${data.similarity_score}%)` 
        : `✗ Product Mismatch (< ${data.similarity_score}%)`;

    // YOLO Damage Metrics
    document.getElementById('damage-count-val').textContent = data.damage_count;
    const damageLabel = document.getElementById('damage-detected-label');
    if (data.damage_detected) {
        damageLabel.textContent = `${data.damage_count} Defect(s) Detected`;
        damageLabel.style.color = '#EF4444';
    } else {
        damageLabel.textContent = 'No Physical Damage';
        damageLabel.style.color = '#10B981';
    }

    document.getElementById('category-evaluated-label').textContent = 
        `Category: ${data.product_category === 'shoes_clothes' ? 'Shoes & Clothes (MVTec Leather)' : 'Electronics & Smartphones'}`;

    // Images Comparison
    document.getElementById('res-ref-img').src = URL.createObjectURL(selectedRefFile);
    document.getElementById('res-annotated-img').src = data.annotated_image_b64 || URL.createObjectURL(selectedRetFile);

    // Defects Table
    const tbody = document.getElementById('defects-table-body');
    tbody.innerHTML = '';

    if (!data.damages || data.damages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No physical damage or defects detected. Item is in pristine condition.</td></tr>';
    } else {
        data.damages.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${d.class_name.toUpperCase()}</strong></td>
                <td><span class="badge-severity ${d.severity}">${d.severity}</span></td>
                <td>${(d.confidence * 100).toFixed(1)}%</td>
                <td><code>[${d.bbox.join(', ')}]</code></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Scroll smoothly to results
    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth' });
}
