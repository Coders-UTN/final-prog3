import './modal.css';

interface ModalOptions {
  title?: string;
  message?: string;
  type?: 'error' | 'success' | 'warning' | 'info';
}

export function mostrarModal({
  title = "Mensaje",
  message = "",
  type = "info"
}: ModalOptions): HTMLDialogElement {

  // Buscar o crear el <dialog>
  let dialog = document.getElementById('app-dialog') as HTMLDialogElement | null;

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'app-dialog';
    document.body.appendChild(dialog);
  }

  const icons: Record<Required<ModalOptions>['type'], string> = {
    error: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️"
  };

  const colors: Record<Required<ModalOptions>['type'], string> = {
    error: "#e74c3c",
    success: "#2ecc71",
    warning: "#f39c12",
    info: "#3498db"
  };

  dialog.innerHTML = `
    <div class="dialog-content" style="border-top: 4px solid ${colors[type]}">
      <h2 style="color:${colors[type]}">${icons[type]} ${title}</h2>
      <p>${message}</p>
      <button id="close-dialog" style="background:${colors[type]}">Cerrar</button>
    </div>
  `;

  const closeBtn = dialog.querySelector('#close-dialog') as HTMLButtonElement | null;
  if (closeBtn) {
    closeBtn.onclick = () => dialog?.close();
  }
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  })

  dialog.showModal();
  return dialog;
}
