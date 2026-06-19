(function () {
  var root = document.getElementById("studio-cucurbits");
  if (!root) return;

  var buttons = root.querySelectorAll("[data-set-lang]");
  var html = document.documentElement;

  function setLanguage(lang) {
    root.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang === "ja" ? "ja" : "en");

    for (var i = 0; i < buttons.length; i += 1) {
      var isActive = buttons[i].getAttribute("data-set-lang") === lang;
      buttons[i].classList.toggle("is-active", isActive);
      buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    try {
      window.localStorage.setItem("studio-cucurbits-language-swiss", lang);
    } catch (error) {
      // Local storage can be unavailable in private or restricted browsing modes.
    }
  }

  for (var i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener("click", function () {
      setLanguage(this.getAttribute("data-set-lang"));
    });
  }

  var initialLanguage = "ja";

  try {
    initialLanguage = window.localStorage.getItem("studio-cucurbits-language-swiss") || initialLanguage;
  } catch (error) {
    initialLanguage = "ja";
  }

  if (initialLanguage !== "ja" && initialLanguage !== "en") {
    initialLanguage = "ja";
  }

  setLanguage(initialLanguage);
})();
