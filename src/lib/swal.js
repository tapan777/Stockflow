import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export function toast(type, message) {
  Toast.fire({ icon: type, title: message })
}

export function confirm({ title, text, confirmText = 'Confirm', cancelText = 'Cancel', icon = 'warning' }) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: { popup: 'rounded-2xl' },
  })
}
