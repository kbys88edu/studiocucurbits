(function () {
  var root = document.getElementById("studio-cucurbits");
  if (!root) return;

  var buttons = root.querySelectorAll("[data-set-lang]");
  var html = document.documentElement;
  var htmlLangByKey = {
    ja: "ja",
    en: "en",
    fr: "fr"
  };

  function setLanguage(lang) {
    if (!htmlLangByKey[lang]) {
      lang = "ja";
    }

    root.setAttribute("data-lang", lang);
    html.setAttribute("lang", htmlLangByKey[lang]);

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

  if (!htmlLangByKey[initialLanguage]) {
    initialLanguage = "ja";
  }

  setLanguage(initialLanguage);
})();
