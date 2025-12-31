import axios from "axios";
import FormData from "form-data";

export const scanOCR = async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageBase64 or imageUrl is required",
      });
    }

    // Prevent very large base64 payloads
    if (imageBase64 && imageBase64.length > 8_000_000) {
      return res.status(413).json({
        success: false,
        message: "Image too large. Please upload a smaller image.",
      });
    }

    /* ---------------- OCR FORM DATA ---------------- */
    const formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("language", "eng");

    // OCR.space stability & accuracy
    formData.append("filetype", "JPG");
    formData.append("OCREngine", "2");
    formData.append("scale", "true");
    formData.append("isTable", "false");

    if (imageUrl) {
      formData.append("url", imageUrl);
    } else {
      let dataUri = imageBase64.trim();

      // Ensure valid data URI
      if (!dataUri.startsWith("data:")) {
        dataUri = `data:image/jpeg;base64,${dataUri}`;
      }

      formData.append("base64Image", dataUri);
    }

    /* ---------------- OCR REQUEST ---------------- */
    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 20000,
      }
    );

    const result = response.data;

    /* ---------------- OCR FAILURE ---------------- */
    if (result.OCRExitCode !== 1) {
      return res.status(400).json({
        success: false,
        message: "OCR failed",
        error:
          result.ErrorMessage ||
          result.ErrorDetails ||
          "Unknown OCR error",
      });
    }

    /* ---------------- RAW TEXT ---------------- */
    const rawText = result?.ParsedResults?.[0]?.ParsedText || "";

    /* ---------------- VEHICLE NUMBER EXTRACTION ---------------- */

    // Step 1: normalize OCR text
    let normalizedText = rawText
      .replace(/\n/g, " ")
      .replace(/\s+/g, "")
      .toUpperCase()
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/Z/g, "2")
      .replace(/S/g, "5")
      .replace(/B/g, "8");

    // Step 2: loose Indian plate regex (OCR-friendly)
    const loosePlateRegex =
      /[A-Z]{2,3}[0-9]{1,2}[A-Z]{1,2}[0-9]{3,4}/g;

    let match = normalizedText.match(loosePlateRegex);
    let vehicleNumber = match ? match[0] : null;

    // Step 3: auto-correct common OCR state mistakes
    if (vehicleNumber) {
      vehicleNumber = vehicleNumber
        .replace(/^TH/, "TN") // TH → TN
        .replace(/^TL/, "KL") // TL → KL
        .replace(/^TM/, "MH") // TM → MH
        .replace(/^TN0/, "TN0") // safety
        .replace(/^MH0/, "MH0");
    }

    /* ---------------- RESPONSE ---------------- */
    return res.json({
      success: true,
      rawText,
      vehicleNumber,
    });
  } catch (error) {
    console.error(
      "OCR Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal OCR Error",
      error: error.response?.data || error.message,
    });
  }
};
