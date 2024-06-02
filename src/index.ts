import initialize from "./sdk/App";
import "./styles/entry.scss";

(() => {
  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });
})();
