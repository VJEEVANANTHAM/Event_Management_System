export function showToast(message = "Success") {
  const toast = document.createElement("div");
  toast.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #fff;
      color: #000;
      border: 1px solid #000;
      border-radius: 6px;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 8l3 3 5-5"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = 9999;
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 50);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}
