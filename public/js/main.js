document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
      });
    }
    
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', function() {
        userDropdown.classList.toggle('show');
      });
      
      document.addEventListener('click', function(event) {
        if (!userMenuBtn.contains(event.target) && !userDropdown.contains(event.target)) {
          userDropdown.classList.remove('show');
        }
      });
    }
    
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      input.addEventListener('change', function() {
        const preview = document.querySelector(`#${this.id}-preview`);
        if (preview && this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          
          reader.readAsDataURL(this.files[0]);
        }
      });
    });
    
    const cartToggleBtn = document.querySelector('.cart-toggle-btn');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    
    if (cartToggleBtn && cartSidebar) {
      cartToggleBtn.addEventListener('click', function() {
        cartSidebar.classList.add('open');
      });
      
      if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', function() {
          cartSidebar.classList.remove('open');
        });
      }
      
      document.addEventListener('click', function(event) {
        if (cartSidebar && cartSidebar.classList.contains('open') && 
            !cartSidebar.contains(event.target) && 
            !cartToggleBtn.contains(event.target)) {
          cartSidebar.classList.remove('open');
        }
      });
    }
    
    const tabButtons = document.querySelectorAll('[data-tab-target]');
    const tabContents = document.querySelectorAll('[data-tab-content]');
    
    if (tabButtons.length && tabContents.length) {
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const target = document.querySelector(button.dataset.tabTarget);
          
          tabContents.forEach(content => {
            content.classList.remove('active');
          });
          
          tabButtons.forEach(btn => {
            btn.classList.remove('active');
          });
          
          button.classList.add('active');
          target.classList.add('active');
        });
      });
    }
    
    const statusToggle = document.querySelector('#status-toggle');
    const statusText = document.querySelector('.status-text');
    
    if (statusToggle && statusText) {
      statusToggle.addEventListener('change', function() {
        if (this.checked) {
          statusText.textContent = 'Disponible';
          statusText.classList.add('available');
          statusText.classList.remove('busy');
          
          updateDeliveryStatus('available');
        } else {
          statusText.textContent = 'Ocupado';
          statusText.classList.add('busy');
          statusText.classList.remove('available');
          
          updateDeliveryStatus('busy');
        }
      });
    }
    
    function updateDeliveryStatus(status) {
      fetch('/delivery/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Status updated successfully');
        } else {
          console.error('Error updating status');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });