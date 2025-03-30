document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        form.classList.add('was-validated');
      }, false);
    });
    
    const passwordInputs = document.querySelectorAll('input[name="password"]');
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    
    if (passwordInputs.length && confirmPasswordInputs.length) {
      confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
          const password = document.querySelector('input[name="password"]').value;
          
          if (this.value !== password) {
            this.setCustomValidity('Las contraseñas no coinciden');
          } else {
            this.setCustomValidity('');
          }
        });
      });
      
      passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
          const confirmPassword = document.querySelector('input[name="confirmPassword"]');
          
          if (confirmPassword && confirmPassword.value) {
            if (this.value !== confirmPassword.value) {
              confirmPassword.setCustomValidity('Las contraseñas no coinciden');
            } else {
              confirmPassword.setCustomValidity('');
            }
          }
        });
      });
    }
    
    const emailInputs = document.querySelectorAll('input[type="email"]');
    
    emailInputs.forEach(input => {
      input.addEventListener('input', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(this.value)) {
          this.setCustomValidity('Por favor, ingresa un correo electrónico válido');
        } else {
          this.setCustomValidity('');
        }
      });
    });
    
    const phoneInputs = document.querySelectorAll('input[name="phone"]');
    
    phoneInputs.forEach(input => {
      input.addEventListener('input', function() {
        const phoneRegex = /^\d{10}$/;
        
        if (!phoneRegex.test(this.value)) {
          this.setCustomValidity('Por favor, ingresa un número de teléfono válido (10 dígitos)');
        } else {
          this.setCustomValidity('');
        }
      });
    });
    
    const priceInputs = document.querySelectorAll('input[name="price"]');
    
    priceInputs.forEach(input => {
      input.addEventListener('input', function() {
        const price = parseFloat(this.value);
        
        if (isNaN(price) || price <= 0) {
          this.setCustomValidity('Por favor, ingresa un precio válido mayor a 0');
        } else {
          this.setCustomValidity('');
        }
      });
    });
  });