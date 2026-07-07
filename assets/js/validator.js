const Validator = (() => {
  const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
  const LINKEDIN_RE = /linkedin\.com\/in\/[a-zA-Z0-9\-_/]+/i;
  const GITHUB_RE = /github\.com\/[a-zA-Z0-9\-_/]+/i;
  const URL_RE = /(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/;

  function extractContact(text) {
    const email = text.match(EMAIL_RE)?.[0] || null;
    const phone = text.match(PHONE_RE)?.[0]?.trim() || null;
    const linkedin = text.match(LINKEDIN_RE)?.[0] || null;
    const github = text.match(GITHUB_RE)?.[0] || null;
    const urls = text.match(new RegExp(URL_RE, "gi")) || [];
    const portfolio = urls.find(
      (u) => !/linkedin\.com|github\.com/i.test(u) && /\.(com|dev|io|me|net|org|xyz|portfolio)/i.test(u)
    ) || null;
    return {
      email,
      emailValid: email ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) : false,
      phone,
      phoneValid: phone ? phone.replace(/\D/g, "").length >= 7 : false,
      linkedin,
      github,
      portfolio,
    };
  }

  return { extractContact, EMAIL_RE, PHONE_RE, LINKEDIN_RE, GITHUB_RE };
})();
