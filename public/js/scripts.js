// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Auto-dismiss alerts after 5 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll(".alert")
    alerts.forEach((alert) => {
      const bsAlert = new bootstrap.Alert(alert)
      bsAlert.close()
    })
  }, 5000)

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))

  // Password confirmation validation
  const passwordForm = document.querySelector('form[action*="password"]')
  if (passwordForm) {
    passwordForm.addEventListener("submit", (event) => {
      const password = document.getElementById("password")
      const confirmarPassword = document.getElementById("confirmarPassword")

      if (password && confirmarPassword && password.value !== confirmarPassword.value) {
        event.preventDefault()
        alert("Las contraseñas no coinciden")
      }
    })
  }

  // Image preview for file inputs
  const fileInputs = document.querySelectorAll('input[type="file"]')
  fileInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0]
      if (file && file.type.match("image.*")) {
        const reader = new FileReader()
        const preview = document.querySelector(".img-preview")

        if (preview) {
          reader.onload = (e) => {
            preview.src = e.target.result
            preview.style.display = "block"
          }

          reader.readAsDataURL(file)
        }
      }
    })
  })
})
