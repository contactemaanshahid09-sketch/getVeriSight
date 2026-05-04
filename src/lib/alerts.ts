"use client";

import Swal from "sweetalert2";

type AlertType = "success" | "error" | "info" | "warning";

function brandAlertText(text: string) {
  return text.replace(
    /GetVeriSight/g,
    '<span class="gv-alert-brand">Get<span>VeriSight</span></span>',
  );
}

export async function showAlert(
  type: AlertType,
  title: string,
  text: string,
) {
  await Swal.fire({
    icon: type,
    title,
    html: brandAlertText(text),
    confirmButtonColor: "#f97316",
    background: "#ffffff",
    color: "#111827",
    customClass: {
      popup: "gv-alert-popup",
      title: "gv-alert-title",
      htmlContainer: "gv-alert-text",
      confirmButton: "gv-alert-button",
    },
  });
}
