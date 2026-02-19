import svgCaptcha from "svg-captcha";

/**
 * In-memory captcha store
 * key   -> captchaId
 * value -> captchaText
 */
const captchaStore = new Map();

/**
 * =========================
 * GENERATE CAPTCHA
 * =========================
 */
export const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    background: "#f3f4f6",
    ignoreChars: "0oO1ilI",
  });

  const captchaId = Date.now().toString() + Math.random().toString(36);

  // store lowercase for case-insensitive match
  captchaStore.set(captchaId, captcha.text.toLowerCase());

  // auto-expire after 2 minutes
  setTimeout(() => {
    captchaStore.delete(captchaId);
  }, 2 * 60 * 1000);

  return {
    id: captchaId,
    svg: captcha.data,
  };
};

/**
 * =========================
 * VERIFY CAPTCHA
 * =========================
 */
export const verifyCaptcha = (captchaId, captchaValue) => {
  if (!captchaId || !captchaValue) return false;

  const stored = captchaStore.get(captchaId);
  if (!stored) return false;

  const isValid = stored === captchaValue.toLowerCase();

  // remove captcha after one use
  captchaStore.delete(captchaId);

  return isValid;
};
