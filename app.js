// 当前用户信息
let currentUser = {
    username: '',
    userType: '',
    role: ''
};

// 用户角色显示名称映射
const userTypeNames = {
    'admin': '管理员',
    'supplier': '供应商',
    'distributor': '分销商'
};

// 登录处理
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userType = document.getElementById('userType').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!userType || !username || !password) {
            alert('请填写完整的登录信息！');
            return;
        }
        
        // 简单的登录验证（实际项目中应该与后端API交互）
        if (password.length < 4) {
            alert('密码长度至少4位！');
            return;
        }
        
        // 保存用户信息到sessionStorage
        sessionStorage.setItem('userType', userType);
        sessionStorage.setItem('username', username);
        
        // 跳转到主页面
        window.location.href = 'main.html';
    });
}

// 主页面初始化
if (window.location.pathname.includes('main.html')) {
    // 检查登录状态
    const userType = sessionStorage.getItem('userType');
    const username = sessionStorage.getItem('username');
    
    if (!userType || !username) {
        alert('请先登录！');
        window.location.href = 'index.html';
    } else {
        // 设置当前用户信息
        currentUser.username = username;
        currentUser.userType = userType;
        currentUser.role = userTypeNames[userType];
        
        // 更新页面显示
        document.getElementById('userName').textContent = username;
        document.getElementById('userRole').textContent = currentUser.role;
        
        // 根据用户类型调整界面
        adjustUIByUserType(userType);
        
        // 初始化页面
        initializePage();
    }
}

// 根据用户类型调整界面
function adjustUIByUserType(userType) {
    // 库存输入框（仅供应商可见）
    const stockInputGroup = document.getElementById('stockInputGroup');
    if (stockInputGroup) {
        if (userType !== 'supplier') {
            stockInputGroup.style.display = 'none';
        }
    }
    
    // 发布资料按钮（仅供应商和管理员可见）
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        if (userType === 'distributor') {
            publishBtn.style.display = 'none';
        }
    }
    
    // 生成条码/下单按钮（分销商显示"下单"）
    const orderBtns = document.querySelectorAll('#orderBtn');
    orderBtns.forEach(btn => {
        if (userType === 'distributor') {
            btn.textContent = '下单';
        }
    });
    
    // 用户管理菜单（仅管理员可见）
    if (userType !== 'admin') {
        const userManagementNav = document.querySelector('[data-page="user-management"]');
        if (userManagementNav) {
            userManagementNav.style.display = 'none';
        }
    }
}

// 初始化页面
function initializePage() {
    // 菜单切换
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active类
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
            
            // 添加active类到当前项
            this.classList.add('active');
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// 生成条码功能
function generateBarcodes() {
    const styleNo = document.getElementById('styleNo').value;
    const colors = document.getElementById('colors').value;
    const sizes = document.getElementById('sizes').value;
    const stockQty = document.getElementById('stockQty')?.value || 0;
    
    if (!styleNo || !colors || !sizes) {
        alert('请填写完整的商品信息！');
        return;
    }
    
    const colorArray = colors.split(',').map(c => c.trim());
    const sizeArray = sizes.split(',').map(s => s.trim());
    
    const tbody = document.getElementById('barcodeTableBody');
    tbody.innerHTML = '';
    
    let barcodeCount = 0;
    colorArray.forEach(color => {
        sizeArray.forEach(size => {
            barcodeCount++;
            const barcode = `${styleNo}-${color}-${size}`;
            const row = document.createElement('tr');
            
            // 根据用户类型显示不同的操作按钮
            let actionButtons = '';
            if (currentUser.userType === 'supplier') {
                actionButtons = `
                    <button class="btn-icon" onclick="editBarcode(this)" title="编辑">✏️</button>
                    <button class="btn-icon" onclick="deleteBarcode(this)" title="删除">🗑️</button>
                `;
            } else if (currentUser.userType === 'distributor') {
                actionButtons = `
                    <button class="btn btn-sm btn-success" onclick="placeOrder(this)">下单</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-icon" onclick="editBarcode(this)" title="编辑">✏️</button>
                    <button class="btn-icon" onclick="deleteBarcode(this)" title="删除">🗑️</button>
                `;
            }
            
            row.innerHTML = `
                <td>${barcode}</td>
                <td>${styleNo}</td>
                <td>${color}</td>
                <td>${size}</td>
                <td>${currentUser.userType === 'supplier' || currentUser.userType === 'admin' ? stockQty : '-'}</td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });
    });
    
    alert(`成功生成 ${barcodeCount} 个条码！`);
}

// 打印条码
function printBarcodes() {
    const table = document.getElementById('barcodeTable');
    if (!table.querySelector('tbody tr td[colspan]')) {
        window.print();
    } else {
        alert('请先生成条码！');
    }
}

// 编辑条码
function editBarcode(btn) {
    alert('编辑功能开发中...');
}

// 删除条码
function deleteBarcode(btn) {
    if (confirm('确定要删除这个条码吗？')) {
        btn.closest('tr').remove();
    }
}

// 下单（分销商功能）
function placeOrder(btn) {
    const row = btn.closest('tr');
    const barcode = row.cells[0].textContent;
    const qty = prompt(`请输入订单数量（条码：${barcode}）`, '1');
    
    if (qty && parseInt(qty) > 0) {
        alert(`订单提交成功！\n条码：${barcode}\n数量：${qty}`);
    }
}

// 打开添加用户模态框
function openAddUserModal() {
    alert('添加用户功能开发中...\n这里应该打开一个模态框来添加新用户。');
}

// 打开添加商品模态框
function openAddProductModal() {
    alert('添加商品功能开发中...\n这里应该打开一个模态框来添加新商品。');
}

// 查看商品详情
function viewProductDetail() {
    alert('商品详情功能开发中...\n这里应该显示完整的商品信息。');
}

// 生成条码（选品资料页面）
function generateBarcode() {
    if (currentUser.userType === 'distributor') {
        alert('条码生成成功！\n您可以在线上获取资料并上架到店铺后台，\n或在线下打印条码扫描发货。');
    } else {
        alert('此功能仅限分销商使用！');
    }
}

// 发布资料
function publishMaterial() {
    if (currentUser.userType === 'supplier' || currentUser.userType === 'admin') {
        alert('资料发布成功！\n公版资料已推送给分销商。');
    } else {
        alert('此功能仅限供应商和管理员使用！');
    }
}

// 设置标签切换
function showSettingTab(tabId) {
    // 移除所有active类
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.setting-panel').forEach(panel => panel.classList.remove('active'));
    
    // 添加active类
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 添加自定义字段
function addCustomField() {
    alert('添加自定义字段功能开发中...\n这里应该打开一个表单来配置新字段。');
}

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    // 基础设置表单提交
    const settingsForms = document.querySelectorAll('.settings-form');
    settingsForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('设置保存成功！');
        });
    });
});

// 打印样式（用于条码打印）
const style = document.createElement('style');
style.textContent = `
    @media print {
        body * {
            visibility: hidden;
        }
        #barcodeTable, #barcodeTable * {
            visibility: visible;
        }
        #barcodeTable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        .btn, .btn-icon {
            display: none !important;
        }
    }
`;
document.head.appendChild(style);

